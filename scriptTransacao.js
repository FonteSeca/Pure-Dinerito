
function puxando() {
    updateFiltersAndRender(globalData.proventos, globalData.carteira);
}


document.getElementById('applyFilters').addEventListener('click', () => {
    const timeFilter = document.getElementById('timeFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const ticketFilter = document.getElementById('ticketFilter').value;
    const tipoTicketFilter = document.getElementById('tipoTicketFilter').value;

    console.log('Filtros selecionados:', { timeFilter, typeFilter, ticketFilter, tipoTicketFilter });

    const proventosData = globalData.proventos;
    const filteredData = filterData(proventosData, timeFilter, typeFilter, ticketFilter, tipoTicketFilter);

    // renderTable(filteredData);
    renderTableProventos(filteredData, 'tabela-proventos');
    console.log('teste');
    plotProventosGraph(filteredData, timeFilter, typeFilter, ticketFilter, tipoTicketFilter);
});




// Função para filtrar os dados
function filterData(data, groupBy, filterType, filterTicket, filterTipoTicket) {
    
    console.log('Filtros aplicados:', { filterType, filterTicket, filterTipoTicket });

    const filteredData = data.filter(item => {
        const operacao = item.Operacao;
        const ticket = item.Ticket;
        const tipoTicket = globalData.carteira.find(carteiraItem => carteiraItem.Ticket === ticket)?.Tipo;

        return (filterType === 'all' || filterType === operacao) &&
               (filterTicket === 'all' || filterTicket === ticket) &&
               (filterTipoTicket === 'all' || filterTipoTicket === tipoTicket);
    });

    
    return filteredData;
}







// Função para extrair uma lista de tipos de tickets únicos dos dados da carteira
function extractUniqueTipoTickets(dataCarteira) {
    const uniqueTipoTickets = new Set();

    dataCarteira.forEach(item => {
        uniqueTipoTickets.add(item.Tipo);
    });

    return Array.from(uniqueTipoTickets).sort();
}

// Função para extrair uma lista de tickets únicos dos dados
function extractUniqueTickets(data) {
    const uniqueTickets = new Set(); // Usando um conjunto para garantir a exclusividade dos tickets

    // Percorre os dados e adiciona cada ticket ao conjunto
    data.forEach(item => {
        uniqueTickets.add(item.Ticket);
    });

    // Retorna uma lista de tickets únicos em ordem alfabética
    return Array.from(uniqueTickets).sort();
}

// Função para atualizar as opções do filtro de ticket no HTML
function updateTicketFilterOptions(data) {
    const ticketFilterSelect = document.getElementById('ticketFilter');

    // Limpa as opções existentes
    ticketFilterSelect.innerHTML = '';

    // Adiciona a opção "Todos"
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'Todos os Tickers';
    ticketFilterSelect.appendChild(allOption);

    // Extrai uma lista de tickets únicos dos dados
    const uniqueTickets = extractUniqueTickets(data);

    // Adiciona as opções de ticket ao elemento select
    uniqueTickets.forEach(ticket => {
        const option = document.createElement('option');
        option.value = ticket;
        option.textContent = ticket;
        ticketFilterSelect.appendChild(option);
    });
}

// Função para atualizar os filtros e renderizar os dados
function updateFiltersAndRender(proventosData, carteiraData) {
    // Atualizar filtros
    updateTicketFilterOptions(proventosData);
    updateTipoTicketFilterOptions(carteiraData);

    // Renderizar tabela e gráfico
    const timeFilter = 'monthly';
    const typeFilter = 'all';
    const ticketFilter = 'all';
    const tipoTicketFilter = 'all';
    const filteredData = filterData(proventosData, timeFilter, typeFilter, ticketFilter, tipoTicketFilter);

    renderTableProventos(filteredData, 'tabela-proventos');
    // renderTable(filteredData);
    plotProventosGraph(filteredData, timeFilter, typeFilter, ticketFilter, tipoTicketFilter);
}


// Função para atualizar as opções do filtro de tipo de ticket no HTML
function updateTipoTicketFilterOptions(dataCarteira) {
    const tipoTicketFilterSelect = document.getElementById('tipoTicketFilter');

    tipoTicketFilterSelect.innerHTML = '';

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'Todoss Tipos de Tickers';
    tipoTicketFilterSelect.appendChild(allOption);

    const uniqueTipoTickets = extractUniqueTipoTickets(dataCarteira);

    uniqueTipoTickets.forEach(tipoTicket => {
        const option = document.createElement('option');
        option.value = tipoTicket;
        option.textContent = tipoTicket;
        tipoTicketFilterSelect.appendChild(option);
    });
}

puxando();


function checkElementById(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        console.log(`O elemento com ID "${elementId}" existe na página.`);
        return true;
    } else {
        console.log(`O elemento com ID "${elementId}" não existe na página.`);
        return false;
    }
}

verifica();

function verifica() {


    
    if (checkElementById('tabela-proventos') === true) {
        renderTableProventos(globalData.proventos, 'tabela-proventos');
    }

}

function renderTableProventos(data, idElemento) {
    const table = document.querySelector(`#${idElemento} table`);
    const tbody = table.querySelector('tbody');

    // Limpa o conteúdo existente do tbody
    tbody.innerHTML = '';

    data.forEach(item => {
        const valorUnitario = parseFloat(item['Valor Unitario']);
        const quantidade = parseFloat(item['Quantidade']);
        const valorPago = valorUnitario * quantidade;
        item['Valor Pago'] = valorPago.toFixed(2);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item['Ticket']}</td>
            <td>${item['Operacao']}</td>
            <td>${item['Data Com']}</td>
            <td>${item['Data Pag']}</td>
            <td>${item['Quantidade']}</td>
            <td>R$ ${item['Valor Unitario']}</td>
            <td>R$ ${item['Valor Pago']}</td>
            <td><button class="btn-editar">Editar</button></td>
        `;
        tbody.appendChild(row);
    });
}