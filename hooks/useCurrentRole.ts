import { useMemo } from 'react';
import { useAppStore } from '../store';
import { Person, UserRole } from '../types';

export interface CurrentRoleInfo {
  activeRole: UserRole;
  isDevMode: boolean;
  isOverridden: boolean;
  simulatedPerson: Person | null;
  canAccessOrg: boolean;
  canAccessGincana: boolean;
  canAccessPastoral: boolean;
  canAccessMember: boolean;
}

export const useCurrentRole = (): CurrentRoleInfo => {
  const { user, isDevMode, devRole, simulatedPersonId, people } = useAppStore();

  const activeRole: UserRole = useMemo(() => {
    if (isDevMode && devRole) {
      return devRole;
    }
    // Normalization for legacy roles
    if (user?.role === 'admin') return 'pastoral';
    if (user?.role === 'editor') return 'organizacao';
    return (user?.role as UserRole) || 'pastoral';
  }, [isDevMode, devRole, user?.role]);

  const simulatedPerson = useMemo(() => {
    if (simulatedPersonId) {
      const found = people.find((p) => p.id === simulatedPersonId);
      if (found) return found;
    }
    // Fallback: Pick the first person in list with an assigned team if available
    const assignedPerson = people.find((p) => p.teamId && p.teamId !== 'none' && p.teamId !== 'org');
    return assignedPerson || people[0] || null;
  }, [simulatedPersonId, people]);

  const permissions = useMemo(() => {
    switch (activeRole) {
      case 'pastoral':
      case 'admin':
        return {
          canAccessOrg: true,
          canAccessGincana: true,
          canAccessPastoral: true,
          canAccessMember: true,
        };
      case 'organizacao':
      case 'editor':
        return {
          canAccessOrg: true,
          canAccessGincana: false,
          canAccessPastoral: false,
          canAccessMember: true,
        };
      case 'gincana':
        return {
          canAccessOrg: false,
          canAccessGincana: true,
          canAccessPastoral: false,
          canAccessMember: true,
        };
      case 'lider_equipe':
        return {
          canAccessOrg: false,
          canAccessGincana: true,
          canAccessPastoral: false,
          canAccessMember: true,
        };
      case 'membro':
      case 'viewer':
      default:
        return {
          canAccessOrg: false,
          canAccessGincana: false,
          canAccessPastoral: false,
          canAccessMember: true,
        };
    }
  }, [activeRole]);

  return {
    activeRole,
    isDevMode,
    isOverridden: isDevMode && !!devRole,
    simulatedPerson,
    ...permissions,
  };
};
