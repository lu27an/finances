# Design do App de Controle Financeiro Offline

Este documento detalha as especificações do aplicativo de controle financeiro pessoal mobile-first.

## Resumo do Entendimento

*   **O que está sendo construído**: Um aplicativo web focado em dispositivos móveis, offline-first, para controle financeiro pessoal.
*   **Propósito**: Permitir o registro rápido e privado de transações financeiras (receitas e despesas).
*   **Público-alvo**: Pessoas que desejam controle de gastos prático, sem necessidade de cadastros ou internet.
*   **Design**: Interface escura com visual glassmorphic, bordas finas translúcidas, desfoque de fundo e realces neon.

## Premissas

1.  **Tecnologias**: Uso de HTML5 estrutural, CSS3 Vanilla com variáveis de estilo e JavaScript modular (ES6 Modules). Sem frameworks externos (React, Vue, etc.) nem pré-processadores.
2.  **Persistência**: Dados armazenados localmente no navegador (`localStorage`) em formato JSON.
3.  **Responsividade**: Mobile-first completo. Em telas de desktop, o app é apresentado dentro de um mockup de tela de celular centralizado.
4.  **Feedback**: Inclusão de recursos táteis (vibração) e animações de feedback de ação (sucesso ao cadastrar, tremor em caso de erro).

## Log de Decisões

| ID | Decisão | Alternativas Consideradas | Justificativa |
| :--- | :--- | :--- | :--- |
| **1.1** | Stack Vanilla (HTML/CSS/JS) | React, Next.js, Vite | Reduz a complexidade de build, é offline por padrão de forma simples e garante desempenho instantâneo. |
| **1.2** | Tema Glassmorphic Dark | Light Mode padrão, Neobrutalismo | Confere um visual premium e moderno de fintech de ponta. |
| **2.1** | Arquitetura de Módulos ES | Arquivo único de script | Facilita a manutenção separando armazenamento, manipulação de DOM e lógica central. |
| **2.2** | Layout Single-Screen com Modais | Múltiplas rotas/telas | Minimiza o atrito para o usuário registrar gastos com poucos toques. |
| **3.1** | Schema JSON no localStorage | Bancos IndexedDB, SQL local | Simplicidade de leitura/gravação para a escala de dados proposta. |
| **4.1** | Categorias pré-definidas com Emojis | Entrada de categoria livre | Simplifica a interface de escolha e padroniza a categorização visual. |
| **4.2** | Animação de tremor para erros | Alertas (`alert`) nativos | Mantém a experiência visual fluida sem pop-ups invasivos do sistema operacional. |

---

## Design Final da Interface e Fluxo

### 1. Elementos da Tela Principal
*   **Card Principal (Saldo Atual)**: Um painel central translúcido que mostra o saldo acumulado total, com sub-painéis para "Receitas" (em verde ciano) e "Despesas" (em vermelho coral).
*   **Filtro de Mês**: Um controle horizontal deslizável para alternar entre os meses.
*   **Lista de Transações**: Um container vertical rolável com cada transação exibida em um card de vidro com gradiente sutil.
*   **Botão Novo (+)**: FAB (Floating Action Button) flutuando no canto inferior direito que abre o painel deslizante de cadastro.

### 2. Painel Deslizante de Cadastro (Bottom Sheet)
*   Desliza de baixo para cima ao tocar no botão "+".
*   Contém:
    *   Seletor de tipo de transação (Receita vs Despesa) usando botões alternadores (Segmented Control).
    *   Campo de valor formatado em R$ com fonte grande e entrada numérica.
    *   Seletor de categoria em grid de botões de fácil clique.
    *   Campo de data (padrão hoje) e descrição opcional.
    *   Botão "Salvar Transação" largo e destacado.
