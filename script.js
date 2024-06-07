// Inicialize o cliente Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const supabaseUrl = 'https://sfvrdmhpvaluyfnbptny.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmdnJkbWhwdmFsdXlmbmJwdG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyNjM5ODgsImV4cCI6MjAzMTgzOTk4OH0.kj4e5YgSnlQwsH0eUR7iEhOZqgi06oD3RKMhNMqSJqg"
const supabase = createClient(supabaseUrl, supabaseKey)


// scriptUso.js

// Importando globalDatas de dados.js com um nome diferente
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

// renderTable(globalData.movimentacao);





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

// Exemplo de uso:
verifica();

function verifica() {
    if (checkElementById('tabela-carteira') === true) {
        
        renderTableCarteira(globalData.carteira, 'tabela-carteira');
    }
    
    if (checkElementById('tabela-transacao') === true) {
        renderTableTransacao(globalData.movimentacao, 'tabela-transacao');
    }
    
    if (checkElementById('tabela-proventos') === true) {
        renderTableProventos(globalData.proventos, 'tabela-proventos');
    }

    if (checkElementById('graficoPatrimonio') === true) {
        plotGraph(globalData.movimentacao);
    }

    if (checkElementById('graficoSegmentoFII') === true) {
//        plotSegmentoGraph(globalData.carteira);
        
        plotSegmentoGraphTipo(globalData.carteira, 'FII', 'bottom');
    }

    if (checkElementById('graficoSegmentoAcao') === true) {
        //        plotSegmentoGraph(globalData.carteira);
        plotSegmentoGraphTipo(globalData.carteira, 'Ação', 'bottom');
    }

    if (checkElementById('graficoTipo') === true) {
        plotTipoGraph(globalData.carteira);
    }
}






















  function renderTable(data) {
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
    document.getElementById('tabela').appendChild(table);
}


function renderTableProventos(data, idElemento) {
    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
            <th>Ticket</th>
            <th>Operação</th>
            <th>Data Com</th>
            <th>Data Pag</th>
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
        <td>${item['Data Com']}</td>
        <td>${item['Data Pag']}</td>
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


async function pegarCotacao(ticket) {
    const url = `https://brapi.dev/api/quote/${ticket}?token=nfHJqPhTNSq1iK8mTsxqHs`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            return parseFloat(result.regularMarketPrice);
        } else {
            throw new Error('Dados não disponíveis');
        }
    } catch (error) {
        console.error('Erro ao pegar cotação:', error);
        return null;
    }
}

async function atualizarValoresPatrimoniais(data) {
    for (const item of data) {
        const ticker = item['Ticket'];
        const quantidade = parseFloat(item['Cotas Adquiridas']);
        const cotacaoAtual = await pegarCotacao(ticker);

        if (cotacaoAtual !== null) {
            item['Valor Patrimonial'] = cotacaoAtual * quantidade;
        } else {
            item['Valor Patrimonial'] = 0;  // Ou algum valor padrão em caso de erro
        }
    }
}

async function renderTableCarteira(data, idElemento) {
    // Atualiza os valores patrimoniais com as cotações atuais
    await atualizarValoresPatrimoniais(data);

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
            <th>Ticker</th>
            <th>Quantidade</th>
            <th>Preço Médio</th>
            <th>Valor Aplicado</th>
            <th>Valor Patrimonial</th>
            <th>Variação</th>
            <th>Editar</th>
            </tr>
        </thead>
    `;
    
    const tbody = document.createElement('tbody');

    data.forEach(item => {
        const quantidade = parseFloat(item['Cotas Adquiridas']);
        const valorPago = item['Valor_Pago'];
        const valorPatrimonial = item['Valor Patrimonial'];
        
        const precoMedio = valorPago / quantidade;
        const variacaoValor = valorPatrimonial - valorPago;
        const variacaoPercentual = ((valorPatrimonial - valorPago) / valorPago) * 100;

        const simboloVariacao = variacaoPercentual > 0 ? '↗' : variacaoPercentual < 0 ? '↘' : '';
        const classeVariacao = variacaoPercentual > 0 ? 'positivo' : variacaoPercentual < 0 ? 'negativo' : 'neutro';

        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${item['Ticket']} - ${item['nome_ticker']}</td>
        <td>${item['Cotas Adquiridas']}</td>
        <td>R$ ${precoMedio.toFixed(2)}</td>
        <td>R$ ${valorPago}</td>
        <td>R$ ${valorPatrimonial.toFixed(2)}</td>
        <td class="${classeVariacao}">R$ ${variacaoValor.toFixed(2)} / ${variacaoPercentual.toFixed(2)}% ${simboloVariacao}</td>
        <td><button class="btn-editar">Editar</button></td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    document.getElementById(idElemento).appendChild(table);
}





function plotGraph(data) {
    // Inicializa um objeto para armazenar os valores acumulados por mês e ano
    const monthlyData = {};

    // Itera sobre os dados originais
    data.forEach(item => {
        const date = new Date(item['Data']);
        const year = date.getFullYear(); // Obtém o ano da data
        const month = date.getMonth() + 1; // Obtém o mês da data (0-11, então adicionamos 1 para torná-lo 1-12)
        const monthYear = `${year}-${month}`; // Concatena ano e mês para formar a chave

        const valorUnitario = parseFloat(item['Valor Unitario']);
        const quantidade = parseFloat(item['Quantidade']);
        const valorPago = valorUnitario * quantidade;

        // Se a combinação de mês e ano ainda não estiver presente no objeto monthlyData, inicialize-a com 0
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = 0;
        }

        // Acumula o valor pago ao valor existente para o mês e ano
        monthlyData[monthYear] += valorPago;
    });

    // Converta os dados acumulados em arrays para usar no gráfico
    const monthsYears = Object.keys(monthlyData);
    const patrimonio = Object.values(monthlyData);

    // Acumula os valores ao longo do tempo para criar um gráfico de linha acumulado
    for (let i = 1; i < patrimonio.length; i++) {
        patrimonio[i] += patrimonio[i - 1];
    }

    // Criação do gráfico
    const ctx = document.getElementById('graficoPatrimonio').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthsYears,
            datasets: [{
                label: 'Crescimento do Patrimônio',
                data: patrimonio,
                borderColor: 'rgba(145, 145, 145, 1)',
                borderWidth: 2,
                fill: true,
                backgroundColor: 'rgba(145, 145, 145, 0.2)'
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Mês/Ano'
                    },
                    grid: {
                        display: false // Remove grade horizontal (do eixo X)
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Patrimônio (R$)'
                    },
                    grid: {
                        display: false // Remove grade horizontal (do eixo X)
                    }
                }
            }
        }
    });
}


function plotSegmentaoGraph(data) {
    const dates = [];
    const patrimonio = [];
    let accumulatedValue = 0;

    data.forEach(item => {
        const valorUnitario = parseFloat(item['Valor Unitario']);
        const quantidade = parseFloat(item['Quantidade']);
        const valorPago = valorUnitario * quantidade;
        
        accumulatedValue += valorPago;
        dates.push(item['Data']);
        patrimonio.push(accumulatedValue);
    });

    const ctx = document.getElementById('graficoSegmento').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: dates,
            datasets: [{
                label: 'Crescimento do Patrimônio',
                data: patrimonio,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Data'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Patrimônio (R$)'
                    }
                }
            }
        }
    });
}


function plotSegmentoGraph(data) {
    const segmentos = {}; // Objeto para armazenar os valores agrupados por segmento
    let accumulatedValues = {}; // Objeto para armazenar os valores acumulados por segmento

    // Inicializa os objetos para cada tipo de segmento
    data.forEach(item => {
        const segmento = item['Segmento'];
        if (!segmentos[segmento]) {
            segmentos[segmento] = 0;
            accumulatedValues[segmento] = 0;
        }
    });

    // Calcula os valores acumulados por segmento
    data.forEach(item => {
        const segmento = item['Segmento'];
        const valorPago = parseFloat(item['Valor Pago']);
        accumulatedValues[segmento] += valorPago;
    });

    // Soma total dos valores para calcular percentuais
    const totalValue = Object.values(accumulatedValues).reduce((total, value) => total + value, 0);

    // Prepara os dados para o gráfico de rosca
    const labels = [];
    const dataValues = [];
    const backgroundColors = [];

    Object.keys(segmentos).forEach(segmento => {
        const valor = accumulatedValues[segmento];
        const percentual = (valor / totalValue) * 100;
        labels.push(`${segmento} (${percentual.toFixed(2)}%)`);
        dataValues.push(valor);
        backgroundColors.push(getRandomColor());
    });

    // Criação do gráfico
    const ctx = document.getElementById('graficoSegmento').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                title: {
                    display: false,
                    text: 'Distribuição do Patrimônio por Segmento'
                },
                datalabels: {
                    display: true,
                    color: '#202020', // Cor do texto
                    font: {
                        size: 12
                    },
                    formatter: function(value, context) {
                        return labels[context.dataIndex] + ': ' + value.toFixed(2) + '%';
                    }
                }
            }
        }
    });
    
    
}



function plotSegmentoGraphTipo(data, tipo, legendaPosicao) {
    const segmentos = {}; // Objeto para armazenar os valores agrupados por segmento
    let accumulatedValues = {}; // Objeto para armazenar os valores acumulados por segmento

    // Filtra os dados para incluir apenas os itens do tipo FII
    const dataFII = data.filter(item => item['Tipo'] === tipo);

    // Inicializa os objetos para cada tipo de segmento
    dataFII.forEach(item => {
        const segmento = item['Segmento'];
        if (!segmentos[segmento]) {
            segmentos[segmento] = 0;
            accumulatedValues[segmento] = 0;
        }
    });

    // Calcula os valores acumulados por segmento
    dataFII.forEach(item => {
        const segmento = item['Segmento'];
        const valorPago = parseFloat(item['Valor_Pago']);
        accumulatedValues[segmento] += valorPago;
    });

    // Soma total dos valores para calcular percentuais
    const totalValue = Object.values(accumulatedValues).reduce((total, value) => total + value, 0);

    // Prepara os dados para o gráfico de rosca
    const labels = [];
    const dataValues = [];
    const backgroundColors = [];

    Object.keys(segmentos).forEach(segmento => {
        const valor = accumulatedValues[segmento];
        const percentual = (valor / totalValue) * 100;
        labels.push(`${segmento} (${percentual.toFixed(2)}%)`);
        dataValues.push(valor);
        backgroundColors.push(getRandomColor());
    });

    // Criação do gráfico

    if (tipo == 'Ação') {
        tipo = 'Acao';
    }

    const elementNew = 'graficoSegmento'+tipo;
    const ctx = document.getElementById(elementNew).getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: legendaPosicao
                },
                title: {
                    display: false,
                    text: 'Distribuição do Patrimônio por Segmento'
                },
                datalabels: {
                    display: true,
                    color: '#202020', // Cor do texto
                    font: {
                        size: 12
                    },
                    formatter: function(value, context) {
                        return labels[context.dataIndex] + ': ' + value.toFixed(2) + '%';
                    }
                }
            }
        }
    });
}





function plotTipoGraph(data) {
    const segmentos = {}; // Objeto para armazenar os valores agrupados por segmento
    let accumulatedValues = {}; // Objeto para armazenar os valores acumulados por segmento

    // Inicializa os objetos para cada tipo de segmento
    data.forEach(item => {
        const segmento = item['Tipo'];
        if (!segmentos[segmento]) {
            segmentos[segmento] = 0;
            accumulatedValues[segmento] = 0;
        }
    });

    // Calcula os valores acumulados por segmento
    data.forEach(item => {
        const segmento = item['Tipo'];
        const valorPago = parseFloat(item['Valor_Pago']);
        accumulatedValues[segmento] += valorPago;
    });

    // Soma total dos valores para calcular percentuais
    const totalValue = Object.values(accumulatedValues).reduce((total, value) => total + value, 0);

    // Prepara os dados para o gráfico de rosca
    const labels = [];
    const dataValues = [];
    const backgroundColors = [];

    Object.keys(segmentos).forEach(segmento => {
        const valor = accumulatedValues[segmento];
        const percentual = (valor / totalValue) * 100;
        labels.push(`${segmento} (${percentual.toFixed(2)}%)`);
        dataValues.push(valor);
        backgroundColors.push(getRandomColor());
    });

    // Criação do gráfico
    const ctx = document.getElementById('graficoTipo').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: false,
                    text: 'Distribuição do Patrimônio por Segmento'
                }
            }
        }
    });
}





function plotProventosGraph(data) {
    const canvas = document.getElementById('graficoProventos');
    const ctx = canvas.getContext('2d');

    // Agrupar valores por mês/ano e tipo de ticket
    const groupedData = {};

    data.forEach(item => {
        const date = parseDate(item['Data Pag']);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        const tipo = item.Tipo;
        const valorPago = parseFloat(item['Valor Pago']);

        if (!groupedData[monthYear]) {
            groupedData[monthYear] = {};
        }

        if (!groupedData[monthYear][tipo]) {
            groupedData[monthYear][tipo] = 0;
        }

        groupedData[monthYear][tipo] += valorPago;
    });

    // Extrair rótulos e dados para o gráfico
    const labels = Object.keys(groupedData).sort((a, b) => {
        const [monthA, yearA] = a.split('/').map(Number);
        const [monthB, yearB] = b.split('/').map(Number);
        return yearA === yearB ? monthA - monthB : yearA - yearB;
    });

    const tipos = new Set(data.map(item => item.Tipo));
    const datasets = Array.from(tipos).map(tipo => ({
        label: tipo,
        data: labels.map(label => groupedData[label][tipo] || 0),
        backgroundColor: getRandomColor(),
    }));

    new Chart(ctx, {
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
                    display: true,
                    title: {
                        display: true,
                        text: 'Mês/Ano'
                    }
                },
                y: {
                    stacked: true,
                    display: true,
                    title: {
                        display: true,
                        text: 'Valor Pago (R$)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Distribuição dos Valores Pagos por Tipo de Ticket'
                }
            }
        }
    });
}


// Chamar a função com os dados do globalData.carteira
document.addEventListener('DOMContentLoaded', () => {
    plotCarteiraGraph(globalData.carteira);
});


function parseDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}


// Função para gerar tons de cinza aleatórios
function getRandomColor() {
    const grayValue = Math.floor(Math.random() * 250); // Gera um valor entre 0 e 255 para tons de cinza
    const grayHex = grayValue.toString(16).padStart(2, '0'); // Converte o valor para hexadecimal e adiciona um zero à esquerda, se necessário
    return `#${grayHex}${grayHex}${grayHex}`; // Retorna a cor hexadecimal com componentes R, G e B iguais
}





function calcularValorTotalPago(movimentacoes) {
    let totalPago = 0;

    movimentacoes.forEach(movimentacao => {
        const valorUnitario = parseFloat(movimentacao['Valor Unitario']);
        const quantidade = parseFloat(movimentacao['Quantidade']);
        const valorPago = valorUnitario * quantidade;
        
        totalPago += valorPago;
    });

    return totalPago;
}

const totalPago = calcularValorTotalPago(globalData.movimentacao);
document.getElementById('valor-aplicado-text').innerText = totalPago.toFixed(2);

function listarDados(tipoDado, idElemento) {
    
    const table = document.createElement('table');
    const headerRow = table.insertRow();
    for (const key in tipoDado[0]) {
        const headerCell = document.createElement('th');
        headerCell.textContent = key;
        headerRow.appendChild(headerCell);
    }
    tipoDado.forEach(item => {
        const row = table.insertRow();
        for (const key in item) {
            const cell = row.insertCell();
            cell.textContent = item[key];
        }
    });
    document.getElementById(idElemento).appendChild(table);
}


