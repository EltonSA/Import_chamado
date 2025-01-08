const chave_01 = localStorage.getItem("chaveBitrix_01");
const chave_02 = localStorage.getItem("chaveBitrix_02");
const link_domain_bitrix = localStorage.getItem("linkBitrix");

const BITRIX_URL = `https://${link_domain_bitrix}/rest/301/${chave_01}/crm.company.list.json`;
const CnpjField = 'UF_CRM_1701275490640';

// Função para formatar o CNPJ
function formatarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, ''); // Remove qualquer coisa que não seja número
    if (cnpj.length <= 2) {
        return cnpj;
    }
    if (cnpj.length <= 5) {
        return cnpj.replace(/(\d{2})(\d{1})/, '$1.$2');
    }
    if (cnpj.length <= 8) {
        return cnpj.replace(/(\d{2})(\d{3})(\d{1})/, '$1.$2.$3');
    }
    if (cnpj.length <= 12) {
        return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3/$4');
    }
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

// Adicionando o evento de input no campo CNPJ
document.getElementById('cnpj').addEventListener('input', function(event) {
    let cnpj = event.target.value;
    event.target.value = formatarCNPJ(cnpj);
});

// Função para validar CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[\.\/-]/g, '');

    if (cnpj.length !== 14 || /^\d{1}(\1{13})$/.test(cnpj)) {
        return false;
    }

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) {
        return false;
    }

    tamanho++;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos.charAt(1));
}

document.getElementById('protocolForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const protocolo = document.getElementById('protocol').value;
    const chatType = document.getElementById('chatType').value;
    const loadingMessage = document.getElementById('loadingContainer');
    const resultBox = document.getElementById('result');
    const importBox = document.getElementById('importBox');

    if (!protocolo) {
        alert('Por favor, insira o número do protocolo.');
        return;
    }

    // Mostrar mensagem de carregamento e ocultar outros elementos
    loadingMessage.style.display = 'block';
    resultBox.style.display = 'none';
    importBox.style.display = 'none';

    fetch('/consultar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 'protocol': protocolo })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na consulta: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            loadingMessage.style.display = 'none'; // Ocultar a mensagem de carregamento

            if (data.error) {
                resultBox.style.display = 'block';
                document.getElementById('summaryData').textContent = "Erro: " + data.error;
            } else {
                resultBox.style.display = 'block';
                document.getElementById('summaryData').textContent = data.resumo;
                importBox.style.display = 'block';
            }
        })
        .catch(error => {
            loadingMessage.style.display = 'none'; // Ocultar a mensagem de carregamento em caso de erro
            alert('Erro ao consultar o protocolo: ' + error.message);
        });
});

document.getElementById('bitrixForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const cnpj = document.getElementById('cnpj').value;
    const resumo = document.getElementById('summaryData').textContent.trim();
    const responsibleId = document.getElementById('responsible').value;
    const protocolo = document.getElementById('protocol').value;
    const chatType = document.getElementById('chatType').value;

    if (!cnpj || !resumo || !responsibleId) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    if (!validarCNPJ(cnpj)) {
        alert('CNPJ inválido. Por favor, insira um CNPJ válido.');
        return;
    }

    fetch(BITRIX_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            order: { "DATE_CREATE": "ASC" },
            filter: { [CnpjField]: cnpj },
            select: ["ID", "TITLE"]
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.result && data.result.length > 0) {
            const company = data.result[0];
            const companyId = company.ID;
            const companyName = company.TITLE;

            fetch(`https://${link_domain_bitrix}/rest/301/${chave_02}/tasks.task.add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fields: {
                        TITLE: `${chatType} em ${new Date().toLocaleString()}`,
                        RESPONSIBLE_ID: responsibleId, // Responsável selecionado
                        DEADLINE: "2024-12-15T16:00:00+03:00",
                        DESCRIPTION: `Protocolo Digisac: ${protocolo}\n\n${resumo}`,
                        UF_CRM_TASK: [`CO_${companyId}`] // Vincula à empresa encontrada
                    }
                })
            })
            .then(taskResponse => taskResponse.json())
            .then(taskData => {
                if (taskData.result) {
                    alert(`Tarefa criada com sucesso para a empresa: ${companyName}`);
                } else {
                    alert('Erro ao criar a tarefa no Bitrix.');
                }
            })
            .catch(error => {
                console.error('Erro ao criar a tarefa no Bitrix:', error);
                alert('Erro ao criar a tarefa no Bitrix.');
            });
        } else {
            alert('Nenhuma empresa encontrada para o CNPJ informado.');
        }
    })
    .catch(error => {
        console.error('Erro ao consultar empresa no Bitrix:', error);
        alert('Erro ao consultar empresa no Bitrix.');
    });
});


// Copiar apenas o número do protocolo e o resumo da IA
document.getElementById('copyButton').addEventListener('click', function () {
    const protocoloNumero = document.getElementById('protocol').value.trim();
    const resumoTexto = document.getElementById('summaryData').textContent.trim();

    if (!protocoloNumero || !resumoTexto) {
        alert('Por favor, certifique-se de que o protocolo e o resumo estejam preenchidos.');
        return;
    }

    const textoCopiar = `Protocolo: ${protocoloNumero}\nResumo: ${resumoTexto}`;

    navigator.clipboard.writeText(textoCopiar)
        .then(() => {
            alert('Protocolo e Resumo copiados para a área de transferência!');
        })
        .catch(err => {
            console.error('Erro ao copiar usando Clipboard API:', err);
            const textarea = document.createElement('textarea');
            textarea.value = textoCopiar;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                alert('Protocolo e Resumo copiados com sucesso!');
            } catch (execErr) {
                console.error('Erro ao tentar copiar com execCommand:', execErr);
                alert('Erro ao copiar para a área de transferência.');
            }
            document.body.removeChild(textarea);
        });
});

function showLoading() {
    const loadingContainer = document.getElementById('loadingContainer');
    const resultContainer = document.getElementById('result');

    // Exibir a animação de carregamento
    loadingContainer.style.display = 'block';

    // Ocultar o resultado anterior, se houver
    resultContainer.style.display = 'none';
}
