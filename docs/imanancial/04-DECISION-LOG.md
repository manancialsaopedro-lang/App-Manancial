# iMANANCIAL — DECISION LOG (REGISTRO DE DECISÕES ARQUITETURAIS)

> **Fonte Única de Verdade para Decisões de Arquitetura, Produto, UI e Segurança.**
> Antes de alterar padrões estruturais, consulte este registro. Novas decisões devem receber um identificador sequencial (`DA-XX`).

---

## Registro de Decisões Aprovadas

### DA-01 — Estratégia de Rota da Landing Page (`/` vs. `/landing`)
- **Decisão:** Preservar a rota `/landing` como endereço canônico da `ChurchLandingPage` e manter `/` com a `ManancialSplashScreen` (pré-page fluida) até decisão explícita de promoção para a raiz, garantindo que todos os links internos do Portal Gerencial (`/igreja`, `/eventos`) e da Splash apontem consistentemente para `/landing`.
- **Justificativa:** O roteador atual ([index.tsx](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/index.tsx#L243-L300)) e os atalhos administrativos em `DevLayout.tsx` e `DevEventsPage.tsx` já referenciam `/landing`. Manter a compatibilidade evita quebrar links existentes durante a refatoração modular das seções.
- **Data:** `2026-11-16`
- **Componentes Envolvidos:** `index.tsx`, `ChurchLandingPage.tsx`, `NAV-01`, `FTR-01`.
- **Restrições:** Todos os links de âncora internos da Landing Page devem usar scroll suave por ID (`scrollToSection`) para não conflitar com o `HashRouter` (`#/landing`).
- **Estado de Aprovação:** `APROVADO`

---

### DA-02 — Isolamento de Controles Administrativos e `AssistiveTouchDev` na Superfície Pública
- **Decisão:** A interface pública do iManancial (`/landing`) não deve exibir o botão flutuante `AssistiveTouchDev` nem botões inline de `"Gerenciar Fotos"` / `"Enviar Fotos"` espalhados pelas seções para visitantes. A gestão de fotos, eventos e horários deve ocorrer no Portal Gerencial (`/eventos` e `/igreja`) ou por meio de um controle administrativo discreto e exclusivo para sessões reais autenticadas de Pastor/Admin.
- **Justificativa:** Na auditoria da Fase 0, verificou-se que `isDevMode: true` autentica automaticamente `DEFAULT_ADMIN_USER` e expõe ferramentas internas de desenvolvimento (`AssistiveTouchDev` com 50+ rotas) e botões de edição sobre a página pública do visitante, violando a Fase 1 (linguagem pública limpa) e a Fase 6 (separação público/admin).
- **Data:** `2026-11-16`
- **Componentes Envolvidos:** `index.tsx`, `components/AssistiveTouchDev.tsx`, `features/Landing/ChurchLandingPage.tsx`, `GAL-01`.
- **Restrições:** Nenhuma nomenclatura de desenvolvimento (`Admin Livre`, `Dev`, `Supabase`, `Bucket`) pode ser renderizada para visitantes.
- **Estado de Aprovação:** `APROVADO`

---

### DA-03 — Contrato de Dados, Ordenação e Filtro de Expiração para `CAR-01` e `EVT-01`
- **Decisão:**
  1. O **Featured Editorial Carousel (`CAR-01`)** consumirá exclusivamente registros de `public.church_events` (via `fetchChurchSiteEvents`) que atendam simultaneamente a: `is_upcoming === true`, `is_featured === true` e `eventDate >= todayISO` (data local `YYYY-MM-DD`).
  2. A seção **Próximos Eventos (`EVT-01`)** consumirá registros com `is_upcoming === true` e `eventDate >= todayISO`, ordenados por `eventDate ASC`.
  3. Regra de cardinalidade do `CAR-01`:
     - `>= 2` destaques: renderiza `shadcn/ui Carousel` + `Embla` (`align: 'center'`, `autoplay: false`).
     - `1` destaque: renderiza layout editorial central estático, **ocultando** setas e indicadores de paginação.
     - `0` destaques: **oculta integralmente** a seção `<section id="destaques-carrossel">` (`return null`), sem gerar padding ou espaço vazio.
- **Justificativa:** A tabela `public.church_events` possui `is_featured` e `is_upcoming`, mas não filtra datas passadas automaticamente. Filtrar por `eventDate >= todayISO` impede que eventos já encerrados apareçam como próximos destaques sem exigir migração imediata de banco.
- **Data:** `2026-11-16`
- **Componentes Envolvidos:** `CAR-01`, `EVT-01`, `features/Church/data/churchSiteContentApi.ts`.
- **Restrições:** Autoplay proibido em `CAR-01`. Loop ativado em `CAR-01` somente quando houver `>= 4` slides para evitar falhas visuais de clonagem nas bordas laterais do Embla em modo `align: 'center'`.
- **Estado de Aprovação:** `APROVADO`

---

### DA-04 — Fonte de Dados do Catálogo de Cursos (`CRS-01`) vs. Tabela `church_courses`
- **Decisão:** A seção pública de Cursos e Discipulado (`CRS-01`) lerá o catálogo institucional estático `AVAILABLE_CHURCH_COURSES` ([churchMemberData.ts](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/features/Church/data/churchMemberData.ts#L336-L430)) e enviará manifestações de interesse/inscrição para `public.church_requests` via `createChurchRequest({ source: 'LANDING_PAGE', type: 'Ensino & Discipulado', ... })`. A tabela `public.church_courses` **jamais** será consultada na Landing Page.
- **Justificativa:** A auditoria da Fase 6 comprovou que `public.church_courses` armazena matrículas nominais de alunos (`student_name`, `phone_whatsapp`, `completed_lessons`) e possui RLS restrita à equipe pastoral e ao próprio aluno autenticado.
- **Data:** `2026-11-16`
- **Componentes Envolvidos:** `CRS-01`, `CON-01`, `features/Church/data/churchMemberData.ts`, `features/Church/data/churchModulesApi.ts`.
- **Restrições:** Proibido expor nomes de alunos matriculados na interface pública.
- **Estado de Aprovação:** `APROVADO`

---

### DA-05 — Resiliência e Fallback de Horários Semanais de Culto (`INFO-01`)
- **Decisão:** Na leitura pública para a seção `INFO-01`, caso `fetchWeeklyServices()` retorne uma lista vazia (`0` registros em `public.church_weekly_services`) ou falhe por rede, a interface pública preservará e exibirá a programação institucional padrão (`DEFAULT_WEEKLY_SERVICES`: Culto da Família aos Domingos 19:00, Tarde da Bênção às Segundas 19:30, Culto de Ensino / Curso de Teologia às Terças 08:00 e Culto de Adoração às Quintas 19:30).
- **Justificativa:** Atualmente a tabela `public.church_weekly_services` está com `0` linhas no banco remoto, fazendo com que `useWeeklyServices()` substitua o estado inicial por `[]` após o `fetch`, esvaziando a grade de horários na Landing Page.
- **Data:** `2026-11-16`
- **Componentes Envolvidos:** `INFO-01`, `features/Church/data/churchWeeklyServices.ts`.
- **Restrições:** No Portal Gerencial (`/igreja`), o administrador continua vendo o estado real do banco para poder cadastrar/editar horários.
- **Estado de Aprovação:** `APROVADO`

---

### DA-06 — Hardening de Políticas RLS em `church_events`, `church_site_photos` e `church-media`
- **Decisão:** Documentar e planejar para a etapa de integração de dados (`manancial-data-integrator`) a substituição das políticas RLS permissivas `{public}` de escrita (`"Portal write church_events"`, `"Portal manage church_site_photos"` e uploads/deletes anônimos em `storage.objects` para `church-media`) por políticas restritas ao papel `authenticated` com validação `app.can_manage_programming() OR app.is_pastoral_team()`, mantendo `SELECT` público (`anon, authenticated`).
- **Justificativa:** Em PostgreSQL RLS, políticas `PERMISSIVE` são combinadas com `OR`. As políticas `{public}` atuais permitem escrita/exclusão anônima nos eventos e fotos do site.
- **Data:** `2026-11-16`
- **Componentes Envolvidos:** Banco Supabase (`public.church_events`, `public.church_site_photos`, `storage.objects`), Skill `manancial-data-integrator`.
- **Restrições:** Não executar migrações sem autorização explícita na fase correspondente.
- **Estado de Aprovação:** `APROVADO`

---

### DA-07 — Consolidação das Galerias Fotográficas em `GAL-01` + `GAL-02`
- **Decisão:** Eliminar a repetição de 6 instâncias de `SitePhotoGallerySection` espalhadas pelo corpo da Landing Page e consolidar o acervo fotográfico de eventos realizados e ministérios na seção dedicada **Galeria de Eventos Anteriores (`GAL-01` Aceternity Layout Grid + `GAL-02` Magic UI Blur Fade)**, equipada com filtros por categoria/iniciativa (`SiteGallerySectionKey`).
- **Justificativa:** A repetição de 6 galerias completas ao longo da página atual degrada a performance de carregamento de imagens, quebra o ritmo editorial e duplica controles de UI.
- **Data:** `2026-11-16`
- **Componentes Envolvidos:** `GAL-01`, `GAL-02`, `ID-01`, `MIN-01`, `SOC-01`, `EVT-01`.
- **Restrições:** As seções `ID-01`, `MIN-01` e `SOC-01` usarão apenas fotografias editoriais curadas de capa, remetendo o visitante à seção `GAL-01` caso deseje explorar o álbum completo.
- **Estado de Aprovação:** `APROVADO`

---

### DA-08 — Padronização `motion/react`, Tailwind CSS v4 e Direção Visual Dark Graphite & Deep Teal
- **Decisão:**
  1. Unificar todas as animações da Landing Page no pacote `motion/react` (`motion: ^14.9.0`).
  2. Adaptar todos os componentes `shadcn/ui`, `Aceternity UI` e `Magic UI` para Tailwind CSS v4 sem dependência de `tailwind.config.js`.
  3. Adotar a direção de arte **Dark Graphite & Deep Teal** (`#070B0E`, `#0A1015`, `#082F38`, `#06B6D4`) como superfície dominante para as seções de impacto (`NAV-01`, `HERO-01`, `CAR-01`, `VIS-01`, `GAL-01`, `FTR-01`), intercalada com respiros editoriais de alto contraste.
- **Justificativa:** Garante fidelidade máxima à referência visual do `CAR-01` (Elevation Style com fundo grafite profundo) e evita conflitos de pacotes no React 19.
- **Data:** `2026-11-16`
- **Componentes Envolvidos:** Todos os componentes do Component Registry (`NAV-01` a `FTR-01`).
- **Restrições:** Proibido instalar `GSAP`, `Three.js` ou `Lenis`.
- **Estado de Aprovação:** `APROVADO`
