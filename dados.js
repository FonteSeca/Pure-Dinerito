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

async function calcularValorPago(movimentacaoData) {
    const valorPago = {};

    movimentacaoData.forEach(item => {
        const ticket = item.Ticket;
        const valorUnitario = parseFloat(item['Valor Unitario']); // Obter o valor unitário do item
        const quantidade = parseFloat(item.Quantidade);

        // Calcular o valor total da transação
        const valorTotal = valorUnitario * quantidade;

        // Inicializar o valor pago para o ticket se ainda não estiver definido
        if (!valorPago[ticket]) {
            valorPago[ticket] = 0;
        }

        // Verificar a operação e atualizar o valor pago de acordo
        if (item.Operacao === 'Compra') {
            valorPago[ticket] += valorTotal;
        } else if (item.Operacao === 'Venda') {
            valorPago[ticket] -= valorTotal;
        }

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

async function atualizarCarteira(carteiraData, cotasAdquiridas, valorTestePago, proventosPagos) {
    // Mapeia cada item da carteira e atualiza os valores conforme necessário

    // console.log('Carteira Desatualizada: ', carteiraData);
    return carteiraData.map(item => {
        const ticket = item.Ticket;
    
        // Obtém a quantidade de cotas adquiridas para o ticket atual ou define como 0 se não houver valor
        const cotasAdquiridasAtualizadas = cotasAdquiridas[ticket] || 0;
    
        // Obtém o valor pago para o ticket atual ou define como 0 se não houver valor
        const valorPagoAtualizado = valorTestePago[ticket] || 0;
    
        // Obtém os proventos pagos para o ticket atual ou define como 0 se não houver valor
        const proventosPagosAtualizados = proventosPagos[ticket] || 0;
    
       
        // Retorna um novo objeto com os valores atualizados
        const updatedItem = {
            Ticket: item.Ticket,
            Tipo: item.Tipo,
            'Proventos Pagos': proventosPagosAtualizados,
            Segmento: item.Segmento,
            'Cotas Adquiridas': cotasAdquiridasAtualizadas,
            'Valor_Pago': valorPagoAtualizado.toFixed(2)
        };

        return updatedItem;
    });
}



async function atualizarCarteiraAsync(carteiraData, cotasAdquiridas, valorPago, proventosPagos) {
    try {
        const carteiraAtualizada = await atualizarCarteira(carteiraData, cotasAdquiridas, valorPago, proventosPagos);

        // console.log('Carteira Atualizada:', carteiraAtualizada);
        return carteiraAtualizada;
    } catch (error) {
        throw new Error('Erro ao atualizar carteira: ' + error.message);
    }
}




async function carregarEProcessarDados() {
    try {
        const movimentacaoData = await carregarMovimentacao();
        const carteiraData = await carregarCarteira();
        const proventosData = await carregarProventos();
    
        const cotasAdquiridas = await calcularCotasAdquiridas(movimentacaoData);
        const valorPago = await calcularValorPago(movimentacaoData);
        const proventosPagos = await calcularProventosPagos(proventosData);


        // console.log('Valores calculados:', valorPago);

        //console.log('Cotas Adquiridas:', cotasAdquiridas);

        // console.log('Proventos Pagos:', proventosPagos);

        //let teste = await atualizarCarteira(carteiraData, cotasAdquiridas, valorPago, proventosPagos)
        //console.log('Carteira Atualizada:', teste);
    
        const carteiraAtualizada = await atualizarCarteiraAsync(carteiraData, cotasAdquiridas, valorPago, proventosPagos);


        // console.log('Carteira Atualizada:', carteiraAtualizada);


    
        const globalData = { carteira: carteiraAtualizada, movimentacao: movimentacaoData, proventos: proventosData };
    
        // console.log('Dados atualizados:', globalData);
        
        // Exportando globalData para o próximo script
        return globalData;
    } catch (error) {
        console.error('Erro ao carregar e processar os dados:', error);
        return null;
    }
}

// Chamar a função para carregar e processar os dados


// dados.js

// Chamar a função para carregar e processar os dados
async function globalDatas() {
    const carregarDados = await carregarEProcessarDados();
    
    return carregarDados;
}
export { globalDatas };