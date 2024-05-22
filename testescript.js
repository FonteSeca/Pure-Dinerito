


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

// Função para formatar objeto Date como string no formato dd/mm/yyyy
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
function exibirCarteira(carteira) {
    let movimentacoesHTML = '';
    let proventosHTML = '';

    console.log(carteira["CPLE6"]);

    for (const ticket in carteira) {
        carteira[ticket]['Movimentacao'].forEach(movimento => {
            movimentacoesHTML += `<tr><td>${movimento.Operacao}</td><td>${formatDate(movimento.Data)}</td><td>${ticket}</td><td>${movimento.Quantidade}</td><td>${movimento.ValorUnitario}</td></tr>`;
        });

        carteira[ticket]['Proventos'].forEach(provento => {
            proventosHTML += `<tr><td>${ticket}</td><td>${provento.Operacao}</td><td>${formatDate(provento.DataCom)}</td><td>${formatDate(provento.DataPagamento)}</td><td>${provento.Quantidade}</td><td>${provento.ValorUnitario}</td><td>${provento.Quantidade * provento.ValorUnitario}</td></tr>`;
            
        });
    }

    

    // Verifica se o elemento com ID "proventos" existe antes de definir seu HTML interno
    const proventosTable = document.getElementById('proventos');
    if (proventosTable) {
        proventosTable.innerHTML = proventosHTML;
    } else {
        console.error('Elemento com ID "proventos" não encontrado.');
    }

    $(document).ready( function () {
        $('#tabela').DataTable();
    } );



    // Adicionar um ouvinte de eventos para a tabela que é acionado sempre que a tabela é filtrada
    $('#tabela').on('search.dt', function () {
        // Obter os dados filtrados da tabela
        const dadosFiltrados = $('#tabela').DataTable().rows({ search: 'applied' }).data().toArray();

        // Recriar o gráfico com os dados filtrados
        criarGrafico(carteira, dadosFiltrados);
    });
    
}


function criarGrafico(carteira) {
    const dadosPorMes = {};
    
    // Agrupar os proventos por mês (usando a data de pagamento)
    for (const ticket in carteira) {
        carteira[ticket]['Proventos'].forEach(provento => {
            const mesAno = `${provento.DataPagamento.getMonth() + 1}/${provento.DataPagamento.getFullYear()}`;
            if (!dadosPorMes[mesAno]) {
                dadosPorMes[mesAno] = 0;
            }
            dadosPorMes[mesAno] += provento.Quantidade * provento.ValorUnitario;
        });
    }

    // Preparar os dados para o gráfico
    const meses = Object.keys(dadosPorMes);
    const valores = Object.values(dadosPorMes);

    // Criar o gráfico de barras
    const ctx = document.getElementById('grafico').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: meses,
            datasets: [{
                label: 'Proventos por Mês (Data de Pagamento)',
                data: valores,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
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
