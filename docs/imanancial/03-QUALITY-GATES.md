# iMANANCIAL — QUALITY GATES E CRITÉRIOS DE ACEITE (QG-01 A QG-10)

> **Regra Normativa:** Nenhuma implementação de seção, componente ou integração na Landing Page (`/landing`) pode ser marcada como `CONCLUÍDA` se qualquer um dos 10 Quality Gates abaixo estiver pendente, não verificado ou reprovado.

---

## Matriz Oficial de Quality Gates

### QG-01 — Compatibilidade Arquitetural
- **Objetivo:** Garantir que a alteração respeita a stack e a estrutura modular do ecossistema Manancial.
- **Critérios Obrigatórios:**
  1. Código escrito em React 19 + TypeScript estrito, sem erros de compilação (`npx tsc --noEmit` e `npm run build` passando sem falhas).
  2. Estilização compatível com Tailwind CSS v4 (`@import "tailwindcss"` em `index.css`).
  3. Animações importadas exclusivamente de `motion/react` (sem novos imports de `framer-motion` ou bibliotecas não homologadas).
  4. Seções desacopladas em `features/Landing/sections/*` e primitivos em `components/ui/*`, sem reintroduzir código monolítico.
  5. Rotas existentes (`HashRouter` em `index.tsx`) e módulos internos (`/igreja`, `/acampamento`, `/gincana`, `/financeiro`, `/cantina`, `/app/*`) preservados.

### QG-02 — Componente Correto da Biblioteca Aprovada
- **Objetivo:** Impedir a substituição silenciosa de componentes do Component Registry por `div`s genéricas ou componentes improvisados.
- **Critérios Obrigatórios:**
  1. O componente implementado corresponde exatamente ao ID registrado em [01-COMPONENT-REGISTRY.md](./01-COMPONENT-REGISTRY.md) (`NAV-01` a `FTR-01`).
  2. `CAR-01` e `EVT-01` utilizam `shadcn/ui Carousel` + `embla-carousel-react`.
  3. `NAV-01` utiliza `Aceternity Floating Navbar` e `NAV-02` utiliza `shadcn/ui Sheet`.
  4. `VIS-01` utiliza `Aceternity Sticky Scroll Reveal`; `MIN-01` utiliza `Aceternity Bento Grid`; `HIS-01` utiliza `Aceternity Timeline`.
  5. `GAL-01` utiliza `Aceternity Layout Grid` combinado com `GAL-02` (`Magic UI Blur Fade`).
  6. `CRS-01` utiliza `shadcn/ui Tabs`, `Card` e `Badge`; `PIX-01` utiliza `shadcn/ui Tabs`, `Card`, `Button` e `Sonner`; `FAQ-01` utiliza `shadcn/ui Accordion`.

### QG-03 — Fidelidade ao Blueprint
- **Objetivo:** Assegurar que os 24 pontos especificados no Blueprint da seção foram cumpridos integralmente.
- **Critérios Obrigatórios:**
  1. Proporções, estrutura de grid, hierarquia de conteúdo, tipografia, paleta de cores e variantes seguem exatamente o arquivo `docs/imanancial/blueprints/BP-*.md` correspondente.
  2. Nenhuma funcionalidade fora do escopo (como lives, sermões, players de vídeo/áudio ou links de transmissão) foi introduzida.
  3. Toda ação visível (botões, abas, filtros, setas, links, cópia de Pix, envio de formulário) possui handler real e funcional (zero botões mortos).

### QG-04 — Responsividade Mobile / Tablet / Desktop
- **Objetivo:** Garantir experiência impecável em celulares pequenos, intermediários, tablets e telas amplas.
- **Critérios Obrigatórios:**
  1. Verificado nas larguras `360px`, `390px`, `430px` (mobile), `768px`–`1024px` (tablet) e `1280px`–`1440px+` (desktop).
  2. Zero overflow horizontal (`overflow-x-clip` / `overflow-x-hidden` sem elementos vazando a viewport).
  3. Nenhum elemento fixo (`NAV-01`, `Sheet`, modais ou toasts) cobre conteúdo útil sem compensação de padding/scroll-margin.
  4. Respeito a `env(safe-area-inset-top)` e `env(safe-area-inset-bottom)` e uso de `100dvh` onde aplicável.
  5. Artes oficiais de eventos (especialmente em `CAR-01`) sem cortes destrutivos de textos importantes em telas pequenas.

### QG-05 — Acessibilidade e Redução de Movimento
- **Objetivo:** Tornar a interface utilizável por teclado, leitores de tela e pessoas com sensibilidade vestibular.
- **Critérios Obrigatórios:**
  1. Suporte funcional a `prefers-reduced-motion` (via `useReducedMotion()` ou media query CSS), desativando deslocamentos bruscos, tilt 3D e transições pesadas.
  2. Navegação completa por teclado (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`, `ArrowLeft`, `ArrowRight` em carrosséis e abas) com `focus-visible` nítido.
  3. Atributos semânticos e ARIA presentes (`aria-label` em botões de ícone/setas, `aria-expanded`, `role="region"`, `aria-roledescription="carousel"`).
  4. Contraste de texto em conformidade mínima com WCAG AA tanto nas superfícies grafite/petróleo quanto nas superfícies claras.
  5. Alvos de toque em mobile com dimensão mínima de `44x44px`.

### QG-06 — Origem Correta de Dados e Estados Completos
- **Objetivo:** Garantir integração fiel com as fontes reais e tratamento de todos os estados de UI.
- **Critérios Obrigatórios:**
  1. Leitura conectada aos serviços reais (`fetchChurchSiteEvents`, `fetchChurchSitePhotos`, `useWeeklyServices`, `AVAILABLE_CHURCH_COURSES`, `CHURCH_PIX_KEY`) e escrita de solicitações via `createChurchRequest`.
  2. Tratamento explícito dos 5 estados: `loading` (skeletons coerentes), `empty state` (ocultação graciosa em `CAR-01` ou mensagem acolhedora nas demais seções), `error state` (fallback seguro sem tela branca), `success state` e `disabled state`.
  3. Regra de expiração ativa: eventos com `event_date < CURRENT_DATE` nunca aparecem como próximos eventos em `CAR-01` ou `EVT-01`.
  4. Regra de item único em `CAR-01`: se houver apenas 1 evento em destaque, exibir card editorial estático sem setas de carrossel ou paginação inútil; se houver 0, ocultar a seção sem espaço vazio residual.

### QG-07 — Segurança, Autorização e Privacidade (LGPD)
- **Objetivo:** Proteger dados sensíveis e impedir vazamento de controles administrativos para visitantes.
- **Critérios Obrigatórios:**
  1. Nenhum dado pessoal de `church_members`, `church_courses` (matrículas) ou `church_requests` é lido ou exposto na página pública.
  2. Nenhum número pessoal de WhatsApp de pastores ou líderes é exposto no HTML público.
  3. Nenhum jargão técnico, nome de tabela ou botão de desenvolvimento (`AssistiveTouchDev`, `"Admin Livre"`, `"Gerenciar Fotos"` inline para visitantes) aparece na experiência pública.
  4. Operações de escrita administrativa exigem sessão autenticada e validação por RLS no Supabase.

### QG-08 — Desempenho e Carregamento Otimizado
- **Objetivo:** Manter a página leve, fluida a 60fps e sem Cumulative Layout Shift (CLS).
- **Critérios Obrigatórios:**
  1. Imagens abaixo da primeira dobra utilizam `loading="lazy"` e `decoding="async"`, com `aspect-ratio` definido para evitar CLS.
  2. Imagem principal do Hero (`HERO-01`) e slide ativo do `CAR-01` utilizam carregamento prioritário sem bloqueio de renderização.
  3. Listeners de scroll/pointer utilizam `{ passive: true }` ou hooks otimizados do `motion/react` e são limpos no `unmount`.

### QG-09 — Ausência de Regressões
- **Objetivo:** Garantir que a evolução da Landing Page não quebre nenhum módulo do ecossistema Manancial.
- **Critérios Obrigatórios:**
  1. Build de produção (`npm run build`) conclui com código `0`.
  2. Navegação de saída da Landing Page para `/visitante`, `/acampamento/informacoes` e `/login` funciona perfeitamente.
  3. Sincronização entre `/eventos` (`DevEventsPage`), `/igreja` (`DevChurchInfoPage`) e `/landing` continua operando sem conflito de chaves no `localStorage` ou Supabase.

### QG-10 — Registro de Evidências e Atualização do Blueprint
- **Objetivo:** Manter rastreabilidade documental permanente para conversas futuras.
- **Critérios Obrigatórios:**
  1. Os campos **23. Status de implementação** e **24. Evidências de validação** do Blueprint correspondente (`docs/imanancial/blueprints/BP-*.md`) foram atualizados com os arquivos criados/alterados, data e resultados dos testes.
  2. Qualquer decisão arquitetural tomada durante a implementação foi registrada em [04-DECISION-LOG.md](./04-DECISION-LOG.md).
