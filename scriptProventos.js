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




function plotProventosGraph(data, groupBy = 'monthly', filterType = 'all', filterTicket = 'all', filterTipoTicket = 'all') {
    

    
    

 

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
            backgroundColor: '#AFAFAF',
            borderRadius: 5,
            borderColor: 'white',
            borderWidth: 0
        });

        datasets.push({
            label: 'JCP',
            data: labels.map(label => groupedProventos[label].JCP),
            backgroundColor: '#808080',
            borderRadius: 5,
            borderColor: 'white',
            borderWidth: 0
        });
    } else {
        datasets.push({
            label: filterType,
            data: labels.map(label => groupedProventos[label][filterType]),
            backgroundColor: '#AFAFAF',
            borderRadius: 5,
            borderColor: 'white',
            borderWidth: 0
        });
    }

    const ctx = document.getElementById('graficoProventos').getContext('2d');

    // Plugin para desenhar a barra cinza no fundo
    const backgroundBarPlugin = {
        id: 'backgroundBar',
        beforeDraw: (chart) => {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const activeElements = chart.tooltip._active || [];

            if (activeElements.length) {
                const activeElement = activeElements[0];
                const datasetIndex = activeElement.datasetIndex;
                const index = activeElement.index;
                const meta = chart.getDatasetMeta(datasetIndex);
                const data = meta.data[index];

                ctx.save();
                ctx.fillStyle = 'rgba(192, 192, 192, 0.5)'; // Cor cinza com opacidade
                ctx.fillRect(data.x - data.width / 2, chartArea.top, data.width, chartArea.bottom - chartArea.top);
                ctx.restore();
            }
        }
    };
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            maintainAspectRatio: false,
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
            },
            hover: {
                mode: 'index', // Define o modo de hover para mostrar todos os itens da pilha
                intersect: false // Define se o hover deve intersectar a barra ou não
            },
            plugins: {
                tooltip: {
                    enabled: true, // Habilita o tooltip ao passar o mouse
                    mode: 'index', // Modo de exibição do tooltip
                    intersect: false,
                    backgroundColor: 'rgba(32, 32, 32, 1)', // Cor de fundo do tooltip
                    titleFont: {
                        size: 16,
                        weight: 'bold',
                        family: 'Inter',
                        style: 'italic',
                        color: '#ffffff'
                    },
                    bodyFont: {
                        size: 13,
                        family: 'Inter',
                        color: '#ffffff'
                    },
                    footerFont: {
                        size: 13,
                        family: 'Inter',
                        color: '#ffffff'
                    },
                    padding: 10,
                    cornerRadius: 10,
                    borderWidth: 0,
                    borderColor: '#ffffff',
                    caretSize: 6,
                    displayColors: true, // Mostrar as cores de amostra
                    usePointStyle: true, // Usar estilo de ponto em vez de quadrado
                    pointStyle: 'circle', // Estilo do ponto como círculo
                    boxHeight: 15, // Altura do ponto de cor
                    boxWidth: 15, // Largura do ponto de cor
                    borderWidth: 0, // Sem borda para o ponto de cor
                    callbacks: {
                        title: function(tooltipItems) {
                            // Customiza o título do tooltip
                            return tooltipItems[0].label;
                        },
                        label: function(tooltipItem) {
                            // Customiza o conteúdo do tooltip
                            const datasetLabel = tooltipItem.dataset.label || '';
                            return datasetLabel + ': R$ ' + tooltipItem.raw.toFixed(2);
                        },
                        footer: function(tooltipItems) {
                            // Adiciona o total no rodapé do tooltip
                            let total = 0;
                            tooltipItems.forEach(function(tooltipItem) {
                                total += tooltipItem.raw;
                            });
                            return 'Total: R$ ' + total.toFixed(2);
                        }
                    }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    color: '#000', // Cor dos rótulos
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    formatter: function(value) {
                        return 'R$ ' + value.toFixed(2); // Formata com duas casas decimais
                    }
                }
            }
        },
        plugins: [backgroundBarPlugin] // Adicione o ChartDataLabels aqui
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

    renderTable(filteredData);
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