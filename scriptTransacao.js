// Inicialize o cliente Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const supabaseUrl = 'https://sfvrdmhpvaluyfnbptny.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmdnJkbWhwdmFsdXlmbmJwdG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyNjM5ODgsImV4cCI6MjAzMTgzOTk4OH0.kj4e5YgSnlQwsH0eUR7iEhOZqgi06oD3RKMhNMqSJqg"
const supabase = createClient(supabaseUrl, supabaseKey)

// scriptUso.js

import { globalDatas as globalDatae } from "./dados.js";

// Agora você pode usar globalDatae neste script


// Função assíncrona para usar os dados
async function usarDados() {
    try {
        // Chama a função globalDatas para obter os dados
        const dados = await globalDatae();
        
        // Retorna os dados para que possam ser usados fora da função
        return dados;
    } catch (error) {
        // Em caso de erro, lida com ele de acordo com sua lógica de tratamento de erros
        console.error('Erro ao usar os dados:', error);
        // Retorna null em caso de erro
        return null;
    }
}


// Chama a função usarDados para começar a usar os dados
const globalData = await usarDados();

console.log('Carteira Consolidada: ', globalData);

// Inicio do Código

renderTableTransacao(globalData.movimentacao, 'tabela-transacao');



function puxando() {
    updateFiltersAndRender(globalData.proventos, globalData.carteira);
}


document.getElementById('applyFilters').addEventListener('click', () => {
    const tickerFilter = document.getElementById('ticketFilter').value;
    const operationFilter = document.getElementById('operationFilter').value;
    const tipoTicketFilter = document.getElementById('tipoTicketFilter').value;


    console.log('Filtros selecionados:', { tickerFilter, operationFilter, tipoTicketFilter });

    const carteiraData = globalData.movimentacao;
    const filteredData = filterData(carteiraData, tickerFilter, operationFilter, tipoTicketFilter);

    // renderTable(filteredData);
    renderTableTransacao(filteredData, 'tabela-transacao');
    console.log(filteredData);
    
});




// Função para filtrar os dados
function filterData(data, filterTicket, filterOperation, filterTipoTicket) {
    
    console.log('Filtros aplicados:', { filterTicket, filterOperation, filterTipoTicket});

    const filteredData = data.filter(item => {
        const operacao = item.Operacao;
        const ticket = item.Ticket;
        const tipoTicket = globalData.carteira.find(carteiraItem => carteiraItem.Ticket === ticket)?.Tipo;

        return (filterOperation === 'all' || filterOperation === operacao) &&
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
    const ticketFilter = 'monthly';
    const operationFilter = 'all';
    const tipoTicketFilter = 'all';
    const filteredData = filterData(proventosData, ticketFilter, operationFilter, tipoTicketFilter);

    // renderTableCarteira(filteredData, 'tabela-proventos');
    // renderTable(filteredData);
    //plotProventosGraph(filteredData, timeFilter, typeFilter, ticketFilter, tipoTicketFilter);
}


// Função para atualizar as opções do filtro de tipo de ticket no HTML
function updateTipoTicketFilterOptions(dataCarteira) {
    const tipoTicketFilterSelect = document.getElementById('tipoTicketFilter');

    tipoTicketFilterSelect.innerHTML = '';

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'Todos Tipos de Tickers';
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
   
    if (checkElementById('tabela-transacao') === true) {
        renderTableTransacao(globalData.movimentacao, 'tabela-transacao');
    }

}

function renderTableTransacaao(data, idElemento) {
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
            <th>Ticket</th>
            <th>Operação</th>
            <th>Data</th>
            <th>Quantidade</th>
            <th>Valor Unitário</th>
            <th>Valor Total</th>
            <th>Editar</th>
            </tr>
        </thead>
    `;
    
    const tbody = document.createElement('tbody');
    
    data.forEach(item => {
        const valorUnitario = parseFloat(item['Valor Unitario']);
        const quantidade = parseFloat(item['Quantidade']);
        const valorPago = valorUnitario * quantidade;
        item['Valor Pago'] = valorPago.toFixed(2);

        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${item['Ticket']}</td>
        <td>${item['Operacao']}</td>
        <td>${item['Data']}</td>
        <td>${item['Quantidade']}</td>
        <td>R$ ${item['Valor Unitario']}</td>
        <td>R$ ${item['Valor Pago']}</td>
        <td><button class="btn-editar">Editar</button></td>
        `;
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    document.getElementById(idElemento).appendChild(table);
}

function renderTableTransacao(data, idElemento) {
    const table = document.querySelector(`#tabela-transacao`);

    console.log(table);
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
        <td>${item['Data']}</td>
        <td>${item['Quantidade']}</td>
        <td>R$ ${item['Valor Unitario']}</td>
        <td>R$ ${item['Valor Pago']}</td>
        <td><button class="btn-editar">Editar</button></td>
        `;
        tbody.appendChild(row);
    });
}


