// Função para salvar os dados da carteira em um arquivo JSON
function saveCarteiraToJSON(carteira) {
    // Converter os dados da carteira para JSON
    const carteiraJSON = JSON.stringify(carteira);

    // Criar um objeto Blob com os dados JSON
    const blob = new Blob([carteiraJSON], { type: 'application/json' });

    // Criar um link de download para o arquivo JSON
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'carteira.json';

    // Adicionar o link ao corpo do documento e clicar nele para iniciar o download
    document.body.appendChild(a);
    a.click();

    // Limpar o URL do objeto Blob após o download
    URL.revokeObjectURL(url);
}


document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

async function fetchData() {
    try {
        const response = await fetch('movimentacao.csv');
        const data = await response.text();
        const parsedData = Papa.parse(data, { header: true }).data; // Use Papa.parse para analisar o CSV

        // Compilar informações da carteira
        const carteira = compileCarteiraInfo(parsedData);

        

        // Renderizar a tabela da carteira com os dados compilados

        renderCarteiraTable(carteira);
        saveCarteiraToJSON(carteira);
    } catch (error) {
        console.error('Erro ao buscar os dados:', error);
    }
}



async function fetchProventosData(carteira) {
    try {
        const response = await fetch('proventos.csv');
        const data = await response.text();
        const parsedData = Papa.parse(data, { header: true }).data;
        updateCarteiraWithProventos(carteira, parsedData);
    } catch (error) {
        console.error('Erro ao buscar os dados dos proventos:', error);
    }
}

function updateCarteiraWithProventos(carteira, proventosData) {
    proventosData.forEach(provento => {
        const ticket = provento.Ticket;
        const valorProvento = provento.Quantidade * parseFloat(provento['Valor Unitario'].replace(',', '.')); // Multiplica a quantidade pelo ValorUnitario
        console.log(valorProvento);

        // Verificar se o ticket existe na carteira e atualizar os proventos pagos
        if (carteira[ticket]) {
            carteira[ticket]['Proventos Pagos'] += valorProvento;
            console.log(`Ticket ${ticket} encontrado na carteira. Proventos pagos: ${carteira[ticket]['Proventos Pagos']}`);
        } else {
            console.warn(`Ticket ${ticket} encontrado em proventos.csv, mas não encontrado na carteira.`);
        }
    });

    // Atualizar a tabela da carteira com os novos dados dos proventos pagos
}





// Função para compilar informações da carteira
function compileCarteiraInfo(movimentacao) {
    const carteira = {};

    // Iterar sobre cada linha de movimentação
    movimentacao.forEach(row => {
        const ticket = row.Ticket;

        // Verificar se o ticket já existe na carteira
        if (!carteira[ticket]) {
            // Se o ticket não existir na carteira, criar um novo objeto para ele
            carteira[ticket] = {
                Ticket: row.Ticket,
                Tipo: row.Tipo,
                Gestora: row.Gestora,
                Nome: row.Nome,
                CNPJ: row.CNPJ,
                Setor: row.Setor,
                Subsetor: row.Subsetor,
                Segmento: row.Segmento,
                Categoria: row.Categoria,
                Administrador: row.Administrador,
                'CNPJ ADM': row['CNPJ ADM'],
                ADM: row.ADM,
                Cotas: 0,
                'Valor Pago': 0,
                'Preço Médio': 0,
                'Valor Patrimonial': 0,
                'Lucro/Prejuízo': 0,
                'Proventos Pagos': 0
            };
        }

        // Atualizar os valores da carteira
        const existingTicket = carteira[ticket];
        const newQuantity = parseInt(row.Quantidade) || 0;
        const newValue = row['Quantidade'] * parseFloat(row['Valor Unitario'].replace(',', '.'));

        // Atualizar a quantidade de cotas e o valor pago
        existingTicket.Cotas += newQuantity;
        existingTicket['Valor Pago'] += newValue;

        // Atualizar o preço médio
        if (existingTicket.Cotas > 0) {
            // Obter o preço médio anterior e as cotas anteriores
            const precoMedioAnterior = existingTicket['Preço Médio'];
            const cotasAnteriores = existingTicket.Cotas - newQuantity;

            // Calcular o novo preço médio
            const novoPreco = parseFloat(row['Valor Unitario'].replace(',', '.')); // Substituir vírgula por ponto e converter para número
            const novoPrecoMedio = ((precoMedioAnterior * cotasAnteriores) + (novoPreco * newQuantity)) / existingTicket.Cotas;

            // Atualizar o preço médio se for um número válido
            if (!isNaN(novoPrecoMedio)) {
                existingTicket['Preço Médio'] = novoPrecoMedio;
            } else {
                console.error('Novo preço médio inválido:', novoPrecoMedio);
            }
        }

        // Atualizar os demais campos
        existingTicket['Valor Patrimonial'] += parseFloat(row['Valor Patrimonial']) || 0;
        existingTicket['Lucro/Prejuízo'] += parseFloat(row['Lucro/Prejuízo']) || 0;
        // existingTicket['Proventos Pagos'] += parseFloat(row['Proventos Pagos']) || 0;
    });



    fetchProventosData(carteira);
    console.log(carteira);

    // Converter o objeto carteira para um array
    const carteiraArray = Object.values(carteira);

    return carteiraArray;
}










// Função para renderizar a tabela com os dados da carteira
function renderCarteiraTable(carteira) {
    const table = document.createElement('table');
    const headerRow = table.insertRow();
    for (const key in carteira[0]) {
        const headerCell = document.createElement('th');
        headerCell.textContent = key;
        headerRow.appendChild(headerCell);
    }
    carteira.forEach(item => {
        const row = table.insertRow();
        for (const key in item) {
            const cell = row.insertCell();
            cell.textContent = item[key];
        }
    });
    document.getElementById('tabelaCarteira').appendChild(table);
}

// Chamada da função principal para gerar a carteira JSON
generateCarteiraJSON();

