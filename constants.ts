
import { TeamId, Product, Proof, ScheduleItem, Material, ProjectionItem } from './types';

export const CAMP_TOTAL_PRICE = 432;
export const INSTALLMENT_COUNT = 6;
export const INSTALLMENT_VALUE = Math.floor(CAMP_TOTAL_PRICE / INSTALLMENT_COUNT); // R$ 72,00

// Reduzido para 3 equipes + org/none
export const TEAM_UI: Record<TeamId, { color: string; border: string; text: string; light: string; name: string }> = {
  alianca: { name: 'AlianÃ§a', color: 'bg-yellow-400', border: 'border-yellow-400', text: 'text-yellow-800', light: 'bg-yellow-50' },
  segredo: { name: 'Segredo', color: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-800', light: 'bg-purple-50' },
  caminho: { name: 'Caminho', color: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-800', light: 'bg-emerald-50' },
  org: { name: 'OrganizaÃ§Ã£o', color: 'bg-gray-800', border: 'border-gray-800', text: 'text-white', light: 'bg-gray-100' },
  none: { name: 'Sem Equipe', color: 'bg-gray-200', border: 'border-gray-300', text: 'text-gray-500', light: 'bg-gray-50' }
};

export const INITIAL_PEOPLE = [
  "Sidney", "Regina", "Rodrigo", "Milene", "Caio", "Nicoly", "Lucas", "Carlinhos", "Cristina", "M.vitoria",
  "Beto", "kaua", "Ana", "Duda", "JoÃ£o", "Larissa", "Matheus", "Alexandre", "Elaine", "JanaÃ­na", "Serlange",
  "Luiza", "SÃ©rgio", "Shirley", "Luiz", "Sandra", "William", "Rosa", "AntÃ´nio", "Maria Ap", "Rebeca",
  "Eloah", "Marcos", "Fabiana", "Davi", "Luna", "Quilherme", "Malu", "Adilson", "Angela", "Enzo", "Carol", "Gilson", "Pamela", "Maria"
];

export const INITIAL_PROJECTIONS: ProjectionItem[] = [
  { id: 'proj-1', label: 'ChÃ¡cara (Aluguel)', amount: 12500, categoryMapping: 'ALUGUEL_CHACARA', isExecuted: false, source: 'BASE' },
  { id: 'proj-2', label: 'Cozinheiro', amount: 3000, isExecuted: false, source: 'BASE' },
  { id: 'proj-3', label: 'Tenda', amount: 1600, isExecuted: false, source: 'BASE' },
  { id: 'proj-4', label: 'AÃ§ougue', amount: 4000, isExecuted: false, source: 'BASE' },
  { id: 'proj-5', label: 'Leite', amount: 550, isExecuted: false, source: 'BASE' },
  { id: 'proj-6', label: 'Supermercado', amount: 800, isExecuted: false, source: 'BASE' },
  { id: 'proj-7', label: 'Cantina (ReposiÃ§Ã£o)', amount: 500, isExecuted: false, source: 'BASE' },
  { id: 'proj-8', label: 'Som / Equipamento', amount: 1800, isExecuted: false, source: 'BASE' },
];

// --- DADOS DO ROTEIRO OFICIAL ---

export const INITIAL_PROOFS: Proof[] = [
  { 
    id: 'p-versiculo', 
    title: 'Prova do VersÃ­culo', 
    points: 100, 
    status: 'Pendente', 
    description: 'Salmos 25:14 - Decorar e recitar.', 
    rules: 'O participante deve recitar o versÃ­culo tema de cor, sem nenhuma consulta.' 
  },
  { 
    id: 'p-gincana-pais', 
    title: 'Gincana com os Pais', 
    points: 300, 
    status: 'Pendente', 
    description: 'Atividades recreativas no campo envolvendo integraÃ§Ã£o.',
    rules: 'SÃ¡bado Ã s 14h00. PontuaÃ§Ã£o baseada em participaÃ§Ã£o e vitÃ³rias nas micro-atividades.'
  },
  { 
    id: 'p-teatro', 
    title: 'Noite TemÃ¡tica', 
    points: 500, 
    status: 'Pendente', 
    description: 'ApresentaÃ§Ã£o teatral e temÃ¡tica baseada no tema do acampamento.',
    rules: 'Domingo Ã s 14h00. CritÃ©rios: Criatividade, Figurino, Mensagem e Envolvimento da Equipe.'
  },
  { 
    id: 'p-torta', 
    title: 'Passa ou Repassa / Torta', 
    points: 400, 
    status: 'Pendente', 
    description: 'Perguntas bÃ­blicas e conhecimentos gerais com torta na cara.',
    rules: 'Segunda Ã s 14h00. Errou, passa ou leva torta.'
  },
  { 
    id: 'p-quartos', 
    title: 'InspeÃ§Ã£o de Quartos', 
    points: 50, 
    status: 'Pendente', 
    description: 'OrganizaÃ§Ã£o e limpeza dos alojamentos.',
    rules: 'AvaliaÃ§Ã£o surpresa diÃ¡ria pela organizaÃ§Ã£o.'
  },
  { 
    id: 'p-cultos', 
    title: 'Pontualidade nos Cultos', 
    points: 50, 
    status: 'Pendente', 
    description: 'PresenÃ§a e pontualidade de toda a equipe.',
    rules: 'Contagem feita 5 minutos apÃ³s o inÃ­cio programado.'
  }
];

export const INITIAL_SCHEDULE: ScheduleItem[] = [
  // Sexta-feira
  { id: 's-sex-1', day: 'Sexta-feira', startTime: '18:00', title: 'Chegada / Check-in', description: 'AcomodaÃ§Ã£o nos quartos' },
  { id: 's-sex-2', day: 'Sexta-feira', startTime: '19:30', title: 'Jantar', description: '' },
  { id: 's-sex-3', day: 'Sexta-feira', startTime: '21:00', title: 'Culto de Abertura', description: 'Intimidade & AlianÃ§a' },
  { id: 's-sex-4', day: 'Sexta-feira', startTime: '23:00', title: 'Identidade das Equipes', description: 'DefiniÃ§Ã£o de Nomes e Gritos de Guerra' },
  
  // SÃ¡bado (ComeÃ§a com o lanche da madruga de sexta)
  { id: 's-sab-0', day: 'SÃ¡bado', startTime: '00:00', title: 'Lanche e Recolher', description: 'PÃ³s atividade de sexta' },
  { id: 's-sab-1', day: 'SÃ¡bado', startTime: '08:00', title: 'CafÃ© da ManhÃ£', description: '' },
  { id: 's-sab-2', day: 'SÃ¡bado', startTime: '09:00', title: 'Culto da ManhÃ£', description: '' },
  { id: 's-sab-3', day: 'SÃ¡bado', startTime: '11:00', title: 'Tempo Livre', description: 'Piscina liberada' },
  { id: 's-sab-4', day: 'SÃ¡bado', startTime: '11:30', title: 'AlmoÃ§o', description: '' },
  { id: 's-sab-5', day: 'SÃ¡bado', startTime: '12:30', title: 'Descanso', description: '' },
  { id: 's-sab-6', day: 'SÃ¡bado', startTime: '14:00', title: 'Gincana com os Pais', description: 'Atividades no Campo', proofId: 'p-gincana-pais' },
  { id: 's-sab-7', day: 'SÃ¡bado', startTime: '17:00', title: 'Lazer / Banho', description: '' },
  { id: 's-sab-8', day: 'SÃ¡bado', startTime: '19:30', title: 'Jantar', description: '' },
  { id: 's-sab-9', day: 'SÃ¡bado', startTime: '21:00', title: 'Culto da Noite', description: '' },
  { id: 's-sab-10', day: 'SÃ¡bado', startTime: '23:00', title: 'Atividade Noturna', description: 'Recreativa' },

  // Domingo
  { id: 's-dom-1', day: 'Domingo', startTime: '08:00', title: 'CafÃ© da ManhÃ£', description: '' },
  { id: 's-dom-2', day: 'Domingo', startTime: '09:00', title: 'Culto da ManhÃ£', description: '' },
  { id: 's-dom-3', day: 'Domingo', startTime: '11:30', title: 'AlmoÃ§o', description: '' },
  { id: 's-dom-4', day: 'Domingo', startTime: '12:30', title: 'PreparaÃ§Ã£o Teatro', description: 'Ensaio das equipes' },
  { id: 's-dom-5', day: 'Domingo', startTime: '14:00', title: 'Noite TemÃ¡tica', description: 'ApresentaÃ§Ã£o SalÃ£o Principal', proofId: 'p-teatro' },
  { id: 's-dom-6', day: 'Domingo', startTime: '17:00', title: 'Tempo Livre', description: '' },
  { id: 's-dom-7', day: 'Domingo', startTime: '19:30', title: 'Jantar', description: '' },
  { id: 's-dom-8', day: 'Domingo', startTime: '21:00', title: 'Culto da Noite', description: '' },
  { id: 's-dom-9', day: 'Domingo', startTime: '22:30', title: 'Social e Lanche', description: '' },

  // Segunda
  { id: 's-seg-1', day: 'Segunda-feira', startTime: '08:00', title: 'CafÃ© da ManhÃ£', description: '' },
  { id: 's-seg-2', day: 'Segunda-feira', startTime: '09:00', title: 'Culto da ManhÃ£', description: '' },
  { id: 's-seg-3', day: 'Segunda-feira', startTime: '11:30', title: 'AlmoÃ§o', description: '' },
  { id: 's-seg-4', day: 'Segunda-feira', startTime: '14:00', title: 'Passa ou Repassa', description: 'Torta na Cara', proofId: 'p-torta' },
  { id: 's-seg-5', day: 'Segunda-feira', startTime: '17:00', title: 'Banho', description: '' },
  { id: 's-seg-6', day: 'Segunda-feira', startTime: '19:30', title: 'Jantar Especial', description: '' },
  { id: 's-seg-7', day: 'Segunda-feira', startTime: '21:00', title: 'Grande Culto de Encerramento', description: 'CelebraÃ§Ã£o Final' },

  // TerÃ§a
  { id: 's-ter-1', day: 'TerÃ§a-feira', startTime: '08:00', title: 'CafÃ© da ManhÃ£', description: '' },
  { id: 's-ter-2', day: 'TerÃ§a-feira', startTime: '09:00', title: 'PremiaÃ§Ã£o das Equipes', description: 'Encerramento Oficial' },
  { id: 's-ter-3', day: 'TerÃ§a-feira', startTime: '10:30', title: 'Limpeza e Malas', description: 'OrganizaÃ§Ã£o quartos' },
  { id: 's-ter-4', day: 'TerÃ§a-feira', startTime: '11:30', title: 'AlmoÃ§o de Despedida', description: '' },
  { id: 's-ter-5', day: 'TerÃ§a-feira', startTime: '13:00', title: 'SaÃ­da', description: 'Retorno' },
];

export const INITIAL_MATERIALS: Omit<Material, 'id'>[] = [
  // Teatro
  { name: 'Figurinos', quantity: 10, category: 'Teatro', isAcquired: false, proofId: 'p-teatro' },
  { name: 'CenÃ¡rio (PapelÃ£o/Tintas)', quantity: 5, category: 'Teatro', isAcquired: false, proofId: 'p-teatro' },
  { name: 'Microfones', quantity: 4, category: 'Som', isAcquired: true, proofId: 'p-teatro' },
  
  // Torta na Cara
  { name: 'Chantilly (Spray ou Caixa)', quantity: 10, category: 'Gincana', isAcquired: false, proofId: 'p-torta' },
  { name: 'Amido de Milho', quantity: 2, category: 'Gincana', isAcquired: false, proofId: 'p-torta' },
  { name: 'Pratinhos de Papel', quantity: 50, category: 'Gincana', isAcquired: false, proofId: 'p-torta' },
  { name: 'CartÃµes de Perguntas', quantity: 50, category: 'Papelaria', isAcquired: false, proofId: 'p-torta' },
  
  // Geral
  { name: 'TrofÃ©u CampeÃ£o', quantity: 1, category: 'PremiaÃ§Ã£o', isAcquired: false },
  { name: 'Medalhas', quantity: 50, category: 'PremiaÃ§Ã£o', isAcquired: false },
  { name: 'Apito', quantity: 2, category: 'Geral', isAcquired: true },
  { name: 'Coletes Coloridos', quantity: 30, category: 'Geral', isAcquired: true },
];

export const INITIAL_PRODUCTS: Omit<Product, 'id'>[] = [
  { name: 'Salgadinho', costPrice: 2.50, sellPrice: 5.00, stock: 50, minStock: 10, category: 'Comida' },
  { name: 'Chocolate', costPrice: 3.00, sellPrice: 6.00, stock: 30, minStock: 5, category: 'Doce' },
  { name: 'Refrigerante Lata', costPrice: 2.80, sellPrice: 6.00, stock: 100, minStock: 20, category: 'Bebida' },
  { name: 'Sorvete', costPrice: 4.00, sellPrice: 8.00, stock: 20, minStock: 5, category: 'Gelado' },
];

