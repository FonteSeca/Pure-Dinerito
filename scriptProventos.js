// Inicialize o cliente Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const supabaseUrl = 'https://sfvrdmhpvaluyfnbptny.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmdnJkbWhwdmFsdXlmbmJwdG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyNjM5ODgsImV4cCI6MjAzMTgzOTk4OH0.kj4e5YgSnlQwsH0eUR7iEhOZqgi06oD3RKMhNMqSJqg"
const supabase = createClient(supabaseUrl, supabaseKey)

// scriptUso.js

// Importando globalDatas de dados.js com um nome diferente
import { globalDatas as globalDatae } from "./dados.js";

// Agora você pode usar globalDatae neste script
console.log(globalDatae);

let globalData = globalDatae;

function puxando() {
    updateFiltersAndRender(globalData.proventos, globalData.carteira);
}

function renderTable(data) {
    const tableContainer = document.getElementById('tabela');
    tableContainer.innerHTML = ''; // Limpa a tabela existente

    if (data.length === 0) {
        tableContainer.textContent = 'Nenhum dado encontrado para os filtros selecionados.';
        return;
    }

    const table = document.createElement('table');
    const headerRow = table.insertRow();
    for (const key in data[0]) {
        const headerCell = document.createElement('th');
        headerCell.textContent = key;
        headerRow.appendChild(headerCell);
    }
    data.forEach(item => {
        const row = table.insertRow();
        for (const key in item) {
            const cell = row.insertCell();
            cell.textContent = item[key];
        }
    });
    tableContainer.appendChild(table);
}


function parseDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

let chart = null; // Variável global para armazenar o objeto de gráfico


function plotProventosGraph(data, groupBy = 'monthly', filterType = 'all', filterTicket = 'all', filterTipoTicket = 'all') {
    

    const canvas = document.getElementById('graficoProventos');
    const ctx = canvas.getContext('2d');

    if (chart !== null) {
        chart.destroy();
    }

    const groupedProventos = {};

    data.forEach(item => {
        const date = parseDate(item['Data Pag']);
        const groupKey = groupBy === 'annual' ? date.getFullYear() : `${date.getMonth() + 1}/${date.getFullYear()}`;
        const valorUnitario = parseFloat(item['Valor Unitario']);
        const quantidade = parseFloat(item['Quantidade']);
        const valorPago = valorUnitario * quantidade;
        const operacao = item.Operacao;
        const ticket = item.Ticket;

        if (!groupedProventos[groupKey]) {
            groupedProventos[groupKey] = { Rendimento: 0, JCP: 0 };
        }

        if ((filterType === 'all' || filterType === operacao) && (filterTicket === 'all' || filterTicket === ticket)) {
            groupedProventos[groupKey][operacao] += valorPago;
        }
    });

    const labels = Object.keys(groupedProventos).sort((a, b) => {
        const [partA1, partA2] = a.split('/').map(Number);
        const [partB1, partB2] = b.split('/').map(Number);
        if (groupBy === 'annual') {
            return partA1 - partB1;
        } else {
            return partA2 === partB2 ? partA1 - partB1 : partA2 - partB2;
        }
    });

    const datasets = [];

    if (filterType === 'all') {
        datasets.push({
            label: 'Rendimento',
            data: labels.map(label => groupedProventos[label].Rendimento),
            backgroundColor: 'rgba(175, 175, 175, 1)',
            borderRadius: 5,
            borderColor: 'white',
            borderWidth: 0
        });

        datasets.push({
            label: 'JCP',
            data: labels.map(label => groupedProventos[label].JCP),
            backgroundColor: 'rgba(128, 128, 128, 1)',
            borderRadius: 5,
            borderColor: 'white',
            borderWidth: 0
        });
    } else {
        datasets.push({
            label: filterType,
            data: labels.map(label => groupedProventos[label][filterType]),
            backgroundColor: 'rgba(75, 192, 192, 1)',
            borderRadius: 5,
            borderColor: 'white',
            borderWidth: 0
        });
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false // Remove grade horizontal (do eixo X)
                    },
                    display: true,
                    title: {
                        display: true,
                        text: groupBy === 'annual' ? 'Ano' : 'Mês/Ano'
                    }
                },
                y: {
                    stacked: true,
                    grid: {
                        display: true // Remove grade horizontal (do eixo X)
                    },
                    display: true,
                    title: {
                        display: false,
                        text: 'Valor Pago (R$)'
                    }
                }
            }
        }
    });
}




document.getElementById('applyFilters').addEventListener('click', () => {
    const timeFilter = document.getElementById('timeFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    const ticketFilter = document.getElementById('ticketFilter').value;
    const tipoTicketFilter = document.getElementById('tipoTicketFilter').value;

    console.log('Filtros selecionados:', { timeFilter, typeFilter, ticketFilter, tipoTicketFilter });

    const proventosData = globalData.proventos;
    const filteredData = filterData(proventosData, timeFilter, typeFilter, ticketFilter, tipoTicketFilter);

    renderTable(filteredData);
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
    allOption.textContent = 'Todos';
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

    renderTable(filteredData);
    plotProventosGraph(filteredData, timeFilter, typeFilter, ticketFilter, tipoTicketFilter);
}


// Função para atualizar as opções do filtro de tipo de ticket no HTML
function updateTipoTicketFilterOptions(dataCarteira) {
    const tipoTicketFilterSelect = document.getElementById('tipoTicketFilter');

    tipoTicketFilterSelect.innerHTML = '';

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'Todos';
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