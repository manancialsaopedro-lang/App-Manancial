# BLUEPRINT PRIORITÁRIO: CAR-01 — Featured Editorial Carousel (Elevation Style)

> **PRIORIDADE VISUAL MÁXIMA DO PROJETO iMANANCIAL**
> Este Blueprint especifica com precisão cirúrgica o carrossel editorial de destaques inspirado na *Elevation Church*, integrando `shadcn/ui Carousel` + `Embla Carousel` aos eventos destacados e vigentes da Igreja Família Manancial.

---

## 1. Identificador único
- **`CAR-01`**

## 2. Nome da seção
- **Destaques em Evidência — Featured Editorial Carousel** (Âncora DOM: `#destaques`)

## 3. Objetivo funcional
- Dar protagonismo imediato às principais mobilizações, conferências, vigílias, retiros (`Acamp Manancial 25:14`) e celebrações especiais da Igreja Família Manancial logo abaixo do Hero principal.
- Permitir que o visitante compreenda em segundos o que está acontecendo de mais relevante na igreja e acesse a ação principal (inscrição, informações ou planejamento de visita) sem poluição visual sobre as artes oficiais.

## 4. Referência visual
- **Benchmark:** Carrossel Editorial da *Elevation Church* (captura de referência fornecida pelo usuário):
  - Superfície de fundo grafite profundo (`#070B0E` / `#0A0F14`).
  - Slide central dominante ocupando a maior parte da viewport, emoldurado pelos slides anterior e posterior parcialmente visíveis nas extremidades (`peek` simétrico) com opacidade e escala sutilmente reduzidas.
  - Artes gráficas horizontais (`16:9`) com cantos generosamente arredondados (`rounded-2xl` a `rounded-3xl`), **sem textos ou botões sobrepostos que cubram a arte oficial**.
  - Bloco tipográfico editorial posicionado **abaixo** da imagem do slide ativo (categoria/data, título forte, descrição concisa em 2 linhas e link/botão de ação).
  - Controles de navegação por setas circulares translúcidas posicionadas nas margens internas laterais da faixa da imagem, sem obstruir o centro da arte.

## 5. Biblioteca e componente escolhido
- **Primitivo Base:** `shadcn/ui Carousel` (`components/ui/carousel.tsx`) construído sobre `embla-carousel-react`.
- **Componente de Seção:** `features/Landing/sections/FeaturedEditorialCarousel.tsx`.
- **Ícones:** `ChevronLeft`, `ChevronRight`, `Calendar`, `MapPin`, `ArrowUpRight` de `lucide-react`.
- **Animação complementar:** `motion/react` exclusivamente para a transição suave de opacidade/escala do bloco textual inferior ao trocar o índice do slide ativo (`selectedIndex`).

## 6. Link de documentação
- `shadcn/ui Carousel`: https://ui.shadcn.com/docs/components/carousel
- `Embla Carousel React`: https://www.embla-carousel.com/get-started/react/
- `Embla Options (align: 'center', containScroll)`: https://www.embla-carousel.com/api/options/

## 7. Variantes e propriedades
- **Configuração obrigatória do Embla (`opts`):**
  ```ts
  const emblaOptions: CarouselOptions = {
    align: 'center',
    containScroll: false,
    loop: featuredEvents.length >= 4, // Loop ativo somente com >= 4 itens para evitar salto visual de clones nas bordas
    skipSnaps: false,
    dragFree: false,
    duration: prefersReducedMotion ? 0 : 28,
  };
  ```
- **Autoplay:** **Estritamente desativado** (nenhum plugin `embla-carousel-autoplay` deve ser instanciado).
- **Estado monitorado via `CarouselApi`:**
  - `api.selectedScrollSnap()` atualiza `activeIndex: number` nos eventos `select` e `reInit`.
  - Cada `CarouselItem` recebe atributo `data-active={index === activeIndex}` para aplicar estilização diferencial entre o slide central ativo e os slides laterais adjacentes.
- **Variantes de Cardinalidade (`featuredEvents.length`):**
  - `0 itens`: Componente retorna `null` (seção totalmente oculta, sem renderizar `<section>` ou espaçamento vertical).
  - `1 item`: Renderiza variante `StaticSingleFeatureCard` centralizada (`max-w-5xl mx-auto`), sem instanciar setas de navegação nem indicadores de paginação (`dots`).
  - `2 ou 3 itens`: Renderiza carrossel centralizado com `loop: false`, desabilitando a seta esquerda no índice `0` e a seta direita no último índice.
  - `>= 4 itens`: Renderiza carrossel centralizado com `loop: true`.

## 8. Estrutura de layout
- **Wrapper da Seção:** `<section id="destaques" aria-label="Eventos e Destaques em Evidência" className="relative w-full bg-[#070B0E] py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-white/[0.06]">`
- **Cabeçalho Discreto da Seção:** Container `max-w-[1280px] mx-auto px-5 sm:px-8 mb-8 sm:mb-10 flex items-end justify-between` com eyebrow `"Em Evidência na Manancial"` e contador discreto `01 / 0{total}`.
- **Viewport do Carrossel (Full-Bleed Horizontal):**
  - O container do `CarouselContent` ocupa `w-full` (100% da largura da tela) para permitir que os slides laterais sangrem até as bordas da viewport (`overflow-visible` no track interno dentro de um wrapper `overflow-x-clip`).
- **Estrutura de Cada Slide (`CarouselItem`):**
  1. **Quadro da Arte (`div.relative.aspect-video.w-full.overflow-hidden.rounded-2xl.sm:rounded-3xl`):**
     - `img` com `w-full h-full object-cover object-center`.
     - Fallback visual caso `coverImageUrl` falhe: gradiente institucional `ev.bannerColor` com emblema `M` sutil e título centralizado.
     - Borda fina interna `ring-1 ring-inset ring-white/10`.
  2. **Bloco Editorial Inferior (Abaixo da Imagem, Fora do Quadro da Arte):**
     - Posicionado em `mt-6 sm:mt-8 px-1 sm:px-2` com layout em 2 colunas no desktop (`grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start`):
       - **Coluna Esquerda (`lg:col-span-8`):** Metadados em linha (`Badge` da categoria + data formatada `DD de Mês de AAAA` + horário + local) seguidos pelo `h3` do título do evento e `p` com a descrição pastoral (`line-clamp-2 sm:line-clamp-3`).
       - **Coluna Direita (`lg:col-span-4 lg: flex lg:justify-end lg:items-center`):** Botão CTA editorial (`"Saiba Mais e Participe"` ou rota específica `ev.directLink`) + indicadores de slide (`dots`).

## 9. Hierarquia de conteúdo
1. **Nível 1 (Dominância Visual):** Arte oficial `16:9` do slide central ativo em tamanho amplo e nítido.
2. **Nível 2 (Identificação Rápida abaixo da arte):** Tag de categoria (`Acamp Manancial`, `Vigília`, `Dia da Família`) + Data e Horário (`05 de Fev de 2027 • Saída às 06:00`).
3. **Nível 3 (Título Editorial):** Nome oficial do evento (`text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white`).
4. **Nível 4 (Resumo Pastoral):** Descrição acolhedora de até 2–3 linhas (`text-sm sm:text-base text-slate-300/90`).
5. **Nível 5 (Ação Direta):** Botão primário em alto contraste conduzindo a `ev.directLink` (ex.: `/acampamento/informacoes`) ou à seção `#contato` com o assunto do evento pré-selecionado.

## 10. Tipografia e cores
- **Fundo da Seção:** Grafite profundo `#070B0E` com vinheta radial sutil `radial-gradient(ellipse at top, rgba(8, 47, 56, 0.28), transparent 70%)`.
- **Quadro da Arte:** Fundo de reserva `#0C141A`, borda `border-white/10`, sombra no slide ativo `shadow-[0_28px_70px_-20px_rgba(0,0,0,0.85)]`.
- **Tag de Categoria:** `bg-cyan-500/15 text-cyan-300 border border-cyan-400/25 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full`.
- **Metadados de Data/Local:** `text-xs sm:text-sm font-semibold text-slate-400`.
- **Título do Slide (`h3`):** Fonte `Plus Jakarta Sans` / `Inter`, `text-xl sm:text-2xl lg:text-[28px] font-extrabold tracking-tight text-[#F8FAFC] leading-tight`.
- **Descrição (`p`):** `text-sm sm:text-base font-normal text-[#94A3B8] leading-relaxed max-w-2xl`.
- **Controles de Seta (`CarouselPrevious` / `CarouselNext`):**
  - Círculos de `h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-[#070B0E]/80 hover:bg-[#082F38] text-white border border-white/15 backdrop-blur-md shadow-xl`.
- **Botão CTA do Slide:** `bg-white text-[#070B0E] hover:bg-cyan-300 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-colors`.

## 11. Espaçamento e proporções
- **Proporção da Arte:** `aspect-[16/9]` consistente em todos os breakpoints, garantindo `object-cover` sem distorção.
- **Espaçamento entre slides (`gap` / `pl-*`):**
  - `CarouselContent` com `-ml-3 sm:-ml-5 lg:-ml-6`.
  - Cada `CarouselItem` com `pl-3 sm:pl-5 lg:pl-6`.
- **Raio de Borda da Imagem:** `rounded-2xl` (`16px`) no mobile e `rounded-3xl` (`24px`) em tablet/desktop.
- **Padding Vertical da Seção:** `py-16` (`64px`) mobile, `sm:py-20` (`80px`) tablet, `lg:py-24` (`96px`) desktop.

## 12. Comportamento desktop (`>= 1024px`)
- **Largura do Slide Principal:** `lg:basis-[70%] xl:basis-[68%] max-w-[1040px]`.
- **Alinhamento:** Centralizado (`align: 'center'`).
- **Visibilidade dos Slides Laterais:** Os slides imediatamente anterior e posterior ficam parcialmente visíveis nas laterais (aproximadamente `13%–15%` de cada lado da tela).
- **Tratamento Visual dos Slides Laterais Inativos:**
  - Escala `scale-[0.93]`, opacidade da imagem `opacity-45 hover:opacity-65`, transição suave `transition-all duration-500 ease-out`.
  - O bloco de texto abaixo da imagem nos slides inativos permanece com `opacity-0 pointer-events-none select-none` para que **apenas o texto do slide central ativo** seja lido, exatamente como no padrão editorial de referência.
- **Setas de Navegação:** Visíveis nas laterais externas do quadro central (`left-[calc(15%-1.5rem)]` e `right-[calc(15%-1.5rem)]`), alinhadas verticalmente ao centro da imagem (`top-[38%]`), sem cobrir textos da arte.

## 13. Comportamento tablet (`768px` a `1023px`)
- **Largura do Slide Principal:** `md:basis-[82%]`.
- **Visibilidade Lateral:** Slides adjacentes visíveis nas bordas (~`8%` de cada lado) indicando continuidade horizontal.
- **Controles:** Suporte simultâneo a gesto de arrasto (`swipe`) e botões circulares de seta (`44x44px`).

## 14. Comportamento mobile (`< 768px` — Testado em `360px`, `390px`, `430px`)
- **Largura do Slide Principal:** `basis-[88%] sm:basis-[86%]`.
- **Swipe Natural:** Arrasto fluido por toque nativo do Embla, com peek lateral de ~`6%` de cada lado para sinalizar que existem mais slides.
- **Proteção da Arte:** Proporção `aspect-[16/9]` preservada integralmente (nunca usar `aspect-[4/5]` ou `h-[400px]` fixo que corte as laterais das artes horizontais oficiais como `/acampamento-2027.jpg`).
- **Posição do Texto:** 100% abaixo da imagem (`mt-5`), evitando qualquer overlay de texto sobre a arte em telas pequenas.
- **Controles de Toque:** Barra inferior combinando indicadores de página (`dots` com área de toque expandida) e par de botões circulares `44x44px` abaixo ou nas extremidades seguras, sem sobrepor o centro da imagem em `360px`.

## 15. Interações e animações
- **Troca de Slide:**
  - Ao arrastar ou clicar nas setas/dots ou em um slide lateral inativo (`onClick={() => api?.scrollTo(index)}`), o Embla centraliza o slide escolhido.
  - O slide ativo transiciona para `scale-100 opacity-100`, enquanto os adjacentes assumem `scale-[0.93] opacity-45`.
- **Animação do Texto Inferior:**
  - Quando `activeIndex` muda, o container de texto do slide ativo executa entrada sutil via `motion.div` (`initial={{ opacity: 0, y: 8 }}`, `animate={{ opacity: 1, y: 0 }}`, `transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}`).
- **Ação de Clique no CTA:**
  - Se `ev.directLink` existir (ex.: `/acampamento` ou `/acampamento/informacoes`), navega via `navigate(ev.directLink)`.
  - Caso contrário, executa scroll suave para `#contato` (`CON-01`) pré-selecionando o assunto correspondente ao evento.

## 16. Estados de carregamento, vazio e erro
- **Loading State:** Enquanto `loadingEvents === true` e não houver cache local sincronizado, exibe skeleton de carrossel na mesma proporção (`aspect-[16/9]`, `basis-[88%] md:basis-[82%] lg:basis-[70%]`, fundo `bg-white/[0.04] animate-pulse rounded-3xl`) + 2 barras de texto inferiores, prevenindo Cumulative Layout Shift (CLS).
- **Empty State (0 destaques):** Se a lista filtrada (`is_upcoming && is_featured && eventDate >= todayISO`) retornar `0` itens, o componente retorna `null` e **oculta a seção inteira**, sem deixar faixa preta vazia.
- **Single Item State (1 destaque):** Se retornar exatamente `1` item, renderiza o card editorial centralizado sem instanciar setas, swipe ou paginação.
- **Error State (Falha de Rede / Imagem Quebrada):**
  - Se o Supabase falhar, consome automaticamente o cache local / `DEFAULT_SITE_EVENTS` filtrado por data vigente.
  - Se a URL da imagem (`coverImageUrl`) falhar no evento `onError`, renderiza um card gráfico institucional usando o gradiente `ev.bannerColor` e o ícone da categoria.

## 17. Acessibilidade
- `<section role="region" aria-roledescription="carousel" aria-label="Destaques em evidência da Igreja Família Manancial">`.
- Listener de teclado no `Carousel`: `ArrowLeft` aciona `scrollPrev()`, `ArrowRight` aciona `scrollNext()`.
- Região de anúncio de slide ativo com `aria-live="polite"` informando `"Slide X de Y: [Título do Evento]"`.
- Slides inativos recebem `aria-hidden={index !== activeIndex}` no bloco de texto oculto e `tabIndex={index === activeIndex ? 0 : -1}` nos links internos.
- Respeito integral a `prefers-reduced-motion`: quando ativo, `duration: 0` no Embla e remoção das transições de escala/Y.

## 18. Origem dos dados
- **Serviço:** `fetchChurchSiteEvents()` em [churchSiteContentApi.ts](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/features/Church/data/churchSiteContentApi.ts#L529-L559).
- **Tabela Supabase:** `public.church_events`.
- **Regra de Filtragem e Ordenação Determinística (DA-03):**
  ```ts
  const todayISO = new Date().toISOString().slice(0, 10);
  const featuredEvents = siteEvents
    .filter((ev) => ev.isUpcoming && ev.isFeatured && ev.eventDate >= todayISO)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  ```
- **Mapeamento de Colunas Reais:**
  - `id` -> `ev.id`
  - `title` -> `ev.title`
  - `description` -> `ev.description`
  - `cover_image_url` -> `ev.coverImageUrl`
  - `event_date` -> `ev.eventDate`
  - `event_time` -> `ev.eventTime`
  - `location` -> `ev.location`
  - `category` -> `ev.category`
  - `badge_text` -> `ev.badgeText`
  - `direct_link` -> `ev.directLink`
  - `is_featured` -> `ev.isFeatured`
  - `is_upcoming` -> `ev.isUpcoming`

## 19. Integração administrativa
- **Onde é gerenciado:** No Portal Gerencial em `/eventos` ([DevEventsPage.tsx](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/features/DevPortal/pages/DevEventsPage.tsx#L163-L253)).
- **Como publicar/destacar um item no `CAR-01`:**
  - No modal *"Cadastrar / Editar Evento da Igreja"* em `/eventos`, o pastor ou administrador marca os checkboxes **"Próximo Evento (Ativo na Agenda)"** (`is_upcoming = true`), **"Destacar no Topo"** (`is_featured = true`), define uma `Data do Evento` futura ou atual e envia a **Foto de Capa** (`cover_image_url` no bucket `church-media`).
- **Sincronização em Tempo Real:** O disparo do evento customizado `window.dispatchEvent(new Event('manancial-site-events-updated'))` atualiza o `CAR-01` imediatamente.

## 20. Dependências
- Pacote npm: `embla-carousel-react` (a ser instalado na Fase A de Fundação UI).
- Pacotes já instalados: `lucide-react`, `motion`, `clsx`, `tailwind-merge`.
- Primitivos internos: `components/ui/carousel.tsx` e `components/ui/button.tsx`.

## 21. Critérios de aceite
- [ ] Usa `shadcn/ui Carousel` + `Embla Carousel` com `align: 'center'` e `autoplay` desativado (`QG-02`, `QG-03`).
- [ ] Fundo grafite profundo (`#070B0E`), slide central ocupando `68–70%` no desktop, `82%` no tablet e `88%` no mobile, com slides adjacentes parcialmente visíveis (`QG-03`, `QG-04`).
- [ ] Título, metadados, descrição e botão CTA posicionados **abaixo** da arte gráfica (zero texto sobreposto cobrindo a arte) (`QG-03`).
- [ ] Navegação funcional por setas circulares, toque/swipe e teclado (`ArrowLeft` / `ArrowRight`) (`QG-05`).
- [ ] Respeita `prefers-reduced-motion` (`QG-05`).
- [ ] Filtra eventos expirados (`eventDate < todayISO`), renderiza card estático quando houver apenas `1` item e oculta a seção quando houver `0` itens (`QG-06`).

## 22. Restrições
- **Proibido** ativar autoplay ou timers que troquem o slide sozinho enquanto o visitante lê.
- **Proibido** sobrepor textos pesados, gradientes escuros intrusivos ou botões em cima do centro da arte do evento.
- **Proibido** exibir botões de `"Assistir Ao Vivo"`, `"Ver Gravação"` ou players de vídeo.
- **Proibido** exibir eventos cuja data (`event_date`) já passou.

## 23. Status de implementação
- `PLANEJADO (Aguardando execução da Fase B de implementação)`

## 24. Evidências de validação
- Blueprint validado contra o schema real de `public.church_events` (auditado em [churchSiteContentApi.ts](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/features/Church/data/churchSiteContentApi.ts#L118-L137)). Evidências de código e preview serão registradas neste item pelo `manancial-section-builder` e `manancial-qa-reviewer` após a implementação.
