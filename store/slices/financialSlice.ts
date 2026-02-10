
import { StateCreator } from 'zustand';
import { AppState, Transaction, ProjectionItem, Product, Sale, PaymentMethod, Person } from '../../types';
import { INITIAL_PROJECTIONS, INITIAL_PRODUCTS } from '../../constants';

export interface FinancialSlice {
  transactions: Transaction[];
  fixedCostRent: number;
  expenseProjections: ProjectionItem[];
  products: Product[];
  sales: Sale[];

  addTransaction: (t: Omit<Transaction, 'id' | 'date'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  updateFixedCostRent: (value: number) => void;
  addProjectionItem: (label: string, amount: number) => void;
  updateProjectionItem: (id: string, updates: Partial<ProjectionItem>) => void;
  deleteProjectionItem: (id: string) => void;
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  registerSale: (items: { product: Product, quantity: number }[], method: PaymentMethod, person?: Person) => void;
  settleSale: (saleId: string, method: PaymentMethod) => void;
  settleAllCustomerDebt: (personId: string, method: PaymentMethod) => void;
}

export const createFinancialSlice: StateCreator<
  AppState,
  [],
  [],
  FinancialSlice
> = (set) => ({
  transactions: [],
  fixedCostRent: 15000,
  expenseProjections: INITIAL_PROJECTIONS,
  products: INITIAL_PRODUCTS.map((p, i) => ({ ...p, id: `prod-${i}` })) as Product[],
  sales: [],

  addTransaction: (t) => set((state) => ({
    transactions: [{ ...t, id: `tx-${Date.now()}`, date: new Date().toISOString() }, ...state.transactions]
  })),

  updateTransaction: (id, updates) => set((state) => ({
    transactions: state.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
  })),

  removeTransaction: (id) => set((state) => ({
    transactions: state.transactions.filter(t => t.id !== id)
  })),

  updateFixedCostRent: (value) => set(() => ({ fixedCostRent: value })),

  addProjectionItem: (label, amount) => set((state) => ({
    expenseProjections: [...state.expenseProjections, { id: `proj-${Date.now()}`, label, amount }]
  })),

  updateProjectionItem: (id, updates) => set((state) => ({
    expenseProjections: state.expenseProjections.map(p => p.id === id ? { ...p, ...updates } : p)
  })),

  deleteProjectionItem: (id) => set((state) => ({
    expenseProjections: state.expenseProjections.filter(p => p.id !== id)
  })),

  addProduct: (p) => set((state) => ({
    products: [...state.products, { ...p, id: `prod-${Date.now()}` }]
  })),

  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
  })),

  deleteProduct: (id) => set((state) => ({
    products: state.products.filter(p => p.id !== id)
  })),

  registerSale: (items, method, person) => set((state) => {
    const total = items.reduce((acc, item) => acc + (item.product.sellPrice * item.quantity), 0);
    const totalCost = items.reduce((acc, item) => acc + (item.product.costPrice * item.quantity), 0);
    
    const isPending = method === 'Pendência';

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      items: items.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        unitPrice: i.product.sellPrice,
        unitCost: i.product.costPrice
      })),
      total,
      totalCost,
      date: new Date().toISOString(),
      paymentMethod: method,
      personId: person?.id,
      personName: person?.name,
      status: isPending ? 'PENDING' : 'PAID'
    };

    const updatedProducts = state.products.map(p => {
      const itemSold = items.find(i => i.product.id === p.id);
      if (itemSold) {
        return { ...p, stock: p.stock - itemSold.quantity };
      }
      return p;
    });

    let newTransactions = state.transactions;
    if (!isPending) {
      const newTransaction: Transaction = {
        id: `tx-sale-${Date.now()}`,
        description: person ? `Venda Cantina: ${person.name}` : `Venda Cantina #${newSale.id.slice(-4)}`,
        amount: total,
        type: 'ENTRADA',
        category: 'CANTINA',
        date: new Date().toISOString(),
        paymentMethod: method,
        referenceId: newSale.id,
        personId: person?.id,
        personName: person?.name,
        isSettled: true,
        items: newSale.items
      };
      newTransactions = [newTransaction, ...state.transactions];
    }

    return {
      products: updatedProducts,
      sales: [newSale, ...state.sales],
      transactions: newTransactions
    };
  }),

  settleSale: (saleId, method) => set((state) => {
    const sale = state.sales.find(s => s.id === saleId);
    if (!sale || sale.status === 'PAID') return state;

    const updatedSales = state.sales.map(s => s.id === saleId ? { ...s, status: 'PAID' as const, paymentMethod: method } : s);

    const newTx: Transaction = {
      id: `tx-settle-${Date.now()}`,
      description: `Recebimento Pendência: ${sale.personName || 'Cliente'} (Venda #${sale.id.slice(-4)})`,
      amount: sale.total,
      type: 'ENTRADA',
      category: 'CANTINA',
      date: new Date().toISOString(),
      paymentMethod: method,
      referenceId: sale.id,
      personId: sale.personId,
      personName: sale.personName,
      isSettled: true,
      items: sale.items
    };

    return {
      sales: updatedSales,
      transactions: [newTx, ...state.transactions]
    };
  }),

  settleAllCustomerDebt: (personId, method) => set((state) => {
    const pendingSales = state.sales.filter(s => s.personId === personId && s.status === 'PENDING');
    if (pendingSales.length === 0) return state;

    const totalAmount = pendingSales.reduce((acc, s) => acc + s.total, 0);
    const personName = pendingSales[0].personName || 'Cliente';

    const updatedSales = state.sales.map(s => {
      if (s.personId === personId && s.status === 'PENDING') {
        return { ...s, status: 'PAID' as const, paymentMethod: method };
      }
      return s;
    });

    const allItems = pendingSales.flatMap(s => s.items);

    const newTx: Transaction = {
      id: `tx-settle-all-${Date.now()}`,
      description: `Recebimento Pendência Total: ${personName}`,
      amount: totalAmount,
      type: 'ENTRADA',
      category: 'CANTINA',
      date: new Date().toISOString(),
      paymentMethod: method,
      personId: personId,
      personName: personName,
      isSettled: true,
      items: allItems
    };

    return {
      sales: updatedSales,
      transactions: [newTx, ...state.transactions]
    };
  })
});
