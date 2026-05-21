/**
 * src/app.js
 * Ponto de entrada do aplicativo. Vincula eventos da UI ao módulo de Storage.
 */

import { 
    getTransactions, 
    saveTransaction, 
    deleteTransaction, 
    clearAllData, 
    importTransactions 
} from './storage.js';

import { 
    renderDashboard, 
    renderTransactionsList, 
    renderCategoriesGrid, 
    getSelectedCategory, 
    changeActiveMonth, 
    toggleSheet, 
    animateError, 
    triggerHaptic 
} from './ui.js';

// Transações em memória
let transactions = [];

// Redesenha o dashboard e a lista
function reloadData() {
    transactions = getTransactions();
    renderDashboard(transactions);
    renderTransactionsList(transactions, handleDelete);
}

// Handler de exclusão
function handleDelete(id) {
    transactions = deleteTransaction(id);
    reloadData();
}

// Configura valores padrão para o formulário
function resetForm() {
    const form = document.getElementById('transaction-form');
    form.reset();
    
    // Data padrão: hoje
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('tx-date').value = today;
    
    // Restaurar tipo despesa ativo
    const typeToggles = document.querySelectorAll('.type-toggle-btn');
    typeToggles.forEach(btn => {
        btn.classList.remove('active-expense', 'active-income');
        const input = btn.querySelector('input');
        if (input.value === 'expense') {
            btn.classList.add('active-expense');
            input.checked = true;
        }
    });
    
    // Atualizar categorias para despesa
    renderCategoriesGrid('expense');
}

/* ==========================================================================
   Inicialização e Event Listeners
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Carregar dados iniciais
    reloadData();
    
    // Configurações do formulário
    resetForm();

    // Controles de Seleção de Mês
    document.getElementById('prev-month').addEventListener('click', () => {
        changeActiveMonth(-1);
        reloadData();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        changeActiveMonth(1);
        reloadData();
    });

    // Abrir Bottom Sheet de Cadastro (FAB)
    document.getElementById('fab-btn').addEventListener('click', () => {
        resetForm();
        toggleSheet('transaction-sheet', 'bottom-sheet-backdrop', true);
        
        // Auto-focus no campo de valor após animação
        setTimeout(() => {
            document.getElementById('tx-amount').focus();
        }, 150);
    });

    // Fechar Bottom Sheet de Cadastro
    document.getElementById('close-sheet-btn').addEventListener('click', () => {
        toggleSheet('transaction-sheet', 'bottom-sheet-backdrop', false);
    });
    
    document.getElementById('bottom-sheet-backdrop').addEventListener('click', () => {
        toggleSheet('transaction-sheet', 'bottom-sheet-backdrop', false);
    });

    // Alternar entre Despesa e Receita
    const typeToggles = document.querySelectorAll('.type-toggle-btn');
    typeToggles.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const input = btn.querySelector('input');
            if (input.checked) return; // Já está selecionado
            
            triggerHaptic(10);
            
            // Remover estilos ativos
            typeToggles.forEach(b => b.classList.remove('active-expense', 'active-income'));
            
            input.checked = true;
            if (input.value === 'income') {
                btn.classList.add('active-income');
                renderCategoriesGrid('income');
            } else {
                btn.classList.add('active-expense');
                renderCategoriesGrid('expense');
            }
        });
    });

    // Submit do Formulário de Cadastro
    const form = document.getElementById('transaction-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const amountInput = document.getElementById('tx-amount');
        const amount = parseFloat(amountInput.value);
        const type = form.elements['tx-type'].value;
        const category = getSelectedCategory();
        const date = document.getElementById('tx-date').value;
        const description = document.getElementById('tx-description').value.trim();

        // Validação do valor
        if (isNaN(amount) || amount <= 0) {
            animateError(amountInput);
            return;
        }

        // Validação da data
        if (!date) {
            animateError(document.getElementById('tx-date'));
            return;
        }

        // Salvar transação no LocalStorage
        saveTransaction({
            type,
            amount,
            category,
            date,
            description
        });

        // Fechar sheet e atualizar interface
        toggleSheet('transaction-sheet', 'bottom-sheet-backdrop', false);
        triggerHaptic(30);
        reloadData();
        resetForm();
    });

    /* ==========================================================================
       Painel de Configurações & Backup
       ========================================================================== */
    const settingsBtn = document.getElementById('settings-btn');
    const settingsSheet = document.getElementById('settings-sheet');
    const settingsBackdrop = document.getElementById('settings-backdrop');
    
    // Abrir painel
    settingsBtn.addEventListener('click', () => {
        toggleSheet('settings-sheet', 'settings-backdrop', true);
    });

    // Fechar painel
    document.getElementById('close-settings-btn').addEventListener('click', () => {
        toggleSheet('settings-sheet', 'settings-backdrop', false);
    });
    
    settingsBackdrop.addEventListener('click', () => {
        toggleSheet('settings-sheet', 'settings-backdrop', false);
    });

    // Limpar todos os dados
    document.getElementById('reset-btn').addEventListener('click', () => {
        triggerHaptic(40);
        if (confirm("ATENÇÃO: Isso apagará permanentemente todos os seus dados financeiros salvos no celular. Tem certeza que deseja continuar?")) {
            if (confirm("Confirmação final: Deseja mesmo excluir tudo?")) {
                clearAllData();
                reloadData();
                toggleSheet('settings-sheet', 'settings-backdrop', false);
                alert("Dados limpos com sucesso!");
            }
        }
    });

    // Exportar dados como JSON
    document.getElementById('export-btn').addEventListener('click', () => {
        triggerHaptic(20);
        const dataStr = JSON.stringify(getTransactions(), null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `finances_backup_${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    });

    // Importar dados JSON
    const importTriggerBtn = document.getElementById('import-trigger-btn');
    const importFileInput = document.getElementById('import-file-input');

    importTriggerBtn.addEventListener('click', () => {
        triggerHaptic(10);
        importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                importTransactions(evt.target.result);
                triggerHaptic(30);
                alert("Backup importado com sucesso!");
                reloadData();
                toggleSheet('settings-sheet', 'settings-backdrop', false);
            } catch (err) {
                alert(`Erro ao importar backup: ${err.message}`);
            }
            // Limpa o input
            importFileInput.value = '';
        };
        reader.readAsText(file);
    });
});
