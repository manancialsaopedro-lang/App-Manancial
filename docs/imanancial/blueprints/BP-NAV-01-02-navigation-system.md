# BLUEPRINT: NAV-01 & NAV-02 — Sistema de Navegação Institucional (Floating Navbar + Mobile Sheet)

---

## 1. Identificador único
- **`NAV-01`** (Desktop Floating Navbar) e **`NAV-02`** (Mobile Navigation Sheet)

## 2. Nome da seção
- **Barra de Navegação Institucional Flutuante e Gaveta Mobile** (Elemento `<header>` global da Landing Page)

## 3. Objetivo funcional
- Permitir navegação rápida e intuitiva para as seções essenciais da Igreja Família Manancial em qualquer ponto da página, oferecendo acesso em 1 clique para **"Planejar Visita / Sou Visitante"** (`/visitante`) e acesso discreto ao **Espaço do Membro / Login** (`/login`).

## 4. Referência visual
- **Desktop (`NAV-01`):** Cápsula flutuante centralizada no topo (`top-4`), com efeito glassmorphism escuro refinado (`bg-[#070B0E]/85 backdrop-blur-xl border border-white/12 rounded-full`), inspirada no `Aceternity Floating Navbar`.
- **Mobile (`NAV-02`):** Barra superior compacta com emblema `M` + botão menu que abre um `shadcn/ui Sheet` lateral direito de altura total (`100dvh`), com itens de toque amplos, horários resumidos no rodapé da gaveta e CTA de boas-vindas em destaque.

## 5. Biblioteca e componente escolhido
- **`NAV-01`:** `Aceternity Floating Navbar` adaptado em `components/ui/floating-navbar.tsx`.
- **`NAV-02`:** `shadcn/ui Sheet` já existente em [components/ui/Sheet.tsx](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/components/ui/Sheet.tsx#L1-L114) (`@radix-ui/react-dialog`).
- **Seção:** `features/Landing/sections/LandingNavbar.tsx`.

## 6. Link de documentação
- `Aceternity Floating Navbar`: https://ui.aceternity.com/components/floating-navbar
- `shadcn/ui Sheet`: https://ui.shadcn.com/docs/components/sheet

## 7. Variantes e propriedades
- **Props de `LandingNavbar`:**
  - `onNavigateSection: (sectionId: string) => void`
  - `activeSection?: string`
- **Comportamento de Visibilidade (`NAV-01`):**
  - No topo da página (`scrollY < 80px`), permanece sempre visível e ancorada com `top-4`.
  - Durante rolagem para baixo intensa, pode compactar suavemente a sombra/altura; ao rolar para cima ou focar via teclado (`focus-within`), garante 100% de visibilidade imediata.

## 8. Estrutura de layout
- **Container Fixo:** `fixed top-0 inset-x-0 z-50 pt-[max(0.75rem,env(safe-area-inset-top))] px-3.5 sm:px-6 pointer-events-none`.
- **Cápsula Interna (`pointer-events-auto`):** `mx-auto max-w-[1200px] h-14 sm:h-16 px-4 sm:px-6 rounded-2xl lg:rounded-full flex items-center justify-between gap-4`.
- **3 Zonas Internas:**
  1. **Marca (Esquerda):** Emblema Manancial (`w-9 h-9 rounded-xl`) + Texto `"Manancial"` e subtítulo `"São Pedro • SP"`.
  2. **Links de Âncora (Centro — `hidden lg:flex`):** `Início` (`#topo`), `Destaques` (`#destaques`), `Horários` (`#programacao`), `A Igreja` (`#identidade`), `Ministérios` (`#ministerios`), `Cursos` (`#cursos`), `Social` (`#social`), `Eventos` (`#proximos-eventos`), `Pix` (`#generosidade`).
  3. **Ações (Direita):** Link discreto `"Área do Membro"` (`/login`) + CTA Primário `"Sou Visitante"` (`/visitante`) + Gatilho `SheetTrigger` (`lg:hidden`).

## 9. Hierarquia de conteúdo
1. Identidade da Igreja (Logo + Nome).
2. CTA Primário `"Sou Visitante"` (destaque em ciano/turquesa).
3. Links de navegação pelas seções da página.
4. Acesso secundário `"Área do Membro"`.

## 10. Tipografia e cores
- **Superfície da Cápsula:** `bg-[#070B0E]/88 backdrop-blur-xl border border-white/12 text-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.65)]`.
- **Links de Navegação:** `text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.06] transition-colors`.
- **CTA Primário (`Sou Visitante`):** `bg-cyan-400 hover:bg-cyan-300 text-[#062026] text-xs font-extrabold px-4 py-2 rounded-full shadow-sm`.
- **Gaveta Mobile (`SheetContent`):** `bg-[#070B0E] border-l border-white/10 text-white w-[88vw] max-w-sm`.

## 11. Espaçamento e proporções
- Altura da barra: `56px` (`h-14`) no mobile, `64px` (`h-16`) no desktop.
- Compensação obrigatória no Hero (`HERO-01`): `pt-24 sm:pt-28 lg:pt-32` para que a barra flutuante nunca cubra conteúdo útil (Regra Global #1).

## 12. Comportamento desktop (`>= 1024px`)
- Exibe a barra horizontal flutuante `NAV-01` completa com links de seção e CTAs. O gatilho do `Sheet` permanece oculto (`lg:hidden`).

## 13. Comportamento tablet (`768px` a `1023px`)
- Exibe a marca, o CTA `"Sou Visitante"` e o botão de abertura do `Sheet` (`NAV-02`) para evitar truncamento da lista de 9 âncoras.

## 14. Comportamento mobile (`< 768px` — `360px`, `390px`, `430px`)
- Barra superior exibe apenas Logo + CTA compacto `"Visitar"` + botão Menu (`44x44px`).
- Ao tocar no botão Menu, abre o `Sheet` (`NAV-02`) pelo lado direito com lista vertical de links (`py-3 px-4 rounded-xl text-sm font-bold`), botão `"Cartão de Boas-Vindas (/visitante)"`, botão `"Área do Membro (/login)"` e resumo do endereço no rodapé com `pb-safe`.
- Ao clicar em qualquer link de seção no `Sheet`, fecha o `Sheet` automaticamente e executa o scroll suave.

## 15. Interações e animações
- Transição de entrada da `FloatingNavbar` via `motion.header` (`duration: 0.25`).
- Abertura/fechamento do `Sheet` via animações nativas do Radix Dialog (`slide-in-from-right` em `220ms`).

## 16. Estados de carregamento, vazio e erro
- Componente estático e síncrono: disponível instantaneamente no primeiro frame sem depender de rede.
- Se a imagem da logo falhar, exibe o monograma `"M"` estilizado.

## 17. Acessibilidade
- `<header role="banner">` e `<nav aria-label="Navegação principal">`.
- `Sheet` do Radix gerencia automaticamente `focus trap`, bloqueio de scroll do `body`, retorno de foco ao botão gatilho e fechamento com tecla `Escape`.
- Botão hamburguer com `aria-label="Abrir menu de navegação"`.

## 18. Origem dos dados
- Lista de seções estática alinhada aos IDs do `00-MASTERPLAN.md`.
- Rotas `/visitante` e `/login` definidas em [index.tsx](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/index.tsx#L286-L295).

## 19. Integração administrativa
- **Regra DA-02:** Não exibir botões `"Gerenciar Fotos"` ou `"Portal Interno / Admin"` para visitantes na navbar pública. O botão de conta leva de forma limpa a `/login` (ou `/igreja/membro` / `/igreja` caso haja sessão real autenticada).

## 20. Dependências
- `components/ui/Sheet.tsx` (existente).
- `components/ui/floating-navbar.tsx` (a criar).
- `motion`, `lucide-react`.

## 21. Critérios de aceite
- [ ] `NAV-01` usa `Aceternity Floating Navbar` no desktop e `NAV-02` usa `shadcn/ui Sheet` no mobile (`QG-02`).
- [ ] Não cobre títulos ou botões do Hero graças à compensação de `padding-top` e `safe-area` (`QG-04`).
- [ ] Fecha o `Sheet` automaticamente ao selecionar uma âncora no mobile (`QG-03`).
- [ ] Navegável por `Tab` e fecha com `Escape` (`QG-05`).

## 22. Restrições
- Proibido usar menu dropdown inline improvisado que empurre o layout da página para baixo no mobile.
- Proibido incluir links para `"Ao Vivo"`, `"Lives"` ou `"Sermões"`.

## 23. Status de implementação
- `PLANEJADO`

## 24. Evidências de validação
- A preencher após implementação na Fase C.
