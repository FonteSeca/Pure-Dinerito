// dataModule.js
let globalData = {
    carteira: [],
    movimentacao: [],
    proventos: []
};

// Função para atualizar globalData
export function setGlobalData(data) {
    globalData = data;
}

// Exporta os dados atualizados
export function getGlobalData() {
    return globalData;
}
