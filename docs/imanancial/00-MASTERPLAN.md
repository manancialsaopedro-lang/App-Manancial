# iMANANCIAL — MASTERPLAN & CONTRATO DO PRODUTO

> **Fonte Única de Verdade para o Produto Público Institucional (`iManancial`)**
> **Instituição:** Igreja Família Manancial — Ministério de São Pedro/SP (`Comunidade Evangélica Manancial`)
> **CNPJ:** `34.868.191/0001-20` • **Endereço:** Av. Ângelo Nogueira, 45 — Centro — São Pedro/SP

---

## 1. Identidade e Contrato do Produto

### 1.1. Propósito do Produto
O portal público **iManancial** (`/landing`) é a porta de entrada digital da **Igreja Família Manancial — Ministério de São Pedro/SP**. Ele existe para servir famílias, visitantes, novos convertidos e membros com clareza pastoral, dignidade visual e integração real ao ecossistema administrativo da igreja.

### 1.2. Objetivos Funcionais Obrigatórios
1. **Acolher visitantes:** Oferecer recepção digital imediata (Cartão de Boas-Vindas em `/visitante` e orientação para primeira visita).
2. **Apresentar identidade, história, visão, missão e valores:** Expor quem somos, nossas raízes em São Pedro/SP (fundada oficialmente em julho de 2018) e nossos fundamentos bíblicos.
3. **Informar horários e localização:** Apresentar de forma escaneável os dias e horários fixos de culto (`church_weekly_services`) e o endereço físico com rota direta no mapa.
4. **Destacar grandes mobilizações e eventos prioritários (`CAR-01`):** Exibir os principais destaques da agenda em um Carrossel Editorial estilo *Elevation Church* de altíssimo impacto visual.
5. **Apresentar ministérios e grupos (`MIN-01`):** Dar visibilidade ao Grupo de Jovens, Ministério da Família (Casais e Pais), Ministério Infantil, Ministério de Louvor e Células/Pequenos Grupos.
6. **Divulgar cursos e discipulado (`CRS-01`):** Apresentar o Curso de Teologia (Pr. Adenilson Freitas), Preparação para o Batismo nas Águas, Novos Convertidos, Curso de Casais, Curso de Pais e Academia de Líderes.
7. **Apresentar assistência social e Mercado Solidário (`SOC-01`):** Comunicar com respeito e dignidade o trabalho diaconal, arrecadação e apoio às famílias.
8. **Divulgar eventos futuros (`EVT-01`):** Listar os próximos eventos publicados e válidos (`is_upcoming = true` e `event_date >= CURRENT_DATE`).
9. **Preservar galerias de eventos anteriores (`GAL-01` / `GAL-02`):** Exibir o acervo fotográfico real sincronizado com o bucket `church-media` e a tabela `church_site_photos`.
10. **Permitir contribuições por Pix (`PIX-01`):** Oferecer chave Pix oficial (CNPJ `34.868.191/0001-20`) com cópia em 1 clique e feedback instantâneo para Dízimos, Ofertas e Mercado Solidário.
11. **Responder dúvidas frequentes (`FAQ-01`):** Reduzir barreiras para quem visita a igreja pela primeira vez.
12. **Oferecer contato e solicitação de visitas (`CON-01`):** Captar pedidos de oração, visitas pastorais e inscrições diretamente para a tabela `church_requests` sem expor números pessoais de WhatsApp de pastores na página pública.
13. **Integrar conteúdos publicados pelo Portal Gerencial:** Refletir em tempo real as atualizações feitas por pastores e administradores em `/igreja` e `/eventos`.

---

## 2. Exclusões Explícitas de Escopo (Invariantes Negativas)

Sob nenhuma circunstância agentes ou desenvolvedores devem planejar, sugerir, criar mocks ou implementar:

- **Transmissões ao vivo (Lives).**
- **Gravações de sermões, mensagens ou pregações.**
- **Biblioteca ou catálogo de mensagens/áudios/vídeos.**
- **Reprodutores (players) de cultos ou mídia de vídeo/áudio na Landing Page.**
- **Página dedicada de lives ou programação online.**
- **Indicadores visuais de transmissão ("Ao Vivo Agora", "Assista Online", badges vermelhos de live).**
- **Integração com YouTube, Spotify, Vimeo ou plataformas equivalentes para sermões.**

> **Regra de Blindagem:** Mesmo que referências visuais externas (como *Elevation Church* ou outros benchmarks) possuam botões *"Watch Online"* ou *"Sermons"*, esses elementos **jamais** devem ser copiados ou adaptados para o iManancial. Toda chamada de ação deve conduzir ao **encontro presencial**, **acolhimento pastoral**, **inscrição em eventos/cursos** ou **participação comunitária**.

---

## 3. Diretriz de Linguagem e Comunicação

- **Tom de Voz:** Pastoral, acolhedor, cristocêntrico, claro, respeitoso e institucionalmente profissional.
- **Proibição de Jargão Técnico na Interface Pública:** É proibido exibir na UI pública termos como `Supabase`, `RLS`, `Bucket`, `Sync`, `Cache Local`, `Portal Dev`, `Modo Construção`, `Admin Livre`, `Lead`, `Slug`, `Bento Grid`, nomes de tabelas (`church_events`, `church_requests`) ou identificadores internos (`CAR-01`, `NAV-01`).

---

## 4. Arquitetura da Página e Ordem Narrativa das Seções

A Landing Page (`/landing`) deve abandonar o formato monolítico atual ([ChurchLandingPage.tsx](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/features/Landing/ChurchLandingPage.tsx)) e ser organizada em seções modulares independentes dentro de `features/Landing/sections/`, seguindo a jornada abaixo:

| Ordem | ID | Seção | Componente Principal | Blueprint |
| :---: | :--- | :--- | :--- | :--- |
| **01** | `NAV-01` / `NAV-02` | Navegação Institucional (Desktop & Mobile) | Aceternity Floating Navbar + `shadcn/ui Sheet` | [BP-NAV-01-02](./blueprints/BP-NAV-01-02-navigation-system.md) |
| **02** | `HERO-01` | Hero Institucional de Acolhimento | Hero Editorial Próprio (Tailwind + Motion) | [BP-HERO-01](./blueprints/BP-HERO-01-editorial-hero.md) |
| **03** | `CAR-01` | **Destaques em Evidência (Prioridade Visual Máxima)** | `shadcn/ui Carousel` + Embla (Elevation Style) | [BP-CAR-01](./blueprints/BP-CAR-01-featured-editorial-carousel.md) |
| **04** | `INFO-01` | Horários de Culto & Localização | `shadcn/ui Card`, `Separator` e `Button` | [BP-INFO-01](./blueprints/BP-INFO-01-service-times-and-location.md) |
| **05** | `ID-01` | Quem Somos — Identidade Institucional | Editorial Split Layout Próprio | [BP-ID-01](./blueprints/BP-ID-01-institutional-identity.md) |
| **06** | `VIS-01` | Visão, Missão e Valores | Aceternity Sticky Scroll Reveal | [BP-VIS-01](./blueprints/BP-VIS-01-vision-mission-values.md) |
| **07** | `HIS-01` | Nossa História em São Pedro/SP | Aceternity Timeline | [BP-HIS-01](./blueprints/BP-HIS-01-church-history-timeline.md) |
| **08** | `MIN-01` | Ministérios, Gerações & Pequenos Grupos | Aceternity Bento Grid | [BP-MIN-01](./blueprints/BP-MIN-01-ministries-bento-grid.md) |
| **09** | `CRS-01` | Cursos, Discipulado, Teologia & Batismo | `shadcn/ui Tabs`, `Card` e `Badge` | [BP-CRS-01](./blueprints/BP-CRS-01-courses-and-discipleship.md) |
| **10** | `SOC-01` | Assistência Social & Mercado Solidário | Composição Editorial Própria | [BP-SOC-01](./blueprints/BP-SOC-01-social-assistance-mercado.md) |
| **11** | `EVT-01` | Calendário de Próximos Eventos | `shadcn/ui Carousel` + Cards de Eventos | [BP-EVT-01](./blueprints/BP-EVT-01-upcoming-events-carousel.md) |
| **12** | `GAL-01` / `GAL-02` | Memória & Galeria de Eventos Anteriores | Aceternity Layout Grid + Magic UI Blur Fade | [BP-GAL-01-02](./blueprints/BP-GAL-01-02-past-events-photo-grid.md) |
| **13** | `PIX-01` | Generosidade, Dízimos, Ofertas & Pix | `shadcn/ui Tabs`, `Card`, `Button` e `Sonner` | [BP-PIX-01](./blueprints/BP-PIX-01-generosity-and-pix.md) |
| **14** | `FAQ-01` | Perguntas Frequentes (Primeira Visita) | `shadcn/ui Accordion` | [BP-FAQ-01](./blueprints/BP-FAQ-01-visitor-accordion.md) |
| **15** | `CON-01` | Recepção Digital, Oração & Solicitação de Visitas | Formulário Editorial Integrado (`church_requests`) | [BP-CON-01](./blueprints/BP-CON-01-pastoral-contact-and-visit.md) |
| **16** | `FTR-01` | Rodapé Institucional Completo | Footer Institucional Próprio | [BP-FTR-01](./blueprints/BP-FTR-01-institutional-footer.md) |

---

## 5. Governança das 5 Camadas de Conhecimento

1. **Camada 1 — Rules Permanentes (`.agents/rules/*.md`):** Invariantes curtas e inegociáveis carregadas automaticamente pelo Antigravity.
2. **Camada 2 — Agent Skills (`.agents/skills/*/SKILL.md`):** Procedimentos operacionais passo a passo para cada papel especializado (`architect`, `ui-director`, `section-builder`, `data-integrator`, `qa-reviewer`).
3. **Camada 3 — Blueprints (`docs/imanancial/blueprints/BP-*.md`):** Contratos técnicos e visuais de 24 pontos para cada seção.
4. **Camada 4 — Prompts de Execução (`docs/imanancial/05-EXECUTION-PROMPTS.md`):** Instruções fatiadas por fase para execução determinística em conversas futuras.
5. **Camada 5 — Quality Gates (`docs/imanancial/03-QUALITY-GATES.md`):** Portões de qualidade `QG-01` a `QG-10` que condicionam o aceite de qualquer entrega.
