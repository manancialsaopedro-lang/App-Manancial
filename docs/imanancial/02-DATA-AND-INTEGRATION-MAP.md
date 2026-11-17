# iMANANCIAL — MAPA DE CONTEÚDOS, DADOS E INTEGRAÇÕES SUPABASE

> **Baseado na auditoria real do banco de dados (`supabase-manancial`) e dos serviços em `features/Church/data/*`.**
> **Regra de Ouro:** Não criar novas tabelas automaticamente. Não expor dados pessoais, administrativos ou financeiros na superfície pública.

---

## 1. Classificação e Segregação de Dados

### 1.1. Matriz de Domínios de Dados

| Categoria | Definição | Estruturas / Tabelas Reais | Visibilidade na Landing Page (`/landing`) |
| :--- | :--- | :--- | :--- |
| **Dados Públicos** | Informações institucionais, horários de culto ativos, eventos publicados, fotos de galeria aprovadas, catálogo de cursos e chave Pix CNPJ oficial. | `church_weekly_services` (`SELECT`), `church_events` (`SELECT`), `church_site_photos` (`SELECT`), bucket `church-media` (`SELECT`), constantes `AVAILABLE_CHURCH_COURSES` e `CHURCH_PIX_KEY`. | **Pública (Leitura Anônima `anon`)** |
| **Dados Administrativos** | Configurações internas do portal, contadores de presença, templates de WhatsApp, relatórios de culto e escalas internas de louvor/gincana. | `church_services`, `church_service_sessions`, `church_attendances`, `whatsapp_templates`, `worship_events`, `songs`, `proofs`. | **Oculta (Acesso exclusivo autenticado nos portais internos)** |
| **Dados Pessoais e Pastorais (LGPD)** | Nomes de membros, telefones/WhatsApp, endereços, datas de nascimento, histórico de visitas, pedidos de oração, notas pastorais e alunos matriculados em cursos. | `church_members`, `church_requests`, `church_courses`, `pastoral_followups`, `people`. | **Estritamente Privada (`SELECT` bloqueado para `anon`).** A Landing Page pode apenas **inserir** (`INSERT` cego) novos pedidos em `church_requests`. |
| **Dados Financeiros** | Fluxo de caixa, dízimos nominais, despesas fixas, vendas de cantina, orçamentos de eventos e pagamentos de acampantes. | `church_finance_movements`, `church_movements`, `financial_events`, `fixed_bills`, `transactions`, `sales`, `sale_items`. | **Estritamente Privada (`SELECT` bloqueado para `anon`).** Apenas a chave Pix institucional (`34.868.191/0001-20`) é pública. |

---

## 2. Estados de Ciclo de Vida do Conteúdo

Como o schema atual de `public.church_events` e `public.church_site_photos` não possui uma coluna `status` textual (`draft`/`published`/`archived`), a segregação do ciclo de vida opera através dos seguintes contratos determinísticos:

1. **Conteúdo Publicado — Destaques (`CAR-01`):**
   - Condição obrigatória: `is_upcoming === true && is_featured === true && event_date >= todayISO`.
   - Exibido no **Featured Editorial Carousel (`CAR-01`)**.
2. **Conteúdo Publicado — Próximos Eventos (`EVT-01`):**
   - Condição obrigatória: `is_upcoming === true && event_date >= todayISO`.
   - Exibido na seção **Próximos Eventos (`EVT-01`)**.
   - **Invariante de Expiração (DA-03):** Eventos cuja `event_date` seja anterior à data atual (`event_date < todayISO`) **nunca** devem ser exibidos em `CAR-01` ou `EVT-01`, mesmo que o campo `is_upcoming` ainda esteja `true` no banco.
3. **Conteúdo Arquivado / Memória Histórica (`GAL-01` / `GAL-02`):**
   - Eventos realizados (`is_upcoming === false` ou `event_date < todayISO`) e registros em `public.church_site_photos` compõem o acervo histórico da seção de Galeria (`GAL-01` + `GAL-02`).
4. **Conteúdo em Rascunho (Draft Local / Pré-Publicação):**
   - Enquanto um administrador edita no modal do Portal Gerencial (`/eventos` ou `/igreja`), os dados permanecem no estado de formulário até a confirmação de publicação no Supabase.

---

## 3. Diagnóstico Detalhado das Estruturas Investigadas (Fase 6)

### 3.1. `public.church_events`
- **Arquivo de Serviço:** [churchSiteContentApi.ts](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/features/Church/data/churchSiteContentApi.ts#L465-L637)
- **Colunas Reais no Banco:**
  - `id` (`text`, PK)
  - `annual_item_id` (`text`, nullable, FK `church_annual_schedule`)
  - `title` (`text`, not null)
  - `event_date` (`date`, not null — formato `YYYY-MM-DD`)
  - `event_time` (`text`, default `'19:30'`)
  - `location` (`text`, nullable)
  - `description` (`text`, nullable)
  - `category` (`text`, default `'Celebração'`)
  - `target_audience` (`text`, default `'Toda a Igreja & Família'`)
  - `registered_count` (`integer`, default `0`)
  - `capacity` (`integer`, nullable)
  - `direct_link` (`text`, nullable — ex.: `'/acampamento'`)
  - `banner_color` (`text`, default `'from-[#082f38] to-[#0e4b57]'`)
  - `badge_text` (`text`, nullable)
  - `gallery_slug` (`text`, nullable — corresponde a `SiteGallerySectionKey`)
  - `cover_image_url` (`text`, nullable)
  - `photos_url` (`text`, nullable)
  - `is_upcoming` (`boolean`, default `true`)
  - `is_featured` (`boolean`, default `false`)
  - `created_at`, `updated_at` (`timestamptz`)
- **Consumo Público:** `CAR-01` (quando `is_featured && is_upcoming && event_date >= todayISO`) e `EVT-01` (quando `is_upcoming && event_date >= todayISO`).
- **Nota sobre Contagem de Inscritos:** Na Landing Page pública (`CAR-01` e `EVT-01`), priorizar título, data, horário, local, categoria, descrição pastoral e CTA; evitar expor métricas administrativas cruas se não agregarem acolhimento ao visitante.

### 3.2. `public.church_site_photos` e Storage `church-media`
- **Arquivo de Serviço:** [churchSiteContentApi.ts](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/features/Church/data/churchSiteContentApi.ts#L643-L865)
- **Colunas Reais no Banco:**
  - `id` (`text`, PK)
  - `section_key` (`text`, not null — `'quem-somos' | 'grupo-jovens' | 'ministerio-familia' | 'ministerio-infantil' | 'mercado-solidario' | 'vigilia' | 'manha-com-deus' | 'evangelismo' | 'acamp-manancial' | 'dia-da-familia' | 'cursos-discipulado'`)
  - `event_id` (`text`, nullable, FK `church_events.id`)
  - `title` (`text`, not null)
  - `caption` (`text`, default `''`)
  - `category_tag` (`text`, default `''`)
  - `image_url` (`text`, not null)
  - `storage_path` (`text`, nullable — caminho no bucket `church-media`)
  - `event_date_label` (`text`, default `''`)
  - `is_featured` (`boolean`, default `false`)
  - `sort_order` (`integer`, default `0`)
  - `uploaded_by` (`text`, nullable)
  - `created_at`, `updated_at` (`timestamptz`)
- **Bucket `church-media`:** Público para leitura (`public: true`), limite de `10 MB` por arquivo, tipos aceitos: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/avif`.
- **Consumo Público:** Seção consolidada de Galeria (`GAL-01` + `GAL-02`) e imagens editoriais das seções `ID-01`, `MIN-01` e `SOC-01`.

### 3.3. `public.church_weekly_services`
- **Arquivo de Serviço:** [churchWeeklyServices.ts](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/features/Church/data/churchWeeklyServices.ts#L1-L136)
- **Colunas Reais no Banco:**
  - `id` (`uuid`, PK)
  - `day_of_week` (`smallint`, `0` = Domingo a `6` = Sábado)
  - `start_time` (`time`)
  - `title` (`text`)
  - `tag` (`text`, nullable)
  - `is_teaching` (`boolean`, default `false` — indica Culto de Ensino / Curso de Teologia)
  - `is_active` (`boolean`, default `true`)
  - `sort_order` (`smallint`, default `0`)
- **Regra de Fallback Obrigatória (DA-05):** Atualmente a tabela remota possui `0` linhas. O hook `useWeeklyServices()` deve manter `DEFAULT_WEEKLY_SERVICES` quando `items.length === 0` na leitura pública da Landing Page (ou sinalizar `isEmptyRemote` permitindo fallback institucional seguro), garantindo que o visitante sempre veja os horários oficiais de culto em `INFO-01`.

### 3.4. `public.church_courses` vs. `AVAILABLE_CHURCH_COURSES`
- **Descoberta Crítica (DA-04):**
  - A tabela `public.church_courses` ([churchModulesApi.ts](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/features/Church/data/churchModulesApi.ts#L497-L523)) possui as colunas `student_name`, `phone_whatsapp`, `course_title`, `teacher_name`, `start_date`, `completed_lessons`, `total_lessons`, `status`, `notes`. Ela representa **matrículas individuais de alunos**, protegidas por RLS (`app.is_pastoral_team() OR user_id = auth.uid()`).
  - Portanto, a seção pública `CRS-01` **NÃO deve consultar `public.church_courses`**.
  - A seção `CRS-01` deve consumir o catálogo institucional `AVAILABLE_CHURCH_COURSES` de [churchMemberData.ts](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/features/Church/data/churchMemberData.ts#L336-L430) (`Curso de Teologia`, `Batismo nas Águas`, `Novos Convertidos`, `Academia de Líderes`, `Curso de Casais`, `Curso de Pais`) e direcionar o CTA de inscrição para o formulário `CON-01` (que grava um registro em `public.church_requests` com `type: 'Ensino & Discipulado'` e `source: 'LANDING_PAGE'`).

### 3.5. `public.church_requests`
- **Arquivo de Serviço:** [churchModulesApi.ts](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/features/Church/data/churchModulesApi.ts#L95-L271)
- **Consumo na Landing Page (`CON-01`):**
  - Apenas **escrita anônima (`INSERT`)** através de `createChurchRequest()`.
  - A policy RLS `church_requests_insert_anon` exige:
    - `source IN ('LANDING_PAGE', 'CAMP_LEAD', 'VISITOR_WIZARD')`
    - `user_id IS NULL`
    - `status = 'Pendente'`
  - O cliente anônimo **não deve encadear `.select()` após `.insert()`** (o que já é tratado corretamente em `createChurchRequest` na linha 263 de `churchModulesApi.ts`).

### 3.6. `public.church_members`
- **Arquivo de Serviço:** [VisitorWizardPage.tsx](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/features/Visitor/VisitorWizardPage.tsx) e [DevVisitorsPage.tsx](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/features/DevPortal/pages/DevVisitorsPage.tsx)
- **Regra na Landing Page:** A Landing Page (`/landing`) **nunca** lê nem escreve diretamente em `public.church_members`. Quando o visitante clica em *"Sou Visitante / Cartão de Boas-Vindas"*, ele é navegado para `/visitante` (`VisitorWizardPage`), que realiza o cadastro com `source = 'QR_WIZARD'` e `invite_id` válido.

---

## 4. Auditoria de Segurança RLS e Plano de Hardening (DA-06)

A inspeção via MCP `supabase-manancial` em `pg_policies` revelou **3 vulnerabilidades de permissão excessiva** que devem ser tratadas na fase de integração de dados (`manancial-data-integrator`):

| Tabela / Objeto | Policy Vulnerável Atual | Problema | Correção Planejada (Fase de Hardening) |
| :--- | :--- | :--- | :--- |
| `public.church_events` | `"Portal write church_events"` (`FOR ALL TO public USING (true) WITH CHECK (true)`) | Permite que qualquer usuário anônimo crie, altere ou apague eventos da igreja. | Remover `"Portal write church_events"`; manter `"Public read church_events"` para `SELECT` e as policies `church_events_insert/update/delete` restritas a `app.can_manage_programming()`. |
| `public.church_site_photos` | `"Portal manage church_site_photos"` (`FOR ALL TO public USING (true) WITH CHECK (true)`) | Permite que qualquer usuário anônimo apague ou insira fotos no site. | Substituir por policies `INSERT`, `UPDATE`, `DELETE` restritas a `authenticated` com `app.can_manage_programming() OR app.is_pastoral_team()`, mantendo `"Public read church_site_photos"` para `SELECT`. |
| `storage.objects` (`church-media`) | `"Allow uploads/updates/deletes to church-media"` (`TO public`) | Permite upload/deleção anônima no bucket `church-media`. | Restringir `INSERT`, `UPDATE`, `DELETE` no bucket `church-media` para `authenticated` com `app.can_manage_programming() OR app.is_pastoral_team()`. |

---

## 5. Gerenciamento Contextual para Pastores e Administradores (DA-02)

1. **Superfície Pública 100% Limpa para Visitantes:**
   - Na rota `/landing`, **nenhum botão de edição**, upload de foto (`"Gerenciar Fotos"`, `"Enviar Fotos"`) ou atalho de desenvolvimento (`AssistiveTouchDev`) deve aparecer misturado às seções públicas para visitantes comuns.
2. **Onde Ocorre a Gestão de Conteúdo:**
   - A gestão primária de eventos e fotos do site ocorre no Portal Gerencial em `/eventos` ([DevEventsPage.tsx](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/features/DevPortal/pages/DevEventsPage.tsx)) e a gestão de horários/dados institucionais ocorre em `/igreja` ([DevChurchInfoPage.tsx](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/features/DevPortal/pages/DevChurchInfoPage.tsx)).
3. **Acesso Contextual Autorizado:**
   - Caso um usuário esteja **realmente autenticado** com papel `admin`, `primeiro_pastor`, `segundo_pastor`, `pastoral` ou `equipe_pastoral` (ou acione um modo de edição contextual explícito), poderá visualizar uma barra ou ação discreta de gerenciamento, sem jamais poluir o layout editorial ou deslocar elementos do visitante.
