// Função para ler os dados do arquivo CSV usando PapaParse
async function lerCSV(nomeArquivo) {
    return new Promise((resolve, reject) => {
        Papa.parse(nomeArquivo, {
            download: true,
            header: true,
            complete: (resultado) => resolve(resultado.data),
            error: (erro) => reject(erro)
        });
    });
}

// Função para organizar os dados na estrutura da carteira
function organizarCarteira(movimentacoes, proventos) {
    const carteira = {};

    // Organizando as movimentações
    movimentacoes.forEach(movimento => {
        const ticket = movimento['Ticket'];
        if (!carteira[ticket]) {
            carteira[ticket] = { Movimentacao: [], Proventos: [], QuantidadeAtual: 0 };
        }
        if (movimento['Operacao'] === 'Compra') {
            carteira[ticket]['QuantidadeAtual'] += parseFloat(movimento['Quantidade']);
        } else if (movimento['Operacao'] === 'Venda') {
            carteira[ticket]['QuantidadeAtual'] -= parseFloat(movimento['Quantidade']);
        }
        carteira[ticket]['Movimentacao'].push({
            Operacao: movimento['Operacao'],
            Data: parseDate(movimento['Data']),
            Quantidade: parseFloat(movimento['Quantidade']),
            ValorUnitario: parseFloat(movimento['Valor Unitario'].replace(',', '.'))
        });
    });

    // Organizando os proventos
    proventos.forEach(provento => {
        const ticket = provento['Ticket'];
        if (!carteira[ticket]) {
            carteira[ticket] = { Movimentacao: [], Proventos: [], QuantidadeAtual: 0 };
        }
        // Calculando a quantidade atual até a data de aquisição dos proventos
        let quantidadeAtualProvento = 0;
        carteira[ticket]['Movimentacao'].forEach(movimento => {
            if (movimento.Data <= parseDate(provento['Data Com'])) {
                if (movimento.Operacao === 'Compra') {
                    quantidadeAtualProvento += movimento.Quantidade;
                } else if (movimento.Operacao === 'Venda') {
                    quantidadeAtualProvento -= movimento.Quantidade;
                }
            }
        });
        carteira[ticket]['Proventos'].push({
            Operacao: provento['Operacao'],
            DataCom: parseDate(provento['Data Com']),
            DataPagamento: parseDate(provento['Data Pag']),
            Quantidade: quantidadeAtualProvento, // Ajustado para incluir a quantidade correta
            ValorUnitario: parseFloat(provento['Valor Unitario'].replace(',', '.'))
        });
    });
    console.log(carteira);

    return carteira;
}

// Função para converter string de data no formato dd/mm/yyyy para objeto Date
function parseDate(dateString) {
    const [day, month, year] = dateString.split('/');
    return new Date(`${year}-${month}-${day}`);
}

// Função para exibir a carteira
function exibirCarteira(carteira) {
    const carteiraDiv = document.getElementById('carteira');
    console.log(carteira);
    for (const ticket in carteira) {
        const ticketDiv = document.createElement('div');
        ticketDiv.innerHTML = `<h2>${ticket}</h2><h3>Movimentação:</h3>`;

        const movimentacaoDiv = document.createElement('div');
        carteira[ticket]['Movimentacao'].forEach(movimento => {
            const movimentoTexto = `- Operação: ${movimento.Operacao}, Data: ${formatDate(movimento.Data)}, Quantidade: ${movimento.Quantidade}, Valor Unitário: ${movimento.ValorUnitario}`;
            movimentacaoDiv.innerHTML += `<p>${movimentoTexto}</p>`;
        });

        ticketDiv.appendChild(movimentacaoDiv);
        ticketDiv.innerHTML += '<h3>Proventos:</h3>';

        const proventosDiv = document.createElement('div');
        carteira[ticket]['Proventos'].forEach(provento => {
            const proventoTexto = `- Operação: ${provento.Operacao}, Data Com: ${formatDate(provento.DataCom)}, Data Pagamento: ${formatDate(provento.DataPagamento)}, Quantidade: ${provento.Quantidade}, Valor Unitário: ${provento.ValorUnitario}`;
            proventosDiv.innerHTML += `<p>${proventoTexto}</p>`;
        });

        ticketDiv.appendChild(proventosDiv);
        carteiraDiv.appendChild(ticketDiv);
    }
}

// Função para formatar objeto Date como string no formato dd/mm/yyyy
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Lendo os dados dos arquivos CSV usando PapaParse
Promise.all([
    lerCSV('movimentacao.csv'),
    lerCSV('proventos.csv')
]).then(([movimentacoes, proventos]) => {
    // Organizando os dados na estrutura da carteira
    const carteira = organizarCarteira(movimentacoes, proventos);

    // Exibindo a carteira
    exibirCarteira(carteira);
}).catch(erro => {
    console.error('Erro ao carregar os dados:', erro);
});
