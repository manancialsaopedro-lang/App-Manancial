import { useEffect } from 'react';
import {
  ADMIN_DEFAULT_EMAIL,
  ADMIN_DEFAULT_PASSWORD,
  getSupabaseClient,
  isAdminEmail,
  isSupabaseConfigured,
} from '../lib/supabase';
import { useAppStore } from '../store';
import { DEFAULT_ADMIN_USER } from '../store/slices/authSlice';
import { UserRole } from '../types';

const normalizeUserRole = (raw?: string | null): UserRole | null => {
  if (!raw) return null;
  const r = String(raw).toLowerCase().trim();
  const validRoles: UserRole[] = [
    'admin',
    'primeiro_pastor',
    'segundo_pastor',
    'equipe_pastoral',
    'pastoral',
    'membro',
    'visitante',
    'organizacao',
    'gincana',
    'louvor',
    'lider_equipe',
  ];
  if (validRoles.includes(r as UserRole)) return r as UserRole;
  if (r === 'pastor' || r === 'presidente' || r === 'primeiro pastor') return 'primeiro_pastor';
  if (r === 'segundo pastor') return 'segundo_pastor';
  if (r === 'equipe pastoral') return 'equipe_pastoral';
  if (r === 'editor' || r === 'tesouraria' || r === 'financeiro' || r === 'caixa' || r === 'cantina' || r === 'organização') return 'organizacao';
  if (r === 'líder de equipe' || r === 'lider de equipe') return 'lider_equipe';
  if (r === 'minister' || r === 'ministro') return 'louvor';
  if (r === 'musico' || r === 'músico' || r === 'musician' || r === 'viewer') return 'membro';
  return null;
};

interface ResolvedSessionContext {
  role: UserRole;
  displayName?: string;
  avatarUrl?: string;
  personId?: string;
  churchMemberId?: string;
  isWorshipMember: boolean;
  isWorshipLeader: boolean;
  worshipTeamId?: string;
}

const resolveUserContext = async (client: any, user: any): Promise<ResolvedSessionContext> => {
  const isBuilderAdmin = isAdminEmail(user?.email);
  const appMetaRole = isBuilderAdmin
    ? 'admin'
    : normalizeUserRole(user?.app_metadata?.role || user?.user_metadata?.role);

  let member: any = null;
  try {
    const emailFilter = user?.email ? `,email.eq.${user.email}` : '';
    const { data } = await client
      .from('church_members')
      .select('id, full_name, role, ministry, is_worship_member, is_worship_leader, worship_team_id, avatar_url')
      .or(`user_id.eq.${user.id}${emailFilter}`)
      .limit(1)
      .maybeSingle();
    member = data;
  } catch (err) {
    console.warn('Erro ao buscar vínculo de church_members:', err);
  }

  let profile: any = null;
  try {
    const { data } = await client
      .from('profiles')
      .select('role, name, avatar_url')
      .eq('id', user.id)
      .maybeSingle();
    profile = data;
  } catch {
    // Opcional se o usuário ainda não tiver profile no Louvor
  }

  let myPersonId: string | undefined;
  try {
    const { data: campPerson } = await client.rpc('get_my_camp_person');
    if (campPerson?.id) {
      myPersonId = String(campPerson.id);
    }
  } catch {
    // RPC opcional
  }

  const isWorshipLeader = Boolean(
    isBuilderAdmin ||
      appMetaRole === 'admin' ||
      member?.is_worship_leader ||
      profile?.role === 'minister' ||
      profile?.role === 'pastor'
  );
  const isWorshipMember = Boolean(
    isWorshipLeader ||
      member?.is_worship_member ||
      member?.ministry === 'Louvor' ||
      profile?.role === 'musician' ||
      appMetaRole === 'louvor'
  );

  let role: UserRole = isBuilderAdmin ? 'admin' : 'membro';
  if (appMetaRole) {
    role = appMetaRole;
  } else if (member?.role) {
    const rawMemberRole = String(member.role).toLowerCase().trim();
    const mapped = normalizeUserRole(member.role);
    if (mapped) {
      role = mapped;
    } else if ((rawMemberRole === 'líder' || rawMemberRole === 'lider') && isWorshipMember) {
      role = 'louvor';
    }
  } else if (profile?.role) {
    const mappedProfile = normalizeUserRole(profile.role);
    if (mappedProfile) role = mappedProfile;
  }

  return {
    role,
    displayName:
      member?.full_name ||
      profile?.name ||
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      (isBuilderAdmin ? 'Caio Augusto' : undefined),
    avatarUrl: member?.avatar_url || profile?.avatar_url || user.user_metadata?.avatar_url || undefined,
    personId: myPersonId,
    churchMemberId: member?.id || (isBuilderAdmin ? 'm-caio-augusto' : undefined),
    isWorshipMember,
    isWorshipLeader,
    worshipTeamId: member?.worship_team_id || undefined,
  };
};

export const useAuthSync = () => {
  useEffect(() => {
    const { signIn, setAuthReady } = useAppStore.getState();

    // Garante imediatamente que o app está pronto e com acesso Admin em Modo Construção
    setAuthReady(true);
    if (!useAppStore.getState().user) {
      signIn(
        DEFAULT_ADMIN_USER.email,
        DEFAULT_ADMIN_USER.name,
        useAppStore.getState().devRole || 'admin',
        undefined,
        {
          id: DEFAULT_ADMIN_USER.id,
          churchMemberId: DEFAULT_ADMIN_USER.churchMemberId,
          isWorshipMember: true,
          isWorshipLeader: true,
        }
      );
    }

    const client = getSupabaseClient();

    if (!isSupabaseConfigured || !client) {
      return;
    }

    const hydrateUser = async (u: any) => {
      const ctx = await resolveUserContext(client, u);
      signIn(u.email || 'user', ctx.displayName, ctx.role, ctx.personId, {
        id: u.id,
        avatar_url: ctx.avatarUrl,
        churchMemberId: ctx.churchMemberId,
        isWorshipMember: ctx.isWorshipMember,
        isWorshipLeader: ctx.isWorshipLeader,
        worshipTeamId: ctx.worshipTeamId,
      });
    };

    const ensureBuilderAdminSession = async () => {
      const state = useAppStore.getState();
      if (!state.isDevMode) return;

      // Mantém o usuário Admin local ativo imediatamente
      if (!state.user) {
        signIn(
          DEFAULT_ADMIN_USER.email,
          DEFAULT_ADMIN_USER.name,
          state.devRole || 'admin',
          undefined,
          {
            id: DEFAULT_ADMIN_USER.id,
            churchMemberId: DEFAULT_ADMIN_USER.churchMemberId,
            isWorshipMember: true,
            isWorshipLeader: true,
          }
        );
      }

      // E autentica silenciosamente no Supabase como Admin para liberar todas as tabelas via RLS
      try {
        const { data } = await client.auth.signInWithPassword({
          email: ADMIN_DEFAULT_EMAIL,
          password: ADMIN_DEFAULT_PASSWORD,
        });
        if (data?.user) {
          await hydrateUser(data.user);
        }
      } catch {
        // Caso offline, permanece com o Admin local sem bloquear nenhuma tela
      }
    };

    // 1. Verifica sessão inicial ou ativa automaticamente a sessão Admin de construção
    client.auth
      .getSession()
      .then(async ({ data }) => {
        const u = data.session?.user;
        if (u) {
          await hydrateUser(u);
        } else {
          await ensureBuilderAdminSession();
        }
        setAuthReady(true);
      })
      .catch(async (err) => {
        console.warn('Session check fallback to Builder Admin:', err);
        await ensureBuilderAdminSession();
        setAuthReady(true);
      });

    // 2. Escuta eventos de autenticação (incluindo PASSWORD_RECOVERY e MAGIC_LINK)
    const { data: authListener } = client.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        try {
          sessionStorage.setItem('manancial_password_recovery_active', '1');
        } catch {
          // ignore
        }
        if (!window.location.hash.includes('/auth/confirm')) {
          window.location.hash = '#/auth/confirm?type=recovery';
        }
      }

      const u = session?.user;
      if (u) {
        await hydrateUser(u);
      } else if (useAppStore.getState().isDevMode) {
        // Não desloga nem bloqueia o construtor se estiver em Modo Construção
        const currentRole = useAppStore.getState().devRole || 'admin';
        signIn(
          DEFAULT_ADMIN_USER.email,
          DEFAULT_ADMIN_USER.name,
          currentRole,
          undefined,
          {
            id: DEFAULT_ADMIN_USER.id,
            churchMemberId: DEFAULT_ADMIN_USER.churchMemberId,
            isWorshipMember: true,
            isWorshipLeader: true,
          }
        );
      }
      setAuthReady(true);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
};
