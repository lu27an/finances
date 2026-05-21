/**
 * src/ui.js
 * Módulo responsável pela renderização da interface e interações de DOM.
 */

// Categorias pré-definidas com Emojis
export const CATEGORIES = {
    expense: [
        { id: 'food', label: 'Comida', emoji: '🍔' },
        { id: 'transport', label: 'Transporte', emoji: '🚗' },
        { id: 'home', label: 'Moradia', emoji: '🏠' },
        { id: 'shopping', label: 'Compras', emoji: '🛍️' },
        { id: 'bills', label: 'Contas', emoji: '💡' },
        { id: 'leisure', label: 'Lazer', emoji: '🎲' },
        { id: 'health', label: 'Saúde', emoji: '🏥' },
        { id: 'others_exp', label: 'Outros', emoji: '➕' }
    ],
    income: [
        { id: 'salary', label: 'Salário', emoji: '💵' },
        { id: 'investments', label: 'Investimentos', emoji: '📈' },
        { id: 'freelance', label: 'Freelance', emoji: '💻' },
        { id: 'others_inc', label: 'Outros', emoji: '➕' }
    ]
};

// State local da UI
let currentActiveMonth = new Date().getMonth(); // 0-11
let currentActiveYear = new Date().getFullYear();
let selectedCategory = '';

// Nomes dos meses em português
const MONTHS_NAMES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Formatadores
const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

/**
 * Retorna o mês e ano atualmente selecionados.
 */
export function getActiveDateFilter() {
    return { month: currentActiveMonth, year: currentActiveYear };
}

/**
 * Incrementa ou decrementa o mês ativo.
 * @param {number} direction 1 para próximo mês, -1 para mês anterior.
 */
export function changeActiveMonth(direction) {
    currentActiveMonth += direction;
    if (currentActiveMonth > 11) {
        currentActiveMonth = 0;
        currentActiveYear += 1;
    } else if (currentActiveMonth < 0) {
        currentActiveMonth = 11;
        currentActiveYear -= 1;
    }
}

/**
 * Formata um valor numérico para moeda brasileira (R$).
 */
export function formatCurrency(value) {
    return currencyFormatter.format(value);
}

/**
 * Formata data ISO (YYYY-MM-DD) em formato amigável para celular (Ex: "21, Mai").
 */
export function formatDateFriendly(dateStr) {
    // Evita problemas de timezone instanciando data local explícita
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    const shortMonth = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    return `${day}, ${shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1)}`;
}

/**
 * Emite vibração curta no dispositivo (Haptic feedback).
 */
export function triggerHaptic(duration = 15) {
    if ('vibrate' in navigator) {
        navigator.vibrate(duration);
    }
}

/**
 * Exibe o tremor de erro visual e vibra.
 */
export function animateError(element) {
    triggerHaptic([40, 40, 40]);
    element.classList.add('shake');
    element.focus();
    setTimeout(() => {
        element.classList.remove('shake');
    }, 300);
}

/**
 * Atualiza o painel principal de saldos no topo.
 */
export function renderDashboard(transactions) {
    // Filtrar transações do mês e ano ativos
    const filtered = transactions.filter(tx => {
        const txDate = new Date(tx.date + 'T00:00:00');
        return txDate.getMonth() === currentActiveMonth && txDate.getFullYear() === currentActiveYear;
    });

    let incomeTotal = 0;
    let expenseTotal = 0;

    filtered.forEach(tx => {
        if (tx.type === 'income') {
            incomeTotal += tx.amount;
        } else {
            expenseTotal += tx.amount;
        }
    });

    const finalBalance = incomeTotal - expenseTotal;

    // Atualizar DOM
    const balanceEl = document.getElementById('total-balance');
    const incomeEl = document.getElementById('total-income');
    const expenseEl = document.getElementById('total-expense');

    balanceEl.textContent = formatCurrency(finalBalance);
    incomeEl.textContent = formatCurrency(incomeTotal);
    expenseEl.textContent = formatCurrency(expenseTotal);

    // Ajustar cor do saldo principal se for negativo
    if (finalBalance < 0) {
        balanceEl.style.color = 'var(--color-expense)';
    } else {
        balanceEl.style.color = 'var(--color-white)';
    }

    // Exibição do carrossel do mês
    document.getElementById('current-month-display').textContent = `${MONTHS_NAMES[currentActiveMonth]} ${currentActiveYear}`;
}

/**
 * Renderiza a lista de transações na tela.
 */
export function renderTransactionsList(transactions, onDeleteCallback) {
    const listEl = document.getElementById('transactions-list');
    const emptyStateEl = document.getElementById('empty-state');
    
    // Limpar elementos antigos
    listEl.innerHTML = '';

    // Filtrar pelo mês e ano corrente
    const filtered = transactions.filter(tx => {
        const txDate = new Date(tx.date + 'T00:00:00');
        return txDate.getMonth() === currentActiveMonth && txDate.getFullYear() === currentActiveYear;
    });

    if (filtered.length === 0) {
        emptyStateEl.classList.remove('hidden');
        listEl.classList.add('hidden');
        return;
    }

    emptyStateEl.classList.add('hidden');
    listEl.classList.remove('hidden');

    filtered.forEach(tx => {
        const card = document.createElement('div');
        card.className = `transaction-card ${tx.type}`;
        card.setAttribute('data-id', tx.id);

        const categoryObj = [...CATEGORIES.expense, ...CATEGORIES.income].find(c => c.label === tx.category || c.id === tx.category);
        const emoji = categoryObj ? categoryObj.emoji : '💰';

        card.innerHTML = `
            <div class="card-left">
                <div class="category-badge">${emoji}</div>
                <div class="tx-info">
                    <span class="tx-title">${tx.description || tx.category}</span>
                    <span class="tx-date">${formatDateFriendly(tx.date)}</span>
                </div>
            </div>
            <div class="card-right">
                <span class="tx-amount">${tx.type === 'income' ? '+' : '-'} ${formatCurrency(tx.amount)}</span>
                <button class="delete-btn" aria-label="Excluir transação" data-id="${tx.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </div>
        `;

        // Evento de exclusão
        const delBtn = card.querySelector('.delete-btn');
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerHaptic(25);
            if (confirm('Deseja realmente excluir esta transação?')) {
                onDeleteCallback(tx.id);
            }
        });

        listEl.appendChild(card);
    });
}

/**
 * Preenche o grid de categorias baseado no tipo ativo (despesa ou receita).
 * @param {string} type 'expense' | 'income'
 */
export function renderCategoriesGrid(type) {
    const gridEl = document.getElementById('category-grid');
    gridEl.innerHTML = '';

    const list = CATEGORIES[type];

    list.forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'category-option-btn';
        btn.setAttribute('data-category-id', cat.id);
        btn.setAttribute('data-category-label', cat.label);

        // Auto-selecionar o primeiro da lista
        if (index === 0) {
            btn.classList.add('selected');
            selectedCategory = cat.label;
        }

        btn.innerHTML = `
            <span class="cat-emoji">${cat.emoji}</span>
            <span class="cat-label">${cat.label}</span>
        `;

        btn.addEventListener('click', () => {
            triggerHaptic(10);
            document.querySelectorAll('.category-option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedCategory = cat.label;
        });

        gridEl.appendChild(btn);
    });
}

/**
 * Retorna a categoria atualmente selecionada no modal.
 */
export function getSelectedCategory() {
    return selectedCategory;
}

/**
 * Controla exibição dos painéis deslizantes (bottom sheets).
 */
export function toggleSheet(sheetId, backdropId, show) {
    const sheet = document.getElementById(sheetId);
    const backdrop = document.getElementById(backdropId);

    if (show) {
        sheet.classList.remove('hidden');
        backdrop.classList.remove('hidden');
        triggerHaptic(15);
    } else {
        sheet.classList.add('hidden');
        backdrop.classList.add('hidden');
    }
}
