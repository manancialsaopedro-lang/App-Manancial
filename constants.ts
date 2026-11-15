
import { TeamId, Product, Proof, ScheduleItem, Material, ProjectionItem, Person, FinancialEvent, FixedBillItem } from './types';

export const CAMP_TOTAL_PRICE = 582;
export const CAMP_CHILD_PRICE = 300;
export const CAMP_PAYMENT_DUE_DAY = 20;
export const INSTALLMENT_COUNT = 6;
export const INSTALLMENT_VALUE = Math.round(CAMP_TOTAL_PRICE / INSTALLMENT_COUNT); // R$ 97,00

// Informações Oficiais do Acampamento Manancial 2027
export const CAMP_2027_CONFIG = {
  title: 'Acampamento Manancial 2027',
  year: '2027',
  dates: 'De 05 a 09 de Fevereiro de 2027',
  startDate: '2027-02-05',
  endDate: '2027-02-09',
  durationDays: 5,
  location: 'São Pedro - SP',
  verseReference: 'Salmos 25:14',
  verseText: 'O segredo do Senhor é para aqueles que o temem, e ele lhes mostrará a sua aliança.',
  theme: 'Intimidade & Aliança',
  subtitle: 'Venha viver dias de graça, paz e renovação! Deus te espera!',
  slogan: 'Dias inesquecíveis na presença de Deus!',
  flyerImage: '/acampamento-2027.jpg',
  pixKey: 'pix@igrejamanancial.com.br',
  pricing: {
    total: 582,
    childTotal: 300,
    installments: 6,
    installmentValue: 97,
    dueDay: 20,
    dueDayDescription: 'Todo dia 20 de cada mês',
    paymentMethods: ['PIX', 'Cartão de Débito', 'Cartão de Crédito', 'Dinheiro'] as const,
  },
  pillars: [
    {
      id: 'intimidade',
      title: 'Intimidade com o Senhor',
      subtitle: 'Comunhão Profunda',
      description: 'Momentos intensos de oração no quarto secreto, quebra de rotina e proximidade espiritual genuína com o Pai.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      id: 'louvor',
      title: 'Louvor e Adoração',
      subtitle: 'Céus Abertos',
      description: 'Cultos ao ar livre e vigílias com ministrações proféticas que tocam o trono da graça e renovam as forças.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'oracao',
      title: 'Oração e Fraternidade',
      subtitle: 'Corpo de Cristo',
      description: 'Partilha fraternal, oração mútua, novas amizades bíblicas e restauração de laços entre irmãos da congregação.',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'encontro',
      title: 'Encontro com Deus',
      subtitle: 'Divisor de Águas',
      description: 'Uma experiência de transformação sobrenatural para marcar a sua história espiritual e de toda a sua família.',
      color: 'from-purple-500 to-pink-500',
    },
  ],
  packingList: [
    { category: 'Espiritual & Individual', items: ['Bíblia e caderno de anotações', 'Caneta e garrafinha de água', 'Coração aberto para o mover de Deus'] },
    { category: 'Dormitório & Banho', items: ['Roupa de cama completa (lençol, fronha)', 'Travesseiro e cobertor/edredom leve', 'Toalhas de banho e rosto', 'Itens de higiene pessoal (escova, sabonete, etc.)'] },
    { category: 'Vestuário & Convivência', items: ['Roupas confortáveis para o dia', 'Agasalho para a noite', 'Tênis confortável para as gincanas', 'Roupas adequadas para cultos à noite', 'Roupa de banho apropriada para piscina'] },
    { category: 'Saúde & Conforto', items: ['Protetor solar e repelente', 'Medicamentos de uso contínuo (com receita)', 'Lanterna pequena e carregador de celular'] }
  ]
};

// Reduzido para 3 equipes + org/none
export const TEAM_UI: Record<TeamId, { color: string; border: string; text: string; light: string; name: string }> = {
  alianca: { name: 'Aliança', color: 'bg-yellow-400', border: 'border-yellow-400', text: 'text-yellow-800', light: 'bg-yellow-50' },
  segredo: { name: 'Segredo', color: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-800', light: 'bg-purple-50' },
  caminho: { name: 'Caminho', color: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-800', light: 'bg-emerald-50' },
  org: { name: 'Organização', color: 'bg-gray-800', border: 'border-gray-800', text: 'text-white', light: 'bg-gray-100' },
  none: { name: 'Sem Equipe', color: 'bg-gray-200', border: 'border-gray-300', text: 'text-gray-500', light: 'bg-gray-50' }
};

export const OFFICIAL_CAMP_2027_PEOPLE: Person[] = [
  { id: 'camp-1', name: 'Sidney', amountPaid: 250, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'alianca', paymentStatus: 'PENDENTE', paymentMethod: 'Pix', lastPaymentDate: '2026-10-20', paymentHistory: [250] },
  { id: 'camp-2', name: 'Regina', amountPaid: 250, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'alianca', paymentStatus: 'PENDENTE', paymentMethod: 'Pix', lastPaymentDate: '2026-10-20', paymentHistory: [250] },
  { id: 'camp-3', name: 'Rodrigo', amountPaid: 0, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', paymentHistory: [] },
  { id: 'camp-4', name: 'Milene', amountPaid: 0, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', paymentHistory: [] },
  { id: 'camp-5', name: 'Caio', amountPaid: 0, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', paymentHistory: [] },
  { id: 'camp-6', name: 'Nicoly', amountPaid: 0, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', paymentHistory: [] },
  { id: 'camp-7', name: 'Lucas', amountPaid: 0, totalPrice: 582, ageGroup: 'Jovem', personType: 'Membro', teamId: 'segredo', paymentStatus: 'PENDENTE', paymentHistory: [] },
  { id: 'camp-8', name: 'Carlinhos', amountPaid: 582, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'segredo', paymentStatus: 'PAGO', paymentMethod: 'Pix', lastPaymentDate: '2026-11-10', paymentHistory: [198, 315, 69] },
  { id: 'camp-9', name: 'Cris', amountPaid: 582, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'segredo', paymentStatus: 'PAGO', paymentMethod: 'Pix', lastPaymentDate: '2026-11-10', paymentHistory: [150, 270, 135, 27] },
  { id: 'camp-10', name: 'Vitoria', amountPaid: 582, totalPrice: 582, ageGroup: 'Jovem', personType: 'Membro', teamId: 'caminho', paymentStatus: 'PAGO', paymentMethod: 'Pix', lastPaymentDate: '2026-11-10', paymentHistory: [246, 315, 21] },
  { id: 'camp-11', name: 'Lucas Jr', amountPaid: 582, totalPrice: 582, ageGroup: 'Jovem', personType: 'Membro', teamId: 'caminho', paymentStatus: 'PAGO', paymentMethod: 'Pix', lastPaymentDate: '2026-11-10', paymentHistory: [204, 360, 18] },
  { id: 'camp-12', name: 'Serginho', amountPaid: 582, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'caminho', paymentStatus: 'PAGO', paymentMethod: 'Pix', lastPaymentDate: '2026-11-10', paymentHistory: [150, 200, 100, 150] },
  { id: 'camp-13', name: 'Shirley', amountPaid: 582, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'caminho', paymentStatus: 'PAGO', paymentMethod: 'Pix', lastPaymentDate: '2026-11-10', paymentHistory: [150, 200, 100, 150] },
  { id: 'camp-14', name: 'Nenê', amountPaid: 500, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'alianca', paymentStatus: 'PENDENTE', paymentMethod: 'Pix', lastPaymentDate: '2026-11-05', paymentHistory: [100, 100, 100, 100, 100] },
  { id: 'camp-15', name: 'Rosinha', amountPaid: 500, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'alianca', paymentStatus: 'PENDENTE', paymentMethod: 'Pix', lastPaymentDate: '2026-11-05', paymentHistory: [100, 100, 100, 100, 100] },
  { id: 'camp-16', name: 'João', amountPaid: 470, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'segredo', paymentStatus: 'PENDENTE', paymentMethod: 'Pix', lastPaymentDate: '2026-11-05', paymentHistory: [70, 100, 100, 100, 100] },
  { id: 'camp-17', name: 'Aysla', amountPaid: 200, totalPrice: 582, ageGroup: 'Jovem', personType: 'Membro', teamId: 'alianca', paymentStatus: 'PENDENTE', paymentMethod: 'Pix', lastPaymentDate: '2026-10-20', paymentHistory: [100, 100] },
  { id: 'camp-18', name: 'Ricardo', amountPaid: 200, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'alianca', paymentStatus: 'PENDENTE', paymentMethod: 'Pix', lastPaymentDate: '2026-10-20', paymentHistory: [100, 100] },
  { id: 'camp-19', name: 'Marcão', amountPaid: 300, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'segredo', paymentStatus: 'PENDENTE', paymentMethod: 'Pix', lastPaymentDate: '2026-11-01', paymentHistory: [100, 100, 100] },
  { id: 'camp-20', name: 'Fabiana', amountPaid: 300, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'segredo', paymentStatus: 'PENDENTE', paymentMethod: 'Pix', lastPaymentDate: '2026-11-01', paymentHistory: [100, 100, 100] },
  { id: 'camp-21', name: 'Davi', amountPaid: 300, totalPrice: 300, ageGroup: 'Criança', personType: 'Membro', teamId: 'segredo', paymentStatus: 'PAGO', paymentMethod: 'Pix', lastPaymentDate: '2026-11-01', paymentHistory: [100, 100, 100] },
  { id: 'camp-22', name: 'Renato', amountPaid: 280, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'caminho', paymentStatus: 'PENDENTE', paymentMethod: 'Pix', lastPaymentDate: '2026-10-28', paymentHistory: [100, 100, 80] },
  { id: 'camp-23', name: 'Sandra', amountPaid: 280, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'caminho', paymentStatus: 'PENDENTE', paymentMethod: 'Pix', lastPaymentDate: '2026-10-28', paymentHistory: [100, 100, 80] },
  { id: 'camp-24', name: 'William Jr', amountPaid: 350, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'alianca', paymentStatus: 'PENDENTE', paymentMethod: 'Pix', lastPaymentDate: '2026-11-02', paymentHistory: [100, 100, 150] },
  { id: 'camp-25', name: 'Larissa', amountPaid: 350, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'alianca', paymentStatus: 'PENDENTE', paymentMethod: 'Pix', lastPaymentDate: '2026-11-02', paymentHistory: [100, 100, 150] },
  { id: 'camp-26', name: 'Aparecida', amountPaid: 0, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', paymentHistory: [] },
  { id: 'camp-27', name: 'Antônio', amountPaid: 0, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', paymentHistory: [] },
  { id: 'camp-28', name: 'Janaina', amountPaid: 0, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', paymentHistory: [] },
  { id: 'camp-29', name: 'Beto', amountPaid: 0, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', paymentHistory: [] },
  { id: 'camp-30', name: 'Silvia', amountPaid: 0, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', paymentHistory: [] },
  { id: 'camp-31', name: 'Pedro', amountPaid: 0, totalPrice: 300, ageGroup: 'Criança', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', paymentHistory: [] },
  { id: 'camp-32', name: 'Sara', amountPaid: 0, totalPrice: 300, ageGroup: 'Criança', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', paymentHistory: [] },
  { id: 'camp-33', name: 'Zenita', amountPaid: 300, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'segredo', paymentStatus: 'PENDENTE', paymentMethod: 'Pix', lastPaymentDate: '2026-11-01', paymentHistory: [100, 100, 100] },
  { id: 'camp-34', name: 'Pr Adenilson', amountPaid: 0, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'org', paymentStatus: 'PENDENTE', paymentHistory: [] },
  { id: 'camp-35', name: 'Erica', amountPaid: 0, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', paymentHistory: [] },
  { id: 'camp-36', name: 'Isabela', amountPaid: 0, totalPrice: 582, ageGroup: 'Jovem', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', paymentHistory: [] },
  { id: 'camp-37', name: 'Angela', amountPaid: 200, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'caminho', paymentStatus: 'PENDENTE', paymentMethod: 'Pix', lastPaymentDate: '2026-10-20', paymentHistory: [100, 100] },
  { id: 'camp-38', name: 'Adilson', amountPaid: 200, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'caminho', paymentStatus: 'PENDENTE', paymentMethod: 'Pix', lastPaymentDate: '2026-10-20', paymentHistory: [100, 100] },
  { id: 'camp-39', name: 'Alexandre', amountPaid: 97, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'segredo', paymentStatus: 'PENDENTE', paymentMethod: 'Pix', lastPaymentDate: '2026-10-20', paymentHistory: [97] },
  { id: 'camp-40', name: 'Elaine', amountPaid: 97, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'segredo', paymentStatus: 'PENDENTE', paymentMethod: 'Pix', lastPaymentDate: '2026-10-20', paymentHistory: [97] },
  { id: 'camp-41', name: 'Matheus', amountPaid: 194, totalPrice: 582, ageGroup: 'Jovem', personType: 'Membro', teamId: 'caminho', paymentStatus: 'PENDENTE', paymentMethod: 'Pix', lastPaymentDate: '2026-10-20', paymentHistory: [194] },
  { id: 'camp-42', name: 'Maria Eduarda', amountPaid: 0, totalPrice: 582, ageGroup: 'Jovem', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', paymentHistory: [] },
  { id: 'camp-43', name: 'João Henrique', amountPaid: 0, totalPrice: 582, ageGroup: 'Jovem', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', paymentHistory: [] },
  { id: 'camp-44', name: 'Valdineia', amountPaid: 0, totalPrice: 582, ageGroup: 'Adulto', personType: 'Membro', teamId: 'none', paymentStatus: 'PENDENTE', paymentHistory: [] }
];

export const INITIAL_PEOPLE = OFFICIAL_CAMP_2027_PEOPLE.map((p) => p.name);

export const INITIAL_PROJECTIONS: ProjectionItem[] = [
  { id: 'proj-1', label: 'Chácara (Aluguel)', amount: 12500, categoryMapping: 'ALUGUEL_CHACARA', isExecuted: false, source: 'BASE' },
  { id: 'proj-2', label: 'Cozinheiro', amount: 3000, isExecuted: false, source: 'BASE' },
  { id: 'proj-3', label: 'Tenda', amount: 1600, isExecuted: false, source: 'BASE' },
  { id: 'proj-4', label: 'Açougue', amount: 4000, isExecuted: false, source: 'BASE' },
  { id: 'proj-5', label: 'Leite', amount: 550, isExecuted: false, source: 'BASE' },
  { id: 'proj-6', label: 'Supermercado', amount: 800, isExecuted: false, source: 'BASE' },
  { id: 'proj-7', label: 'Cantina (Reposição)', amount: 500, isExecuted: false, source: 'BASE' },
  { id: 'proj-8', label: 'Som / Equipamento', amount: 1800, isExecuted: false, source: 'BASE' },
];

// --- DADOS DO ROTEIRO OFICIAL ---

export const INITIAL_PROOFS: Proof[] = [
  { 
    id: 'p-versiculo', 
    title: 'Prova do Versículo', 
    points: 100, 
    status: 'Pendente', 
    description: 'Salmos 25:14 - Decorar e recitar.', 
    rules: 'O participante deve recitar o versículo tema de cor, sem nenhuma consulta.' 
  },
  { 
    id: 'p-gincana-pais', 
    title: 'Gincana com os Pais', 
    points: 300, 
    status: 'Pendente', 
    description: 'Atividades recreativas no campo envolvendo integração.',
    rules: 'Sábado às 14h00. Pontuação baseada em participação e vitórias nas micro-atividades.'
  },
  { 
    id: 'p-teatro', 
    title: 'Noite Temática', 
    points: 500, 
    status: 'Pendente', 
    description: 'Apresentação teatral e temática baseada no tema do acampamento.',
    rules: 'Domingo às 14h00. Critérios: Criatividade, Figurino, Mensagem e Envolvimento da Equipe.'
  },
  { 
    id: 'p-torta', 
    title: 'Passa ou Repassa / Torta', 
    points: 400, 
    status: 'Pendente', 
    description: 'Perguntas bíblicas e conhecimentos gerais com torta na cara.',
    rules: 'Segunda às 14h00. Errou, passa ou leva torta.'
  },
  { 
    id: 'p-quartos', 
    title: 'Inspeção de Quartos', 
    points: 50, 
    status: 'Pendente', 
    description: 'Organização e limpeza dos alojamentos.',
    rules: 'Avaliação surpresa diária pela organização.'
  },
  { 
    id: 'p-cultos', 
    title: 'Pontualidade nos Cultos', 
    points: 50, 
    status: 'Pendente', 
    description: 'Presença e pontualidade de toda a equipe.',
    rules: 'Contagem feita 5 minutos após o início programado.'
  }
];

export const INITIAL_SCHEDULE: ScheduleItem[] = [
  // Sexta-feira
  { id: 's-sex-1', day: 'Sexta-feira', startTime: '18:00', title: 'Chegada / Check-in', description: 'Acomodação nos quartos' },
  { id: 's-sex-2', day: 'Sexta-feira', startTime: '19:30', title: 'Jantar', description: '' },
  { id: 's-sex-3', day: 'Sexta-feira', startTime: '21:00', title: 'Culto de Abertura', description: 'Intimidade & Aliança' },
  { id: 's-sex-4', day: 'Sexta-feira', startTime: '23:00', title: 'Identidade das Equipes', description: 'Definição de Nomes e Gritos de Guerra' },
  
  // Sábado (Começa com o lanche da madruga de sexta)
  { id: 's-sab-0', day: 'Sábado', startTime: '00:00', title: 'Lanche e Recolher', description: 'Pós atividade de sexta' },
  { id: 's-sab-1', day: 'Sábado', startTime: '08:00', title: 'Café da Manhã', description: '' },
  { id: 's-sab-2', day: 'Sábado', startTime: '09:00', title: 'Culto da Manhã', description: '' },
  { id: 's-sab-3', day: 'Sábado', startTime: '11:00', title: 'Tempo Livre', description: 'Piscina liberada' },
  { id: 's-sab-4', day: 'Sábado', startTime: '11:30', title: 'Almoço', description: '' },
  { id: 's-sab-5', day: 'Sábado', startTime: '12:30', title: 'Descanso', description: '' },
  { id: 's-sab-6', day: 'Sábado', startTime: '14:00', title: 'Gincana com os Pais', description: 'Atividades no Campo', proofId: 'p-gincana-pais' },
  { id: 's-sab-7', day: 'Sábado', startTime: '17:00', title: 'Lazer / Banho', description: '' },
  { id: 's-sab-8', day: 'Sábado', startTime: '19:30', title: 'Jantar', description: '' },
  { id: 's-sab-9', day: 'Sábado', startTime: '21:00', title: 'Culto da Noite', description: '' },
  { id: 's-sab-10', day: 'Sábado', startTime: '23:00', title: 'Atividade Noturna', description: 'Recreativa' },

  // Domingo
  { id: 's-dom-1', day: 'Domingo', startTime: '08:00', title: 'Café da Manhã', description: '' },
  { id: 's-dom-2', day: 'Domingo', startTime: '09:00', title: 'Culto da Manhã', description: '' },
  { id: 's-dom-3', day: 'Domingo', startTime: '11:30', title: 'Almoço', description: '' },
  { id: 's-dom-4', day: 'Domingo', startTime: '12:30', title: 'Preparação Teatro', description: 'Ensaio das equipes' },
  { id: 's-dom-5', day: 'Domingo', startTime: '14:00', title: 'Noite Temática', description: 'Apresentação Salão Principal', proofId: 'p-teatro' },
  { id: 's-dom-6', day: 'Domingo', startTime: '17:00', title: 'Tempo Livre', description: '' },
  { id: 's-dom-7', day: 'Domingo', startTime: '19:30', title: 'Jantar', description: '' },
  { id: 's-dom-8', day: 'Domingo', startTime: '21:00', title: 'Culto da Noite', description: '' },
  { id: 's-dom-9', day: 'Domingo', startTime: '22:30', title: 'Social e Lanche', description: '' },

  // Segunda
  { id: 's-seg-1', day: 'Segunda-feira', startTime: '08:00', title: 'Café da Manhã', description: '' },
  { id: 's-seg-2', day: 'Segunda-feira', startTime: '09:00', title: 'Culto da Manhã', description: '' },
  { id: 's-seg-3', day: 'Segunda-feira', startTime: '11:30', title: 'Almoço', description: '' },
  { id: 's-seg-4', day: 'Segunda-feira', startTime: '14:00', title: 'Passa ou Repassa', description: 'Torta na Cara', proofId: 'p-torta' },
  { id: 's-seg-5', day: 'Segunda-feira', startTime: '17:00', title: 'Banho', description: '' },
  { id: 's-seg-6', day: 'Segunda-feira', startTime: '19:30', title: 'Jantar Especial', description: '' },
  { id: 's-seg-7', day: 'Segunda-feira', startTime: '21:00', title: 'Grande Culto de Encerramento', description: 'Celebração Final' },

  // Terça
  { id: 's-ter-1', day: 'Terça-feira', startTime: '08:00', title: 'Café da Manhã', description: '' },
  { id: 's-ter-2', day: 'Terça-feira', startTime: '09:00', title: 'Premiação das Equipes', description: 'Encerramento Oficial' },
  { id: 's-ter-3', day: 'Terça-feira', startTime: '10:30', title: 'Limpeza e Malas', description: 'Organização quartos' },
  { id: 's-ter-4', day: 'Terça-feira', startTime: '11:30', title: 'Almoço de Despedida', description: '' },
  { id: 's-ter-5', day: 'Terça-feira', startTime: '13:00', title: 'Saída', description: 'Retorno' },
];

export const INITIAL_MATERIALS: Omit<Material, 'id'>[] = [
  // Teatro
  { name: 'Figurinos', quantity: 10, category: 'Teatro', isAcquired: false, proofId: 'p-teatro' },
  { name: 'Cenário (Papelão/Tintas)', quantity: 5, category: 'Teatro', isAcquired: false, proofId: 'p-teatro' },
  { name: 'Microfones', quantity: 4, category: 'Som', isAcquired: true, proofId: 'p-teatro' },
  
  // Torta na Cara
  { name: 'Chantilly (Spray ou Caixa)', quantity: 10, category: 'Gincana', isAcquired: false, proofId: 'p-torta' },
  { name: 'Amido de Milho', quantity: 2, category: 'Gincana', isAcquired: false, proofId: 'p-torta' },
  { name: 'Pratinhos de Papel', quantity: 50, category: 'Gincana', isAcquired: false, proofId: 'p-torta' },
  { name: 'Cartões de Perguntas', quantity: 50, category: 'Papelaria', isAcquired: false, proofId: 'p-torta' },
  
  // Geral
  { name: 'Troféu Campeão', quantity: 1, category: 'Premiação', isAcquired: false },
  { name: 'Medalhas', quantity: 50, category: 'Premiação', isAcquired: false },
  { name: 'Apito', quantity: 2, category: 'Geral', isAcquired: true },
  { name: 'Coletes Coloridos', quantity: 30, category: 'Geral', isAcquired: true },
];

export const INITIAL_PRODUCTS: Omit<Product, 'id'>[] = [
  { name: 'Salgadinho', costPrice: 2.50, sellPrice: 5.00, stock: 50, minStock: 10, category: 'Comida' },
  { name: 'Chocolate', costPrice: 3.00, sellPrice: 6.00, stock: 30, minStock: 5, category: 'Doce' },
  { name: 'Refrigerante Lata', costPrice: 2.80, sellPrice: 6.00, stock: 100, minStock: 20, category: 'Bebida' },
  { name: 'Sorvete', costPrice: 4.00, sellPrice: 8.00, stock: 20, minStock: 5, category: 'Gelado' },
];

export const INITIAL_FINANCIAL_EVENTS: FinancialEvent[] = [
  {
    id: 'acampamento-2027',
    name: 'Acampamento Manancial 2027',
    badge: 'Retiro Oficial • 05 a 09 Fev/2027',
    dateLabel: '05 a 09 de Fevereiro de 2027',
    color: 'from-purple-500 to-indigo-600',
    status: 'ATIVO',
    targetBudget: 24750,
    targetRevenue: 26500,
    campYear: '2027',
    description: 'Retiro espiritual anual em São Pedro - SP (Adultos R$ 582 / 6x R$ 97 • Crianças R$ 300).'
  },
  {
    id: 'acampamento-2026',
    name: 'Acampamento Manancial 2026',
    badge: 'Histórico & Fechamento • Fev/2026',
    dateLabel: '13 a 18 de Fevereiro de 2026',
    color: 'from-amber-500 to-orange-600',
    status: 'ENCERRADO',
    targetBudget: 22250,
    targetRevenue: 23500,
    campYear: '2026',
    description: 'Edição realizada em Fevereiro/2026 (Inscrições R$ 432,00, Cantina e Custos Executados).'
  },
  {
    id: 'tesouraria-geral',
    name: 'Tesouraria Geral da Igreja',
    badge: 'Operação Mensal • 365 Dias',
    dateLabel: 'Contínuo (Anual)',
    color: 'from-emerald-500 to-teal-600',
    status: 'ATIVO',
    targetBudget: 8500,
    targetRevenue: 14000,
    description: 'Dízimos, ofertas, manutenção do templo, ação social e despesas fixas da igreja.'
  },
  {
    id: 'cultos-domingo',
    name: 'Cantina • Cultos Dominicais',
    badge: 'Operação Semanal',
    dateLabel: 'Todos os Domingos',
    color: 'from-cyan-500 to-blue-600',
    status: 'ATIVO',
    targetBudget: 1200,
    targetRevenue: 3200,
    description: 'Operação recorrente da cantina e lanchonete após os cultos de domingo.'
  },
  {
    id: 'encontro-jovens',
    name: 'Encontro de Jovens Manancial',
    badge: 'Evento Especial',
    dateLabel: 'Mensal / Sábados',
    color: 'from-blue-500 to-indigo-600',
    status: 'PLANEJADO',
    targetBudget: 1500,
    targetRevenue: 2200,
    description: 'Eventos, vigílias e congressos da rede de jovens.'
  },
  {
    id: 'conferencia-mulheres',
    name: 'Conferência de Mulheres',
    badge: 'Evento Ministerial',
    dateLabel: 'Semestral',
    color: 'from-pink-500 to-rose-600',
    status: 'PLANEJADO',
    targetBudget: 2000,
    targetRevenue: 2800,
    description: 'Chá e conferência do ministério de mulheres.'
  }
];

export const INITIAL_FIXED_BILLS: FixedBillItem[] = [
  { id: 'bill-1', title: 'Aluguel / Manutenção do Templo', category: 'DESPESA_FIXA', amount: 2800, dueDay: 10, status: 'PAGO', recurring: true, eventId: 'tesouraria-geral' },
  { id: 'bill-2', title: 'Energia Elétrica (CPFL)', category: 'DESPESA_FIXA', amount: 420, dueDay: 15, status: 'PAGO', recurring: true, eventId: 'tesouraria-geral' },
  { id: 'bill-3', title: 'Água & Saneamento', category: 'DESPESA_FIXA', amount: 165, dueDay: 18, status: 'PENDENTE', recurring: true, eventId: 'tesouraria-geral' },
  { id: 'bill-4', title: 'Internet Fibra & Mídia', category: 'DESPESA_FIXA', amount: 149.9, dueDay: 20, status: 'PENDENTE', recurring: true, eventId: 'tesouraria-geral' },
  { id: 'bill-5', title: 'Parcela Sinal Chácara Acampamento 2027', category: 'ALUGUEL_CHACARA', amount: 2500, dueDay: 25, status: 'PENDENTE', recurring: false, eventId: 'acampamento-2027' },
  { id: 'bill-6', title: 'Insumos & Cesta Básica (Ação Social)', category: 'ACAO_SOCIAL', amount: 650, dueDay: 28, status: 'PENDENTE', recurring: true, eventId: 'tesouraria-geral' },
];

export const INITIAL_CAMP_2026_PROJECTIONS: ProjectionItem[] = [
  { id: 'proj26-1', label: 'Chácara (Aluguel 2026)', amount: 15000, categoryMapping: 'ALUGUEL_CHACARA', isExecuted: true, source: 'BASE' },
  { id: 'proj26-2', label: 'Cozinheiro & Equipe Cozinha (2026)', amount: 2800, categoryMapping: 'OUTROS', isExecuted: true, source: 'BASE' },
  { id: 'proj26-3', label: 'Tenda & Estrutura (2026)', amount: 1500, categoryMapping: 'OUTROS', isExecuted: true, source: 'BASE' },
  { id: 'proj26-4', label: 'Açougue & Carnes (2026)', amount: 3600, categoryMapping: 'OUTROS', isExecuted: true, source: 'BASE' },
  { id: 'proj26-5', label: 'Leite (Compra 110L - Fev/2026)', amount: 550, categoryMapping: 'OUTROS', isExecuted: true, source: 'MOVEMENT' },
  { id: 'proj26-6', label: 'Supermercado & Descartáveis (2026)', amount: 950, categoryMapping: 'OUTROS', isExecuted: true, source: 'BASE' },
  { id: 'proj26-7', label: 'Insumos Cantina (Sorvetes, Açaí, Bebidas, Salgados)', amount: 1850, categoryMapping: 'CANTINA', isExecuted: true, source: 'STOCK' },
  { id: 'proj26-8', label: 'Som, Iluminação & Gincana (2026)', amount: 1200, categoryMapping: 'MINISTERIO', isExecuted: true, source: 'BASE' },
];

export const INITIAL_CAMP_2026_PEOPLE: Person[] = [
  { id: 'p-1770698026804', name: 'Lucas', amountPaid: 432, totalPrice: 432, ageGroup: 'Jovem', personType: 'Membro', teamId: 'segredo', paymentStatus: 'PAGO', paymentMethod: 'Pix', lastPaymentDate: '2026-02-10' },
  { id: 'p-1770698004501', name: 'Nicoly', amountPaid: 432, totalPrice: 432, ageGroup: 'Jovem', personType: 'Membro', teamId: 'caminho', paymentStatus: 'PAGO', paymentMethod: 'Pix', lastPaymentDate: '2026-02-10' },
  { id: 'p-1770697996215', name: 'Caio', amountPaid: 432, totalPrice: 432, ageGroup: 'Jovem', personType: 'Membro', teamId: 'org', paymentStatus: 'PAGO', paymentMethod: 'Pix', lastPaymentDate: '2026-02-10' },
  { id: 'p-1770697983569', name: 'Milene', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'alianca', paymentStatus: 'PAGO', paymentMethod: 'Pix', lastPaymentDate: '2026-02-10' },
  { id: 'p-1770697976105', name: 'Rodrigo', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'alianca', paymentStatus: 'PAGO', paymentMethod: 'Pix', lastPaymentDate: '2026-02-10' },
  { id: 'p-1770697967855', name: 'Regina', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'alianca', paymentStatus: 'PAGO', paymentMethod: 'Pix', lastPaymentDate: '2026-02-10' },
  { id: 'p-1770697960916', name: 'Sidney', amountPaid: 432, totalPrice: 432, ageGroup: 'Adulto', personType: 'Membro', teamId: 'alianca', paymentStatus: 'PAGO', paymentMethod: 'Pix', lastPaymentDate: '2026-02-10' },
];

