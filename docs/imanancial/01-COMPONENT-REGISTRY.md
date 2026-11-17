# iMANANCIAL — COMPONENT REGISTRY OFICIAL

> **Política de Componentes:** Nenhuma seção da Landing Page pode substituir os componentes listados abaixo por implementações genéricas sem justificativa técnica documentada e aprovada em [04-DECISION-LOG.md](./04-DECISION-LOG.md).

---

## 1. Stack Tecnológica Autorizada

### 1.1. Tecnologias Principais
- **Framework & Linguagem:** React `^19.2.4` + TypeScript `~5.8.2` (Vite `^6.2.0`).
- **Estilização:** Tailwind CSS v4 (`tailwindcss: ^4.3.4`, `@tailwindcss/vite: ^4.3.4`), `clsx` (`^2.1.1`) e `tailwind-merge` (`^3.7.0`) via helper `cn()` em [lib/utils.ts](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/lib/utils.ts).
- **Sistema Base de Componentes:** `shadcn/ui` (baseado em primitivos `@radix-ui/*`).
- **Motor de Animações:** `Motion for React` (`motion/react`, pacote `motion: ^14.9.0`).

### 1.2. Bibliotecas Complementares Aprovadas
- **Aceternity UI:** Componentes copiados/adaptados em `components/ui/` compatíveis com Tailwind v4 e `motion/react`.
- **Magic UI:** Componente `BlurFade` em `components/ui/blur-fade.tsx`.
- **Embla Carousel:** `embla-carousel-react` para motor de carrossel em `CAR-01` e `EVT-01`.
- **Lucide Icons:** `lucide-react` (`^0.475.0`).
- **Sonner:** `sonner` para feedback de cópia de chave Pix (`PIX-01`) e notificações discretas.

### 1.3. Bibliotecas Proibidas sem Justificativa Comprovada
- **Proibido instalar:** `gsap`, `three`, `@react-three/fiber`, `lenis`, `@studio-freight/lenis`, `swiper`, `slick-carousel`, `react-slick`, `aos`, `lottie-web`.

---

## 2. Catálogo Obrigatório de Componentes (`NAV-01` a `FTR-01`)

| ID | Nome do Componente | Origem / Biblioteca | Documentação Oficial | Caminho Alvo no Projeto | Pacotes NPM Necessários | Seção / Blueprint Associado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NAV-01** | Floating Navbar | Aceternity UI | https://ui.aceternity.com/components/floating-navbar | `components/ui/floating-navbar.tsx` | `motion`, `lucide-react`, `clsx`, `tailwind-merge` | [BP-NAV-01-02](./blueprints/BP-NAV-01-02-navigation-system.md) |
| **NAV-02** | Sheet (Mobile Navigation) | `shadcn/ui` | https://ui.shadcn.com/docs/components/sheet | `components/ui/Sheet.tsx` *(já existe)* | `@radix-ui/react-dialog` *(já instalado)* | [BP-NAV-01-02](./blueprints/BP-NAV-01-02-navigation-system.md) |
| **HERO-01** | Editorial Hero | Próprio (Tailwind + Motion) | https://motion.dev/docs/react-quick-start | `features/Landing/sections/HeroEditorialSection.tsx` | `motion`, `lucide-react` | [BP-HERO-01](./blueprints/BP-HERO-01-editorial-hero.md) |
| **CAR-01** | **Featured Editorial Carousel (Elevation Style)** | `shadcn/ui` Carousel + Embla | https://ui.shadcn.com/docs/components/carousel <br> https://www.embla-carousel.com/get-started/react/ | `components/ui/carousel.tsx` + `features/Landing/sections/FeaturedEditorialCarousel.tsx` | `embla-carousel-react`, `lucide-react` | [BP-CAR-01](./blueprints/BP-CAR-01-featured-editorial-carousel.md) |
| **INFO-01** | Service Times & Location Cards | `shadcn/ui` Card, Separator, Button | https://ui.shadcn.com/docs/components/card <br> https://ui.shadcn.com/docs/components/separator <br> https://ui.shadcn.com/docs/components/button | `components/ui/card.tsx`, `components/ui/separator.tsx`, `components/ui/button.tsx` | `@radix-ui/react-separator`, `@radix-ui/react-slot`, `class-variance-authority` | [BP-INFO-01](./blueprints/BP-INFO-01-service-times-and-location.md) |
| **ID-01** | Editorial Split Layout | Próprio (Tailwind + Motion) | Internamente documentado no Blueprint | `features/Landing/sections/InstitutionalIdentitySection.tsx` | `motion`, `lucide-react` | [BP-ID-01](./blueprints/BP-ID-01-institutional-identity.md) |
| **VIS-01** | Sticky Scroll Reveal | Aceternity UI | https://ui.aceternity.com/components/sticky-scroll-reveal | `components/ui/sticky-scroll-reveal.tsx` | `motion` | [BP-VIS-01](./blueprints/BP-VIS-01-vision-mission-values.md) |
| **HIS-01** | Church History Timeline | Aceternity UI | https://ui.aceternity.com/components/timeline | `components/ui/timeline.tsx` | `motion` | [BP-HIS-01](./blueprints/BP-HIS-01-church-history-timeline.md) |
| **MIN-01** | Ministries Bento Grid | Aceternity UI | https://ui.aceternity.com/components/bento-grid | `components/ui/bento-grid.tsx` | `motion`, `lucide-react` | [BP-MIN-01](./blueprints/BP-MIN-01-ministries-bento-grid.md) |
| **CRS-01** | Courses & Discipleship Showcase | `shadcn/ui` Tabs, Card, Badge | https://ui.shadcn.com/docs/components/tabs <br> https://ui.shadcn.com/docs/components/badge | `components/ui/tabs.tsx`, `components/ui/badge.tsx` | `@radix-ui/react-tabs`, `class-variance-authority` | [BP-CRS-01](./blueprints/BP-CRS-01-courses-and-discipleship.md) |
| **SOC-01** | Social Assistance & Mercado Solidário | Próprio (Composição Editorial) | Internamente documentado no Blueprint | `features/Landing/sections/SocialAssistanceSection.tsx` | `motion`, `lucide-react` | [BP-SOC-01](./blueprints/BP-SOC-01-social-assistance-mercado.md) |
| **GAL-01** | Past Events Layout Grid | Aceternity UI | https://ui.aceternity.com/components/layout-grid | `components/ui/layout-grid.tsx` | `motion` | [BP-GAL-01-02](./blueprints/BP-GAL-01-02-past-events-photo-grid.md) |
| **GAL-02** | Photo Reveal Blur Fade | Magic UI | https://magicui.design/docs/components/blur-fade | `components/ui/blur-fade.tsx` | `motion` | [BP-GAL-01-02](./blueprints/BP-GAL-01-02-past-events-photo-grid.md) |
| **EVT-01** | Upcoming Events Carousel | `shadcn/ui` Carousel + Event Cards | https://ui.shadcn.com/docs/components/carousel | `features/Landing/sections/UpcomingEventsSection.tsx` | `embla-carousel-react` | [BP-EVT-01](./blueprints/BP-EVT-01-upcoming-events-carousel.md) |
| **PIX-01** | Pix Generosity & Contributions | `shadcn/ui` Tabs, Card, Button, Sonner | https://ui.shadcn.com/docs/components/sonner | `components/ui/sonner.tsx` + `features/Landing/sections/PixGenerositySection.tsx` | `sonner`, `@radix-ui/react-tabs` | [BP-PIX-01](./blueprints/BP-PIX-01-generosity-and-pix.md) |
| **FAQ-01** | Visitor FAQ Accordion | `shadcn/ui` Accordion | https://ui.shadcn.com/docs/components/accordion | `components/ui/accordion.tsx` | `@radix-ui/react-accordion` | [BP-FAQ-01](./blueprints/BP-FAQ-01-visitor-accordion.md) |
| **CON-01** | Pastoral Contact & Visit Request | Próprio + `shadcn/ui` Card/Button | Internamente documentado no Blueprint | `features/Landing/sections/PastoralContactSection.tsx` | `lucide-react` | [BP-CON-01](./blueprints/BP-CON-01-pastoral-contact-and-visit.md) |
| **FTR-01** | Institutional Footer | Próprio (Tailwind CSS) | Internamente documentado no Blueprint | `features/Landing/sections/InstitutionalFooter.tsx` | `lucide-react` | [BP-FTR-01](./blueprints/BP-FTR-01-institutional-footer.md) |

---

## 3. Diretrizes de Compatibilidade Técnica (React 19 + Tailwind CSS v4)

1. **Imports de Animação (`motion/react`):**
   - Os snippets originais da documentação do Aceternity UI e Magic UI frequentemente importam `from "framer-motion"`.
   - No repositório iManancial, **todos os componentes novos ou adaptados devem importar de `"motion/react"`** (`import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'motion/react'`), garantindo árvore de módulos única.
2. **Tailwind CSS v4 (Sem `tailwind.config.js`):**
   - O projeto utiliza `@import "tailwindcss";` em [index.css](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/index.css#L1).
   - Componentes `shadcn/ui` (`button.tsx`, `card.tsx`, `tabs.tsx`, `accordion.tsx`, `badge.tsx`, `separator.tsx`, `carousel.tsx`) devem usar tokens explícitos compatíveis com a identidade Manancial (`#070B0E`, `#082F38`, `#06B6D4`, `slate-*`, `cyan-*`) em vez de depender de variáveis HSL não declaradas (`bg-primary`, `text-muted-foreground`) a menos que essas variáveis estejam mapeadas em `@theme` no `index.css`.
3. **Acessibilidade e Movimento Reduzido (`prefers-reduced-motion`):**
   - Todo componente animado (`NAV-01`, `HERO-01`, `CAR-01`, `VIS-01`, `HIS-01`, `MIN-01`, `GAL-01`, `GAL-02`) deve verificar `useReducedMotion()` do `motion/react` ou respeitar `@media (prefers-reduced-motion: reduce)` desativando translações, rotações 3D e blur transitions para usuários sensíveis a movimento.
4. **Pacotes Pendentes para Instalação na Fase de Fundação UI:**
   - Quando a Fase A de implementação for iniciada, o comando único homologado será:
     ```bash
     npm install embla-carousel-react @radix-ui/react-tabs @radix-ui/react-accordion @radix-ui/react-separator @radix-ui/react-slot class-variance-authority sonner
     ```
