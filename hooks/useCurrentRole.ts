import { useMemo } from 'react';
import { useAppStore } from '../store';
import { Person, UserRole } from '../types';

export interface CurrentRoleInfo {
  activeRole: UserRole;
  roleLabel: string;
  roleBadge: string;
  defaultRoute: string;
  isDevMode: boolean;
  isOverridden: boolean;
  simulatedPerson: Person | null;
  canAccessOrg: boolean;
  canAccessGincana: boolean;
  canAccessPastoral: boolean;
  canAccessLouvor: boolean;
  canAccessMember: boolean;
  canManageRoles: boolean;
  canDelegateVisits: boolean;
  isFounderPastor: boolean;
}

export const useCurrentRole = (): CurrentRoleInfo => {
  const { user, isDevMode, devRole, simulatedPersonId, people } = useAppStore();

  const activeRole: UserRole = useMemo(() => {
    if (isDevMode && devRole) {
      return devRole;
    }
    if (!user) {
      return 'visitante';
    }
    // Normalization for legacy roles
    if (user.role === 'editor') return 'organizacao';
    if (user.role === 'viewer') return 'membro';
    return user.role || 'membro';
  }, [isDevMode, devRole, user]);

  const simulatedPerson = useMemo(() => {
    // Em modo dev com override de papel, permite escolher/simular uma pessoa para prévia
    if (isDevMode && devRole && simulatedPersonId) {
      const found = people.find((p) => p.id === simulatedPersonId);
      if (found) return found;
    }

    // Visitante anônimo NUNCA herda dados pessoais/financeiros de people[0]
    if (!user && !(isDevMode && devRole)) {
      return null;
    }

    if (user?.personId) {
      const byId = people.find((p) => p.id === user.personId);
      if (byId) return byId;
    }

    if (user?.name) {
      const normalizedUser = user.name.trim().toLowerCase();
      const byName = people.find(
        (p) => p.name.trim().toLowerCase() === normalizedUser
      );
      if (byName) return byName;
    }

    // Somente em simulação dev explícita cai para o primeiro participante da lista
    if (isDevMode && devRole) {
      const assignedPerson = people.find(
        (p) => p.teamId && p.teamId !== 'none' && p.teamId !== 'org'
      );
      return assignedPerson || people[0] || null;
    }

    return null;
  }, [isDevMode, devRole, simulatedPersonId, people, user]);

  const roleConfig = useMemo(() => {
    switch (activeRole) {
      case 'admin':
        return {
          roleLabel: 'Admin / Dev (Caio)',
          roleBadge: '🛠️ Administrador Geral',
          defaultRoute: '/igreja',
          canAccessOrg: true,
          canAccessGincana: true,
          canAccessPastoral: true,
          canAccessLouvor: true,
          canAccessMember: true,
          canManageRoles: true,
          canDelegateVisits: true,
          isFounderPastor: true,
        };
      case 'primeiro_pastor':
      case 'pastoral':
        return {
          roleLabel: 'Pastor da Manancial (Presidente)',
          roleBadge: '👑 Pastor Presidente (Fundador)',
          defaultRoute: '/igreja',
          canAccessOrg: true,
          canAccessGincana: true,
          canAccessPastoral: true,
          canAccessLouvor: true,
          canAccessMember: true,
          canManageRoles: true,
          canDelegateVisits: true,
          isFounderPastor: true,
        };
      case 'segundo_pastor':
        return {
          roleLabel: 'Segundo Pastor da Manancial',
          roleBadge: '🕊️ Segundo Pastor',
          defaultRoute: '/igreja',
          canAccessOrg: true,
          canAccessGincana: true,
          canAccessPastoral: true,
          canAccessLouvor: true,
          canAccessMember: true,
          canManageRoles: true,
          canDelegateVisits: true,
          isFounderPastor: false,
        };
      case 'equipe_pastoral':
        return {
          roleLabel: 'Equipe Pastoral & Liderança',
          roleBadge: '🤝 Equipe Pastoral',
          defaultRoute: '/visitantes',
          canAccessOrg: false,
          canAccessGincana: false,
          canAccessPastoral: true,
          canAccessLouvor: false,
          canAccessMember: true,
          canManageRoles: false,
          canDelegateVisits: true,
          isFounderPastor: false,
        };
      case 'organizacao':
      case 'editor':
        return {
          roleLabel: 'Tesouraria & Cantina',
          roleBadge: '💰 Operação Financeira',
          defaultRoute: '/financeiro',
          canAccessOrg: true,
          canAccessGincana: false,
          canAccessPastoral: false,
          canAccessLouvor: false,
          canAccessMember: true,
          canManageRoles: false,
          canDelegateVisits: false,
          isFounderPastor: false,
        };
      case 'gincana':
      case 'lider_equipe':
        return {
          roleLabel: 'Coordenação Gincana',
          roleBadge: '🏆 Gincana Retiro',
          defaultRoute: '/acampamento',
          canAccessOrg: false,
          canAccessGincana: true,
          canAccessPastoral: false,
          canAccessLouvor: false,
          canAccessMember: true,
          canManageRoles: false,
          canDelegateVisits: false,
          isFounderPastor: false,
        };
      case 'louvor':
        return {
          roleLabel: 'Líder de Louvor',
          roleBadge: '🎵 Min. de Louvor',
          defaultRoute: '/app/dashboard',
          canAccessOrg: false,
          canAccessGincana: false,
          canAccessPastoral: false,
          canAccessLouvor: true,
          canAccessMember: true,
          canManageRoles: false,
          canDelegateVisits: false,
          isFounderPastor: false,
        };
      case 'visitante':
        return {
          roleLabel: 'Visitante',
          roleBadge: '🌱 Visitante',
          defaultRoute: '/visitante',
          canAccessOrg: false,
          canAccessGincana: false,
          canAccessPastoral: false,
          canAccessLouvor: false,
          canAccessMember: false,
          canManageRoles: false,
          canDelegateVisits: false,
          isFounderPastor: false,
        };
      case 'membro':
      case 'viewer':
      default: {
        // Quando não há override de papel para 'membro', preserva o vínculo real Membro + Músico
        const canLouvorAsMember =
          !(isDevMode && devRole) &&
          Boolean(user?.isWorshipMember || user?.isWorshipLeader);
        return {
          roleLabel: canLouvorAsMember ? 'Membro & Louvor' : 'Membro da Igreja',
          roleBadge: canLouvorAsMember ? '🎵👤 Membro + Músico' : '👤 Membro',
          defaultRoute: '/igreja/membro',
          canAccessOrg: false,
          canAccessGincana: false,
          canAccessPastoral: false,
          canAccessLouvor: canLouvorAsMember,
          canAccessMember: true,
          canManageRoles: false,
          canDelegateVisits: false,
          isFounderPastor: false,
        };
      }
    }
  }, [activeRole, isDevMode, devRole, user?.isWorshipMember, user?.isWorshipLeader]);

  return {
    activeRole,
    isDevMode,
    isOverridden: isDevMode && !!devRole,
    simulatedPerson,
    ...roleConfig,
  };
};
