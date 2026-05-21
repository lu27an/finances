/**
 * src/storage.js
 * Módulo responsável pela persistência de dados utilizando localStorage.
 */

const STORAGE_KEY = 'finances_transactions';

/**
 * Recupera todas as transações cadastradas.
 * @returns {Array} Array de transações ordenadas pela data de criação decrescente.
 */
export function getTransactions() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) return [];
        
        return parsed.sort((a, b) => b.createdAt - a.createdAt);
    } catch (e) {
        console.error("Erro ao ler dados do localStorage:", e);
        return [];
    }
}

/**
 * Salva uma nova transação.
 * @param {Object} transaction Dados da transação (tipo, valor, categoria, data, descrição).
 * @returns {Array} Lista atualizada de transações.
 */
export function saveTransaction(transaction) {
    const transactions = getTransactions();
    
    const newTransaction = {
        id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        type: transaction.type, // 'income' | 'expense'
        amount: parseFloat(transaction.amount),
        category: transaction.category,
        date: transaction.date,
        description: transaction.description || transaction.category,
        createdAt: Date.now()
    };
    
    transactions.push(newTransaction);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return transactions;
}

/**
 * Remove uma transação pelo ID.
 * @param {string} id ID da transação a ser excluída.
 * @returns {Array} Lista atualizada de transações.
 */
export function deleteTransaction(id) {
    let transactions = getTransactions();
    transactions = transactions.filter(tx => tx.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return transactions;
}

/**
 * Limpa todos os registros salvos.
 */
export function clearAllData() {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Valida e importa transações de uma string JSON.
 * @param {string} jsonString String JSON representando o array de transações.
 * @returns {Array} Lista importada e salva de transações.
 * @throws {Error} Se o JSON for inválido ou não corresponder ao formato correto.
 */
export function importTransactions(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        if (!Array.isArray(parsed)) {
            throw new Error("O arquivo de backup deve conter uma lista de transações.");
        }
        
        // Validar estrutura básica de cada item
        const validated = parsed.map(item => {
            if (!item.type || !['income', 'expense'].includes(item.type)) {
                throw new Error("Tipo de transação inválido encontrado.");
            }
            if (typeof item.amount !== 'number' || isNaN(item.amount) || item.amount <= 0) {
                throw new Error("Valor de transação inválido ou menor/igual a zero.");
            }
            if (!item.category) {
                throw new Error("Transação sem categoria encontrada.");
            }
            if (!item.date) {
                throw new Error("Transação sem data encontrada.");
            }
            
            return {
                id: item.id || `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                type: item.type,
                amount: item.amount,
                category: item.category,
                date: item.date,
                description: item.description || item.category,
                createdAt: item.createdAt || Date.now()
            };
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
        return validated;
    } catch (e) {
        throw new Error(e.message || "Falha ao processar o JSON de backup.");
    }
}
