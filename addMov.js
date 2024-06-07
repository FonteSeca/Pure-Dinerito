// Inicialize o cliente Supabase dentro do script
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const supabaseUrl = 'https://sfvrdmhpvaluyfnbptny.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmdnJkbWhwdmFsdXlmbmJwdG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyNjM5ODgsImV4cCI6MjAzMTgzOTk4OH0.kj4e5YgSnlQwsH0eUR7iEhOZqgi06oD3RKMhNMqSJqg"
const supabase = createClient(supabaseUrl, supabaseKey)



document.getElementById('addDataForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita o comportamento padrão de envio do formulário

    const operacao = document.getElementById('operacao').value;
    const data = document.getElementById('data').value;
    const ticket = document.getElementById('ticket').value;
    const quantidade = parseFloat(document.getElementById('quantidade').value);
    const valorUnitario = parseFloat(document.getElementById('valorUnitario').value);

    try {
        // Adicionar a movimentação na tabela Movimentacao
        const { data: insertedData, error } = await supabase
            .from('Movimentacao')
            .insert([
                { 
                    Operacao: operacao, 
                    Data: data, 
                    Ticket: ticket, 
                    Quantidade: quantidade, 
                    'Valor Unitario': valorUnitario 
                }
            ])
            .select(); // Adicione este método para retornar os dados inseridos

        if (error) {
            throw error;
        }

        console.log('Movimentação inserida com sucesso:', insertedData);
        alert('Movimentação inserida com sucesso!');

        // Atualizar os valores na tabela Carteira
        await atualizarCarteira(ticket, quantidade, valorUnitario, operacao);

        // Limpar o formulário
        document.getElementById('addDataForm').reset();
    } catch (error) {
        console.error('Erro ao inserir movimentação:', error);
        alert('Erro ao inserir movimentação.');
    }
});

async function atualizarCarteira(ticket, quantidade, valorUnitario, operacao) {
    try {
        console.log('Ticket:', ticket);
        
        // Recuperar os dados da Carteira para o ticket específico
        const { data: carteiraData, error } = await supabase
            .from('Carteira')
            .select('*')
            .eq('Ticket', ticket)
            .single();

        if (error) {
            throw error;
        }

        console.log('Dados da Carteira antes da atualização:', carteiraData); // Verifica se os dados da carteira foram recuperados corretamente

        // Atualizar os valores da Carteira com base na operação
        let cotasAdquiridasAtualizadas, valorPagoAtualizado;
        if (operacao === 'compra') {
            cotasAdquiridasAtualizadas = carteiraData['Cotas Adquiridas'] + quantidade;
            valorPagoAtualizado = carteiraData['Valor Pago'] + (quantidade * valorUnitario);
        } else if (operacao === 'venda') {
            cotasAdquiridasAtualizadas = carteiraData['Cotas Adquiridas'] - quantidade;
            valorPagoAtualizado = carteiraData['Valor Pago'] - (quantidade * valorUnitario);
        } else {
            throw new Error('Operação desconhecida: ' + operacao);
        }

        console.log('Cotas Adquiridas:', cotasAdquiridasAtualizadas);
        console.log('Valor Pago:', valorPagoAtualizado);

        // Atualizar os valores na tabela Carteira
        const { data: updatedData, error: updateError } = await supabase
            .from('Carteira')
            .update({
                'Cotas Adquiridas': cotasAdquiridasAtualizadas,
                'Valor Pago': valorPagoAtualizado
            })
            .eq('Ticket', ticket);

        if (updateError) {
            throw updateError;
        }

        console.log('Dados atualizados:', updatedData); // Verifica se os dados foram atualizados corretamente
    } catch (error) {
        console.error('Erro ao atualizar carteira:', error);
        throw error;
    }
}
