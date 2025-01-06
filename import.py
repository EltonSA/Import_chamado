from flask import Flask, render_template, request, jsonify
import requests
import json

app = Flask(__name__)

# URL base da API e endpoint completo
BASE_URL = "https://setuptecnologia.digisac.co/api/v1"
ENDPOINT = "/tickets/export"

# Cabeçalhos para a requisição
HEADERS = {
    "Authorization": "Bearer API_DIGISAC",
    "Content-Type": "application/json"
}

# API key do OpenAI
OPENAI_API_KEY = "APUI_KEY"

# Função para fazer a consulta no ChatGPT
def gerar_resumo(texto):
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENAI_API_KEY}"
    }

    payload = {
        "model": "gpt-4",
        "messages": [
            {"role": "system", "content": "Você é um assistente de resumo de conversas, que vai coletar o nome do cliente, nome do atendente, dia e hora do atendimento"},
            {"role": "user", "content": texto}
        ]
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 200:
        resposta = response.json()
        resumo = resposta['choices'][0]['message']['content']
        return resumo
    else:
        return "Erro ao gerar resumo com o ChatGPT."

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/consultar', methods=['POST'])
def consultar_protocolo():
    protocolo = request.form['protocol']

    if not protocolo:
        return jsonify({"error": "Por favor, insira o número do protocolo."}), 400

    # Corpo da requisição
    BODY = {
        "protocol": protocolo
    }

    url = f"{BASE_URL}{ENDPOINT}"

    try:
        # Fazendo a requisição POST para a API
        response = requests.post(url, headers=HEADERS, json=BODY)
        response.raise_for_status()  # Levanta exceção para erros HTTP

        # Verificando o tipo de conteúdo retornado
        content_type = response.headers.get('Content-Type')

        if 'application/json' in content_type:
            # Processando a resposta JSON
            try:
                data = response.json()
                # Enviando o conteúdo da resposta para o ChatGPT
                texto_resposta = json.dumps(data, indent=4, ensure_ascii=False)
                resumo = gerar_resumo(texto_resposta)
                return jsonify({"resumo": resumo, "dados": data})
            except json.JSONDecodeError:
                return jsonify({"error": "A resposta não está em formato JSON válido."}), 500
        else:
            # Caso a resposta não seja em JSON, vamos enviar o conteúdo bruto (texto) para o ChatGPT
            texto_resposta = response.text  # Pegando o conteúdo bruto da resposta
            resumo = gerar_resumo(texto_resposta)
            return jsonify({"resumo": resumo, "dados": response.text})

    except requests.exceptions.HTTPError as http_err:
        return jsonify({"error": f"Erro HTTP ocorreu: {http_err}"}), 500
    except requests.exceptions.RequestException as req_err:
        return jsonify({"error": f"Erro na requisição: {req_err}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
