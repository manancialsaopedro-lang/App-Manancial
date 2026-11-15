
import { StateCreator } from 'zustand';
import { AppState, Person } from '../../types';
import { CAMP_TOTAL_PRICE, OFFICIAL_CAMP_2027_PEOPLE, INITIAL_CAMP_2026_PEOPLE } from '../../constants';

const is2026Record = (p: Person) =>
  p.totalPrice === 432 || p.id.startsWith('p-1770');

export interface PeopleSlice {
  people: Person[];
  camp2026People: Person[];
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
}

export const createPeopleSlice: StateCreator<
  AppState,
  [],
  [],
  PeopleSlice
> = (set) => ({
  // Initialize with Official 2027 Camp List
  people: OFFICIAL_CAMP_2027_PEOPLE,
  camp2026People: INITIAL_CAMP_2026_PEOPLE,

  addPerson: (name = 'Novo Participante') => set((state) => ({
    people: [{
      id: `p-${Date.now()}`,
      name,
      amountPaid: 0,
      totalPrice: CAMP_TOTAL_PRICE,
      ageGroup: 'Adulto',
      personType: 'Membro',
      teamId: 'none',
      paymentStatus: 'PENDENTE',
      paymentHistory: []
    }, ...state.people]
  })),

  setPeople: (incoming) => set((state) => {
    const list2026 = incoming.filter(is2026Record);
    const list2027 = incoming.filter((p) => !is2026Record(p));

    const current2027Valid = state.people.filter((p) => !is2026Record(p));
    const safe2027 =
      list2027.length > 0
        ? list2027
        : current2027Valid.length > 0
          ? current2027Valid
          : OFFICIAL_CAMP_2027_PEOPLE;

    return {
      people: safe2027,
      camp2026People: list2026.length > 0 ? list2026 : state.camp2026People,
    };
  }),

  syncSupabasePeople: (dbPeople) => set((state) => {
    const list2026 = dbPeople.filter(is2026Record);
    const list2027 = dbPeople.filter((p) => !is2026Record(p));
    const current2027Valid = state.people.filter((p) => !is2026Record(p));

    return {
      camp2026People: list2026.length > 0 ? list2026 : state.camp2026People,
      people:
        list2027.length > 0
          ? list2027
          : current2027Valid.length > 0
            ? current2027Valid
            : OFFICIAL_CAMP_2027_PEOPLE,
    };
  }),

  updatePerson: (id, updates) => set((state) => ({
    people: state.people.map(p => {
      if (p.id === id) {
        const isPaymentUpdate = updates.amountPaid !== undefined && updates.amountPaid !== p.amountPaid;
        const extraUpdates = isPaymentUpdate ? { lastPaymentDate: new Date().toISOString() } : {};
        return { ...p, ...updates, ...extraUpdates };
      }
      return p;
    }),
    camp2026People: state.camp2026People.map(p => {
      if (p.id === id) {
        const isPaymentUpdate = updates.amountPaid !== undefined && updates.amountPaid !== p.amountPaid;
        const extraUpdates = isPaymentUpdate ? { lastPaymentDate: new Date().toISOString() } : {};
        return { ...p, ...updates, ...extraUpdates };
      }
      return p;
    })
  })),

  deletePerson: (id) => set((state) => ({
    people: state.people.filter(p => p.id !== id),
    camp2026People: state.camp2026People.filter(p => p.id !== id)
  })),

  resetToOfficialList: () => set(() => ({
    people: OFFICIAL_CAMP_2027_PEOPLE
  })),

  setCamp2026People: (camp2026People) => set(() => ({
    camp2026People
  })),

  addCamp2026Person: (person) => set((state) => ({
    camp2026People: [{ ...person, id: `p2026-${Date.now()}` }, ...state.camp2026People]
  })),

  updateCamp2026Person: (id, updates) => set((state) => ({
    camp2026People: state.camp2026People.map(p => p.id === id ? { ...p, ...updates } : p)
  })),

  deleteCamp2026Person: (id) => set((state) => ({
    camp2026People: state.camp2026People.filter(p => p.id !== id)
  })),
});
