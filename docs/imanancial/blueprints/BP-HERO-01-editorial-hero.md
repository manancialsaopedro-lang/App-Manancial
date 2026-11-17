# BLUEPRINT: HERO-01 — Hero Institucional Editorial

---

## 1. Identificador único
- **`HERO-01`**

## 2. Nome da seção
- **Hero Institucional de Acolhimento — Igreja Família Manancial** (Âncora DOM: `#topo`)

## 3. Objetivo funcional
- Acolher imediatamente o visitante que chega ao site, comunicando em menos de 5 segundos o nome e a essência da **Igreja Família Manancial — Ministério de São Pedro/SP**, o convite para estar presencialmente com a família e os caminhos diretos para **Planejar uma Visita** (`/visitante`) ou **Ver Horários de Culto** (`#programacao`).

## 4. Referência visual
- Composição editorial escura e solene (`#070B0E` + azul petróleo `#082F38`), combinando a atmosfera de águas vivas (`ManancialWaterCanvas` + `ManancialEmblem`) com tipografia pastoral forte, limpa e acolhedora, sem excesso de caixas secundárias que disputem atenção com a mensagem central.

## 5. Biblioteca e componente escolhido
- **Componente Próprio:** `features/Landing/sections/HeroEditorialSection.tsx` construído com **Tailwind CSS v4** e **Motion for React (`motion/react`)**, reutilizando os assets oficiais [ManancialEmblem](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/components/splash/ManancialLogo.tsx#L17-L229) e [ManancialWaterCanvas](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/components/splash/ManancialWaterCanvas.tsx).

## 6. Link de documentação
- `Motion for React`: https://motion.dev/docs/react-quick-start

## 7. Variantes e propriedades
- **Props de `HeroEditorialSection`:**
  - `onPlanVisit: () => void` (navega para `/visitante`)
  - `onViewSchedules: () => void` (scroll suave para `#programacao`)
  - `nextSundayServiceLabel?: string` (ex.: `"Domingos às 19:00 • Culto da Família"`)

## 8. Estrutura de layout
- **Section Container:** `<section id="topo" className="relative min-h-[88dvh] flex items-center bg-[#070B0E] pt-28 sm:pt-32 pb-16 sm:pb-24 overflow-hidden border-b border-white/[0.08]">`
- **Camada de Fundo (`z-0`):** `ManancialWaterCanvas` com opacidade controlada + gradiente radial escuro garantindo leitura perfeita do texto.
- **Container de Conteúdo (`z-10`):** `mx-auto max-w-[1280px] w-full px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center`.
  - **Coluna Principal (`lg:col-span-7`):** Eyebrow pastoral + Título Principal `h1` + Subtítulo de acolhimento + Par de Botões CTA + Barra enxuta de localização/próximo encontro.
  - **Coluna Visual Editorial (`lg:col-span-5`):** Moldura fotográfica editorial da comunidade (`/assets/images/manancial_church_community_1794615448217.jpg`) conjugada ao emblema `ManancialEmblem` e selo de fundação (`São Pedro/SP • Desde 2018`).

## 9. Hierarquia de conteúdo
1. **Selo Institucional (Eyebrow):** `"Igreja Família Manancial • Ministério de São Pedro/SP"`
2. **Headline (`h1`):** `"Uma família para pertencer, um altar para adorar e uma fonte de águas vivas para o seu lar."`
3. **Subheadline (`p`):** Texto pastoral convidando o visitante e sua família para os cultos presenciais em São Pedro/SP.
4. **CTAs Primário e Secundário:**
   - Primário: `"Quero Visitar a Igreja"` (abre `/visitante` ou rola para `#programacao` / `#contato`).
   - Secundário: `"Horários e Localização"` (rola para `#programacao`).
5. **Rodapé do Hero (Pílula Informativa):** `"Domingos às 19h • Av. Ângelo Nogueira, 45 — Centro, São Pedro/SP"`.

## 10. Tipografia e cores
- **Headline (`h1`):** `font-headline text-3xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-white leading-[1.08]`.
- **Destaque Ciano na Headline:** Gradiente de texto `bg-gradient-to-r from-cyan-300 via-sky-200 to-teal-300 bg-clip-text text-transparent`.
- **Subheadline:** `text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-xl`.
- **CTA Primário:** `bg-cyan-400 hover:bg-cyan-300 text-[#051C22] font-extrabold text-sm px-6 py-4 rounded-2xl shadow-lg shadow-cyan-500/20`.
- **CTA Secundário:** `bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 font-bold text-sm px-6 py-4 rounded-2xl backdrop-blur-md`.

## 11. Espaçamento e proporções
- Compensação superior: `pt-28 sm:pt-32 lg:pt-36` (garante distância mínima de `48px` abaixo da `NAV-01`).
- Imagem editorial direita: `aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden border border-white/15 shadow-2xl`.

## 12. Comportamento desktop (`>= 1024px`)
- Layout de 12 colunas (`7` para narrativa e CTAs à esquerda, `5` para composição fotográfica + emblema à direita).

## 13. Comportamento tablet (`768px` a `1023px`)
- Empilhamento vertical equilibrado com texto centralizado ou alinhado à esquerda e moldura visual logo abaixo em `max-w-2xl`.

## 14. Comportamento mobile (`< 768px` — `360px`, `390px`, `430px`)
- Headline ajustada para `text-3xl` (`30px`) em `360px` evitando quebra de palavras órfãs.
- Botões CTA empilhados em `w-full sm:w-auto` com altura mínima de `48px` para toque confortável com o polegar.
- Emblema e foto dimensionados sem ultrapassar a largura da viewport.

## 15. Interações e animações
- Entrada escalonada (`stagger: 0.08s`) nos 4 blocos da coluna esquerda via `motion.div` (`opacity: 0 -> 1`, `y: 16 -> 0`, `duration: 0.5s`).
- Emblema `ManancialEmblem` responde suavemente ao ponteiro no desktop e dispara pulso de onda no `ManancialWaterCanvas` ao clique.

## 16. Estados de carregamento, vazio e erro
- Renderização imediata sem bloqueio de API. Se `weeklyServices` ainda estiver carregando, exibe o horário institucional padrão (`Domingos às 19:00`).
- Fallback automático na fotografia do Hero caso o asset local demore ou falhe.

## 17. Acessibilidade
- Único elemento `<h1>` da página.
- Canvas de água marcado com `aria-hidden="true"`.
- Se `prefers-reduced-motion: reduce` estiver ativo, desativa a animação contínua do canvas e o efeito tilt 3D do emblema.

## 18. Origem dos dados
- Horário resumido derivado de `useWeeklyServices()` ([churchWeeklyServices.ts](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/features/Church/data/churchWeeklyServices.ts#L110)) com fallback para `DEFAULT_WEEKLY_SERVICES`.
- Assets estáticos oficiais: `/assets/images/manancial_church_community_1794615448217.jpg` e `/icons/icon-512.png`.

## 19. Integração administrativa
- O horário destacado reflete automaticamente o culto de Domingo cadastrado em `/igreja` (`DevChurchInfoPage`).

## 20. Dependências
- `motion`, `lucide-react`, `ManancialWaterCanvas`, `ManancialEmblem`.

## 21. Critérios de aceite
- [ ] Nenhum elemento coberto pela `NAV-01` (`QG-04`).
- [ ] Ambos os botões possuem ação real e imediata (`QG-03`).
- [ ] Zero menção a transmissões ao vivo ou players de vídeo (`QG-03`).
- [ ] Responsivo em `360px`, `390px` e `430px` sem scroll horizontal (`QG-04`).

## 22. Restrições
- Proibido adicionar botão `"Assistir Culto Ao Vivo"` ou embed de vídeo no Hero.
- Proibido exibir botões administrativos de edição sobre o Hero.

## 23. Status de implementação
- `PLANEJADO`

## 24. Evidências de validação
- A preencher após implementação na Fase C.
