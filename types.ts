
export type TeamId = 'alianca' | 'segredo' | 'caminho' | 'org' | 'none';
export type Sector = 'welcome' | 'org' | 'gincana' | 'membro';
export type AgeGroup = 'Adulto' | 'Jovem' | 'Criança' | 'Indefinido';
export type PersonType = 'Membro' | 'Visitante';
export type PaymentStatus = 'PAGO' | 'PENDENTE';

// Métodos de pagamento aceitos (suporta variações com/sem acentuação para compatibilidade)
export type PaymentMethod =
  | 'Pix'
  | 'Dinheiro'
  | 'Crédito'
  | 'Débito'
  | 'Pendência'
  | 'Credito'
  | 'Debito'
  | 'Pendencia'
  | 'Outro';

// --- ROLES & PERMISSÕES (ARQUITETURA EM DUAS CAMADAS) ---
// 1. Papéis Globais do App da Igreja (365 dias do ano)
export type ChurchRole = 'pastor' | 'membro';

// 2. Papéis Contextuais do Sub-App de Acampamento & Gincana (Eventos / Retiros)
export type CampRole =
  | 'coordenacao'
  | 'jurado'
  | 'lider_equipe'
  | 'cantina'
  | 'acampante';

// Papel Unificado para compatibilidade com o sistema
export type UserRole =
  | 'admin'            // Desenvolvedor / Admin Geral (Caio)
  | 'primeiro_pastor'  // Pastores da Manancial (Primeiros Pastores / Presidentes Fundadores - Acesso Total)
  | 'segundo_pastor'   // Segundos Pastores (Mesmo acesso total aos primeiros pastores, label eclesiástica)
  | 'equipe_pastoral'  // Equipe Pastoral & Liderança (Radar, Acolhimento, Visitas, Membros)
  | 'pastoral'         // Sinônimo legado para primeiro_pastor
  | 'membro'           // Membro da congregação (Espaço Membro & Acampante)
  | 'visitante'        // Visitante (Boas-vindas, pedidos, solicitação de visita)
  | 'organizacao'      // Tesouraria / Staff / Caixa / Cantina
  | 'gincana'          // Sub-app Acampamento: Coordenação da Gincana
  | 'louvor'           // Ministério de Louvor: Líder / Ministro
  | 'lider_equipe'     // Sub-app Acampamento: Líder de Tribo
  | 'editor'           // Compatibilidade legada (mapeado para organizacao)
  | 'viewer';          // Compatibilidade legada (mapeado para membro)

// --- AUTH TYPES ---
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  personId?: string; // Vínculo com registro em Person (para participantes)
  churchMemberId?: string;
  isWorshipMember?: boolean;
  isWorshipLeader?: boolean;
  worshipTeamId?: string;
}

export interface Person {
  id: string;
  name: string;
  amountPaid: number;
  totalPrice: number;
  ageGroup: AgeGroup;
  personType: PersonType;
  teamId: TeamId;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  lastPaymentDate?: string;
  paymentHistory?: number[];
}

export interface Proof {
  id: string;
  title: string;
  points: number;
  status: 'Pendente' | 'Concluída';
  description: string;
  rules?: string;
  // New fields
  location?: string;
  maxPoints?: number;
}

// --- NOVOS TIPOS PARA GINCANA AVANÇADA ---

export interface ScoreEvent {
  id: string;
  timestamp: string;
  teamId: TeamId;
  proofId?: string; // Optional (pode ser pontuação avulsa)
  pointsDelta: number;
  reason: string;
  source: 'MANUAL' | 'JUIZ' | 'SISTEMA';
  judgeId?: string;
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  category: string;
  proofId?: string; // Se vinculado a uma prova específica
  isAcquired: boolean;
}

export interface ScheduleItem {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO String or HH:mm
  day: string; // "Sábado", "Domingo"
  proofId?: string; // Link opcional para prova
  location?: string;
}

export interface JudgeEvaluation {
  id: string;
  proofId: string;
  teamId: TeamId;
  judgeName: string;
  criteria: Record<string, number>; // ex: { 'Criatividade': 9, 'Tempo': 10 }
  totalPoints: number;
  timestamp: string;
}

// --- NOVOS TIPOS PARA ORGANIZAÇÃO ---

export type TransactionCategory =
  | 'DIZIMO'
  | 'OFERTA'
  | 'INSCRICAO'
  | 'CANTINA'
  | 'DESPESA_FIXA'
  | 'MINISTERIO'
  | 'MANUTENCAO'
  | 'ACAO_SOCIAL'
  | 'ALUGUEL_CHACARA'
  | 'OUTROS';
export type TransactionType = 'ENTRADA' | 'SAIDA';

export interface Product {
  id: string;
  name: string;
  costPrice: number; // Preço de custo
  sellPrice: number; // Preço de venda
  stock: number;
  minStock: number;
  category: string;
  isActive?: boolean;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string;
  paymentMethod?: PaymentMethod;
  referenceId?: string; // ID da Venda (Cantina) ou ID da Pessoa (Inscrição)
  
  // Novos campos para Pendência
  personId?: string;
  personName?: string;
  isSettled?: boolean; // Se false, é uma pendência em aberto. Se true, foi pago ou era à vista.
  
  // Novo campo para preservar o histórico de itens quando uma pendência é paga
  items?: SaleItem[];

  // Campos para Cantina Multi-evento
  eventId?: string;
  eventName?: string;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  totalCost: number; // Para cálculo de lucro
  date: string;
  paymentMethod: PaymentMethod;
  
  personId?: string;
  personName?: string;
  
  // Novo campo para controlar se a venda foi paga (para pendências)
  status: 'PAID' | 'PENDING';

  // Campos para Cantina Multi-evento
  eventId?: string;
  eventName?: string;
}

// --- PROJECTION TYPE ---
export interface ProjectionItem {
  id: string;
  label: string;
  amount: number;
  categoryMapping?: TransactionCategory; // To match with real data if possible
  isExecuted?: boolean; // Indicates if this projection has been converted to a real transaction
  executedTransactionId?: string; // Transaction generated when imported to cash flow
  previousRentValue?: number; // Backup to undo ALUGUEL_CHACARA execution
  source?: 'BASE' | 'STOCK' | 'MOVEMENT'; // Origin of the row in cost detail
}

export interface FinancialEvent {
  id: string;
  name: string;
  badge: string;
  dateLabel: string;
  color: string;
  status?: 'ATIVO' | 'ENCERRADO' | 'PLANEJADO';
  targetBudget?: number;
  targetRevenue?: number;
  campYear?: '2026' | '2027';
  description?: string;
}

export interface FixedBillItem {
  id: string;
  title: string;
  category: TransactionCategory;
  amount: number;
  dueDay: number;
  status: 'PAGO' | 'PENDENTE' | 'ATRASADO';
  recurring: boolean;
  notes?: string;
  eventId?: string;
  lastPaidTxId?: string;
}

export interface AppState {
  // Auth State
  user: User | null;
  authReady: boolean;

  // Gincana & Pessoas
  people: Person[];
  proofs: Proof[];
  teamScores: Record<TeamId, number>; // Mantido para compatibilidade rápida, mas derivado de scoreEvents
  scoreEvents: ScoreEvent[]; // Source of Truth
  materials: Material[];
  schedule: ScheduleItem[];
  judgeEvaluations: JudgeEvaluation[];
  isDarkMode: boolean;

  // Financeiro Organização
  transactions: Transaction[];
  fixedCostRent: number; // Aluguel chácara
  
  // Projections & Eventos & Contas Fixas & Histórico 2026
  expenseProjections: ProjectionItem[];
  camp2026People: Person[];
  camp2026Projections: ProjectionItem[];
  financialEvents: FinancialEvent[];
  fixedBills: FixedBillItem[];

  // Cantina
  products: Product[];
  sales: Sale[];

  // Auth Actions
  signIn: (
    email: string,
    name?: string,
    role?: UserRole,
    personId?: string,
    extras?: {
      id?: string;
      avatar_url?: string;
      churchMemberId?: string;
      isWorshipMember?: boolean;
      isWorshipLeader?: boolean;
      worshipTeamId?: string;
    }
  ) => void;
  signOut: () => void;
  setAuthReady: (ready: boolean) => void;

  // Actions
  addPerson: (name?: string) => void;
  setPeople: (people: Person[]) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  resetToOfficialList: () => void;
  syncSupabasePeople: (dbPeople: Person[]) => void;

  setCamp2026People: (people: Person[]) => void;
  addCamp2026Person: (person: Omit<Person, 'id'>) => void;
  updateCamp2026Person: (id: string, updates: Partial<Person>) => void;
  deleteCamp2026Person: (id: string) => void;
  
  updateProof: (id: string, updates: Partial<Proof>) => void;
  // Atualizado para suportar ScoreEvents
  updateScore: (teamId: TeamId, delta: number, reason?: string, proofId?: string, source?: 'MANUAL' | 'JUIZ') => void;
  
  // Gincana Actions
  addMaterial: (m: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  
  addScheduleItem: (i: Omit<ScheduleItem, 'id'>) => void;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;

  registerJudgeEvaluation: (evaluation: Omit<JudgeEvaluation, 'id' | 'timestamp'>) => void;

  // Actions Financeiro
  addTransaction: (t: Omit<Transaction, 'id' | 'date'>) => void;
  setTransactions: (transactions: Transaction[]) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  updateFixedCostRent: (value: number) => void;
  
  // Actions Projeção (2027) & Histórico (2026)
  addProjectionItem: (label: string, amount: number) => void;
  addProjectionEntry: (item: Omit<ProjectionItem, 'id'>) => string;
  updateProjectionItem: (id: string, updates: Partial<ProjectionItem>) => void;
  deleteProjectionItem: (id: string) => void;

  addCamp2026Projection: (item: Omit<ProjectionItem, 'id'>) => string;
  updateCamp2026Projection: (id: string, updates: Partial<ProjectionItem>) => void;
  deleteCamp2026Projection: (id: string) => void;

  // Actions Eventos Financeiros
  setFinancialEvents: (events: FinancialEvent[]) => void;
  addFinancialEvent: (event: Omit<FinancialEvent, 'id'> & { id?: string }) => FinancialEvent;
  updateFinancialEvent: (id: string, updates: Partial<FinancialEvent>) => void;
  deleteFinancialEvent: (id: string) => void;

  // Actions Contas Fixas
  setFixedBills: (bills: FixedBillItem[]) => void;
  addFixedBill: (bill: Omit<FixedBillItem, 'id'>) => FixedBillItem;
  updateFixedBill: (id: string, updates: Partial<FixedBillItem>) => void;
  deleteFixedBill: (id: string) => void;

  // Actions Cantina
  addProduct: (p: Omit<Product, 'id'>) => void;
  setProducts: (products: Product[]) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setSales: (sales: Sale[]) => void;
  
  // Atualizado: registerSale agora lida com a lógica de criar ou não transação
  registerSale: (items: { product: Product, quantity: number }[], method: PaymentMethod, person?: Person) => void;
  
  // Ações de Quitação
  settleSale: (saleId: string, method: PaymentMethod) => void; // Pagar uma compra específica
  settleAllCustomerDebt: (personId: string, method: PaymentMethod) => void; // Pagar tudo

  toggleTheme: () => void;

  // --- MODO DESENVOLVEDOR (Dev Role Switcher) ---
  isDevMode: boolean;
  devRole: UserRole | null;
  simulatedPersonId: string | null;
  toggleDevMode: () => void;
  setDevRole: (role: UserRole | null) => void;
  setSimulatedPersonId: (personId: string | null) => void;
}


