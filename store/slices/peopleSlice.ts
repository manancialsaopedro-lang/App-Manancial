
import { StateCreator } from 'zustand';
import { AppState, Person } from '../../types';
import { INITIAL_PEOPLE, CAMP_TOTAL_PRICE } from '../../constants';

export interface PeopleSlice {
  people: Person[];
  addPerson: (name?: string) => void;
  updatePerson: (id: string, updates: Partial<Person>) => void;
  deletePerson: (id: string) => void;
}

export const createPeopleSlice: StateCreator<
  AppState,
  [],
  [],
  PeopleSlice
> = (set) => ({
  // Initialize with Constants
  people: INITIAL_PEOPLE.map((name, i) => ({
    id: `p-${i}-${Date.now()}`,
    name,
    amountPaid: i < 35 ? CAMP_TOTAL_PRICE : 0,
    totalPrice: CAMP_TOTAL_PRICE,
    ageGroup: (i < 35 ? 'Adulto' : 'Jovem') as any,
    personType: 'Membro', 
    teamId: 'none',
    paymentStatus: i < 35 ? 'PAGO' : 'PENDENTE',
    lastPaymentDate: i < 35 ? new Date().toISOString() : undefined
  })),

  addPerson: (name = 'Novo Participante') => set((state) => ({
    people: [{
      id: `p-${Date.now()}`,
      name,
      amountPaid: 0,
      totalPrice: CAMP_TOTAL_PRICE,
      ageGroup: 'Indefinido',
      personType: 'Membro',
      teamId: 'none',
      paymentStatus: 'PENDENTE'
    }, ...state.people]
  })),

  updatePerson: (id, updates) => set((state) => ({
    people: state.people.map(p => {
      if (p.id === id) {
        const isPaymentUpdate = updates.amountPaid !== undefined && updates.amountPaid !== p.amountPaid;
        const extraUpdates = isPaymentUpdate ? { lastPaymentDate: new Date().toISOString() } : {};
        return { ...p, ...updates, ...extraUpdates };
      }
      return p;
    })
  })),

  deletePerson: (id) => set((state) => ({
    people: state.people.filter(p => p.id !== id)
  })),
});
