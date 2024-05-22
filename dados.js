// Inicialize o cliente Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const supabaseUrl = 'https://sfvrdmhpvaluyfnbptny.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmdnJkbWhwdmFsdXlmbmJwdG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyNjM5ODgsImV4cCI6MjAzMTgzOTk4OH0.kj4e5YgSnlQwsH0eUR7iEhOZqgi06oD3RKMhNMqSJqg"
const supabase = createClient(supabaseUrl, supabaseKey)

let globalData = { carteira: [], movimentacao: [], proventos: [] };

// Função para carregar os dados da Carteira
async function carregarCarteira() {
    try {
        const { data, error } = await supabase
            .from('Carteira')
            .select('*'); // Seleciona todas as colunas
    
        if (error) {
            throw error;
        } else {
            console.log('Dados da Carteira recuperados com sucesso:');
            return data;
        }
    } catch (error) {
        console.error('Erro ao recuperar dados da Carteira:', error);
        return [];
    }
}


// Função para carregar os dados dos Proventos
async function carregarMovimentacao() {
    try {
        const { data, error } = await supabase
            .from('Movimentacao')
            .select('*'); // Seleciona todas as colunas
    
        if (error) {
            throw error;
        } else {
            console.log('Dados de Movimentacao recuperados com sucesso:');
            return data;
        }
    } catch (error) {
        console.error('Erro ao recuperar dados dos Proventos:', error);
        return [];
    }
}

// Função para carregar os dados dos Proventos
async function carregarProventos() {
    try {
        const { data, error } = await supabase
            .from('Proventos')
            .select('*'); // Seleciona todas as colunas
    
        if (error) {
            throw error;
        } else {
            console.log('Dados dos Proventos recuperados com sucesso:');
            return data;
        }
    } catch (error) {
        console.error('Erro ao recuperar dados dos Proventos:', error);
        return [];
    }
}


function calcularCotasAdquiridas(movimentacaoData) {
    const cotasAdquiridas = {};

    movimentacaoData.forEach(item => {
        const ticket = item.Ticket;
        const quantidade = parseFloat(item.Quantidade);

        if (!cotasAdquiridas[ticket]) {
            cotasAdquiridas[ticket] = 0;
        }

        cotasAdquiridas[ticket] += quantidade;
    });

    return cotasAdquiridas;
}

function calcularValorPago(movimentacaoData) {
    const valorPago = {};

    movimentacaoData.forEach(item => {
        const ticket = item.Ticket;
        const valorUnitario = parseFloat(item['Valor Unitario']); // Obter o valor unitário do item
        const quantidade = parseFloat(item.Quantidade);

        // Calcular o valor pago multiplicando o valor unitário pela quantidade
        const valorTotal = valorUnitario * quantidade;

        if (!valorPago[ticket]) {
            valorPago[ticket] = 0;
        }

        valorPago[ticket] += valorTotal;
    });

    return valorPago;
}

function calcularProventosPagos(proventosData) {
    const proventosPagos = {};

    proventosData.forEach(item => {
        const ticket = item.Ticket;
        const valorUnitario = parseFloat(item['Valor Unitario']);
        const quantidade = parseFloat(item.Quantidade);
        const valorPago = valorUnitario * quantidade;

        if (!proventosPagos[ticket]) {
            proventosPagos[ticket] = 0;
        }

        proventosPagos[ticket] += valorPago;
    });

    return proventosPagos;
}


function atualizarCarteira(carteiraData, cotasAdquiridas, valorPago, proventosPagos) {
    return carteiraData.map(item => {
        const ticket = item.Ticket;
        return {
            ...item,
            'Cotas Adquiridas': cotasAdquiridas[ticket] || 0,
            'Valor Pago': valorPago[ticket] || 0,
            'Proventos Pagos': proventosPagos[ticket] || 0
        };
    });
}



async function carregarEProcessarDados() {
    try {
        const movimentacaoData = await carregarMovimentacao();
        const carteiraData = await carregarCarteira();
        const proventosData = await carregarProventos();
    
        const cotasAdquiridas = calcularCotasAdquiridas(movimentacaoData);
        const valorPago = calcularValorPago(movimentacaoData);
        const proventosPagos = calcularProventosPagos(proventosData);
    
        const carteiraAtualizada = atualizarCarteira(carteiraData, cotasAdquiridas, valorPago, proventosPagos);
    
        const globalData = { carteira: carteiraAtualizada, movimentacao: movimentacaoData, proventos: proventosData };
    
        console.log('Dados atualizados:', globalData);
        
        // Exportando globalData para o próximo script
        return globalData;
    } catch (error) {
        console.error('Erro ao carregar e processar os dados:', error);
        return null;
    }
}

// Chamar a função para carregar e processar os dados
carregarEProcessarDados();

// dados.js

// Chamar a função para carregar e processar os dados
const globalDatas = await carregarEProcessarDados();
export { globalDatas };