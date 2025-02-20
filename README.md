# Projeto Digisac | Bitrix24 |  Integration

Este projeto é uma aplicação que se integra com as APIs do **Digisac** e **Bitrix24** para acessar conversas de um contato, encaminhá-las para o **OpenAI** (GPT) para gerar um resumo e, em seguida, importar essas informações para o Bitrix24 na aba de empresas. 

A aplicação usa variáveis de ambiente para configurar as URLs do Digisac e Bitrix24, bem como outras configurações sensíveis. O front-end utiliza **Python** e **JavaScript** para consumir as APIs.

![Imagem do projeto](https://i.postimg.cc/Kz095kBt/resumaione.png)!
[Imagem do projeto](https://i.postimg.cc/SQX5Gd1s/resumaitwo.png)!
[Imagem do projeto](https://i.postimg.cc/15sGz5FQ/resumaithree.png)!
[Imagem do projeto](https://i.postimg.cc/4yZ9nBm5/resumaifor.png)!


## Funcionalidades

- **Integração com a API do Digisac**: Obtém o conteúdo de atendimentos do Digisac.
- **Conexão com o OpenAI GPT**: Processa as conversas e retorna um resumo da interação.
- **Importação para o Bitrix24**: Transfere o resumo da conversa para o Bitrix24 na aba de empresas.
- **Carregamento dinâmico de variáveis de ambiente**: O projeto utiliza um arquivo `.env` para configurar URLs e chaves de API de forma segura.
- **Front-end dinâmico**: Desenvolvido em HTML, CSS e JavaScript para manipular os dados e interações do usuário.

## Estrutura do Projeto

/
├── .env # Arquivo de configuração com variáveis de ambiente 
├── import.py # Arquivo principal para integração usando Python 
├── templates/
│           └── index.html # Front-end principal do projeto 
├── static/ # Diretório contendo arquivos estáticos
│        ├── js/
│            └── script.js # Arquivo JavaScript que faz chamadas às APIs 
│        ├── img/
│            └── images # Imagens usadas na aplicação 
│        ├── css/
│            └── style.css # Arquivo CSS para estilização 
├── README.md # Este arquivo de documentação 


## Instalação

### Pré-requisitos

Certifique-se de ter o **Python** instalado em sua máquina e, opcionalmente, o **Node.js** (caso utilize funcionalidades adicionais com JavaScript).

### Instalar dependências

Para instalar as dependências necessárias, execute os seguintes comandos:

```bash
pip install flask
pip install request
pip install jsonify
pip install python-dotenv
```

## Configuração do Projeto
**Crie um arquivo chamado .env na raiz do projeto.**
**Insira suas configurações no seguinte formato:**
### Chave da API do OpenAI
chave_key_gpt=SUA-CHAVE-API-OPENAI

### Chave da API do Digisac
chave_key_digisac=SUA-CHAVE-API-DIGISAC

### Link do domínio Digisac
link_domain_digisac=LINK-DO-SEU-DOMINIO-DIGISAC

### Link do domínio Bitrix24
LINK_DOMAIN_BITRIX=LINK-DO-SEU-DOMINIO-BITRIX

```bash
#Key open ai
chave_key_gpt="your-api-key-openai"

# Key digisac
chave_key_digisac="your-api-key-digisac"

# Domain digisac
link_domain_digisac="your-domain-digisac"
```

**O arquivo .env será automaticamente carregado pelo código para configurar as variáveis de ambiente.**

Copyright (c) 2025 Elton Santos

Todos os direitos reservados.

Este software é fornecido exclusivamente para o uso do autor Elton Santos. 
Não é permitida a redistribuição, modificação, cópia ou uso comercial deste software por terceiros sem autorização expressa do autor. 

O software é fornecido "como está", sem garantias de qualquer tipo, expressas ou implícitas.