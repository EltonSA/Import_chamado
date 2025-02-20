from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import os
import requests
import json
import tiktoken

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

app = Flask(__name__)

# Configuração de URLs e endpoints
BASE_URL = os.getenv("link_domain_digisac")
ENDPOINT = "/api/v1/tickets/export"
FULL_URL = f"https://{BASE_URL}{ENDPOINT}"

# Cabeçalhos para a requisição
HEADERS = {
    "Authorization": f"Bearer {os.getenv('chave_key_digisac')}",
    "Content-Type": "application/json"
}

# API key do OpenAI
OPENAI_API_KEY = os.getenv('chave_key_gpt')

# Inicializa o tokenizador do GPT-4 turbo
encoder = tiktoken.get_encoding("cl100k_base")

# Função para gerar resumo com o ChatGPT
def gerar_resumo(texto):
    # Tokenizar o texto
    tokens = encoder.encode(texto)
    
    # Verificar se o texto ultrapassa o limite de tokens do GPT-3
    if len(tokens) > 4000:  # Limite aproximado para GPT-3
        return "Erro: O texto é muito longo. Reduza o tamanho do conteúdo."

    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }

    payload = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {
                "role": "system",
                "content": (
                    "Você é especialista por resumir o atendimento para registro de informações."
                    " Deve extrair o nome do cliente, data e hora, descrição (resumo do atendimento),"
                    " pontuar o que o cliente relatou e status final (resolvido ou não)."
                    " Para cada extração, quebre as duas linhas para melhor leitura."
                )
            },
            {"role": "user", "content": texto}
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()  # Levanta uma exceção para erros HTTP
        resposta = response.json()
        resumo = resposta['choices'][0]['message']['content']
        return resumo
    except requests.exceptions.RequestException as e:
        return f"Erro ao gerar resumo com o ChatGPT: {e}"
    except (KeyError, IndexError):
        return "Erro ao processar a resposta do ChatGPT."

# Rota principal
@app.route('/')
def index():
    return render_template('index.html')

# Rota para consultar um protocolo
@app.route('/consultar', methods=['POST'])
def consultar_protocolo():
    protocolo = request.form.get('protocol')

    if not protocolo:
        return jsonify({"error": "Por favor, insira o número do protocolo."}), 400

    # Corpo da requisição
    BODY = {"protocol": protocolo}

    try:
        # Fazendo a requisição POST para a API do Digisac
        response = requests.post(FULL_URL, headers=HEADERS, json=BODY)
        response.raise_for_status()

        # Verificando o tipo de conteúdo retornado
        content_type = response.headers.get('Content-Type', '')

        if 'application/json' in content_type:
            try:
                data = response.json()
                texto_resposta = json.dumps(data, indent=4, ensure_ascii=False)
                resumo = gerar_resumo(texto_resposta)
                return jsonify({"resumo": resumo, "dados": data})
            except json.JSONDecodeError:
                return jsonify({"error": "A resposta não está em formato JSON válido."}), 500
        else:
            # Caso a resposta não seja JSON, processa como texto
            texto_resposta = response.text
            resumo = gerar_resumo(texto_resposta)
            return jsonify({"resumo": resumo, "dados": texto_resposta})

    except requests.exceptions.HTTPError as http_err:
        return jsonify({"error": f"Erro HTTP: {http_err}"}), 500
    except requests.exceptions.RequestException as req_err:
        return jsonify({"error": f"Erro na requisição: {req_err}"}), 500

# Executa o aplicativo Flask
if __name__ == '__main__':
    app.run(debug=True, port=5005)
