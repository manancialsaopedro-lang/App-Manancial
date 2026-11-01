-- ==============================================================================
-- SCHEMA SUPABASE: GESTÃO ECLESIÁSTICA - IGREJA EVANGÉLICA MANANCIAL
-- Ministério de São Pedro
-- ==============================================================================

-- 1. EXTENSÕES
create extension if not exists "uuid-ossp";

-- 2. TABELA DE MEMBROS DA IGREJA (Independente da tabela de acampamento/gincana)
create table if not exists public.church_members (
    id uuid primary key default uuid_generate_v4(),
    full_name text not null,
    phone_whatsapp text not null,
    email text,
    birth_date date,
    baptism_date date,
    role text not null default 'Membro', -- 'Pastor', 'Presbítero', 'Diácono', 'Líder', 'Membro', 'Congregado', 'Visitante'
    ministry text default 'Nenhum',      -- 'Louvor', 'Recepção', 'Infantil', 'Mídia', 'Intercessão', 'Diaconia'
    status text not null default 'Ativo', -- 'Ativo', 'Em Observação', 'Afastado'
    address text,
    avatar_url text,
    pastoral_notes text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- 3. TABELA DE CULTOS E PROGRAMAÇÕES OFICIAIS
create table if not exists public.church_services (
    id uuid primary key default uuid_generate_v4(),
    title text not null,                -- 'Culto da Família', 'Culto de Ensino', 'Culto de Jovens'
    day_of_week text not null,          -- 'Domingo', 'Quarta-Feira', 'Sábado'
    default_time time not null,         -- '19:30', '09:30'
    description text,
    is_active boolean default true,
    created_at timestamp with time zone default now()
);

-- 4. TABELA DE SESSÕES / ENCONTROS DE CULTO (Datas específicas realizadas)
create table if not exists public.church_service_sessions (
    id uuid primary key default uuid_generate_v4(),
    service_id uuid references public.church_services(id) on delete set null,
    session_date date not null,
    theme text,
    preacher text,
    notes text,
    created_at timestamp with time zone default now()
);

-- 5. TABELA DE PRESENÇA (CHECK-IN DE CULTOS)
create table if not exists public.church_attendances (
    id uuid primary key default uuid_generate_v4(),
    session_id uuid references public.church_service_sessions(id) on delete cascade,
    member_id uuid references public.church_members(id) on delete cascade,
    checked_in_at timestamp with time zone default now(),
    checkin_method text default 'Portaria', -- 'Portaria', 'WhatsApp', 'QR Code', 'Líder'
    unique(session_id, member_id)
);

-- 6. TABELA DE ACOMPANHAMENTO PASTORAL (RADAR DO REBANHO)
create table if not exists public.pastoral_followups (
    id uuid primary key default uuid_generate_v4(),
    member_id uuid references public.church_members(id) on delete cascade,
    followup_type text not null, -- 'WhatsApp', 'Visita', 'Ligação', 'Gabinete'
    date date not null default current_date,
    reason text not null,       -- 'Ausência prolongada', 'Aniversário', 'Pedido de Oração', 'Enfermidade'
    notes text,
    conducted_by text,
    created_at timestamp with time zone default now()
);

-- 7. TABELA DE TEMPLATES DE MENSAGENS WHATSAPP
create table if not exists public.whatsapp_templates (
    id text primary key,
    title text not null,
    category text not null, -- 'Aniversário', 'Ausência', 'Boas-Vindas', 'Lembrete'
    message_body text not null,
    variables text[] default array['nome', 'culto', 'igreja']
);

-- 8. HABILITAR RLS (Row Level Security)
alter table public.church_members enable row level security;
alter table public.church_services enable row level security;
alter table public.church_service_sessions enable row level security;
alter table public.church_attendances enable row level security;
alter table public.pastoral_followups enable row level security;
alter table public.whatsapp_templates enable row level security;

-- Políticas de acesso para usuários autenticados
create policy "Acesso geral para membros autenticados" on public.church_members for all to authenticated using (true);
create policy "Acesso geral para cultos" on public.church_services for all to authenticated using (true);
create policy "Acesso geral para sessões" on public.church_service_sessions for all to authenticated using (true);
create policy "Acesso geral para presenças" on public.church_attendances for all to authenticated using (true);
create policy "Acesso geral para pastoral" on public.pastoral_followups for all to authenticated using (true);
create policy "Acesso geral para templates" on public.whatsapp_templates for all to authenticated using (true);

-- 9. DADOS INICIAIS DE EXEMPLO (SEED)
insert into public.church_services (title, day_of_week, default_time, description) values
('Culto da Família & Celebração', 'Domingo', '19:00', 'Culto principal de celebração com toda a congregação'),
('Escola Bíblica & Ceia', 'Domingo', '09:30', 'Estudo da palavra e santa ceia mensal'),
('Culto de Doutrina e Oração', 'Quarta-Feira', '19:30', 'Estudo bíblico e clamor pelas famílias');

insert into public.whatsapp_templates (id, title, category, message_body) values
('aniversario', 'Parabéns pelo Aniversário', 'Aniversário', 'Graça e Paz, {{nome}}! 🎂✨\nToda a família da Igreja Evangélica Manancial louva a Deus pela sua vida no dia de hoje. Declaramos chuvas de bênçãos, saúde, sabedoria e graça sobre você e sua família!\n\n"O Senhor te abençoe e te guarde!" (Números 6:24)\nCom carinho, Pastor e Liderança Manancial.'),
('falta_acolhimento', 'Sentimos sua Falta no Culto', 'Ausência', 'Paz do Senhor, querido(a) {{nome}}! 🕊️\nSentimos muito a sua falta em nossos últimos encontros na Igreja Manancial. Você e sua família são muito preciosos para nós!\nEstá tudo bem com você? Se precisar de oração ou apoio, saiba que estamos sempre à disposição.\nEsperamos você no próximo culto! Deus te abençoe.'),
('visitante_boas_vindas', 'Boas-Vindas ao Visitante', 'Boas-Vindas', 'Olá, {{nome}}! Paz do Senhor! 🙏\nFoi uma grande alegria ter você conosco no culto da Igreja Evangélica Manancial. Você e sua família são sempre muito bem-vindos em nossa casa espiritual!\nFicamos à disposição para orar pela sua vida. Um forte abraço!'),
('lembrete_culto', 'Lembrete do Culto de Hoje', 'Lembrete', 'Graça e Paz, {{nome}}! ⛪\nPassando para lembrar que hoje temos um momento especial de adoração e palavra na Igreja Manancial às {{horario}}.\nVenha com sua família com o coração aberto para o que Deus preparou. Te esperamos!');
