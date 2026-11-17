# BLUEPRINT: INFO-01 — Horários de Culto & Localização

---

## 1. Identificador único
- **`INFO-01`**

## 2. Nome da seção
- **Nossos Encontros Semanais & Localização** (Âncora DOM: `#programacao`)

## 3. Objetivo funcional
- Informar com máxima clareza os dias e horários fixos dos cultos semanais da Igreja Família Manancial (incluindo o destaque do Culto de Ensino / Curso de Teologia) e o endereço físico em São Pedro/SP com ação direta para abrir rota no Google Maps / Waze ou planejar visita.

## 4. Referência visual
- Painel editorial estruturado em 2 grandes blocos complementares usando `shadcn/ui Card`, `Separator` e `Button`: à esquerda, a grade de cultos semanais com destaque para o Domingo e sinalização do Culto de Ensino; à direita, o Card Institucional de Localização e Recepção Presencial.

## 5. Biblioteca e componente escolhido
- **Componentes Obrigatórios (`INFO-01`):** `shadcn/ui Card` (`components/ui/card.tsx`), `shadcn/ui Separator` (`components/ui/separator.tsx`) e `shadcn/ui Button` (`components/ui/button.tsx`).
- **Componente de Seção:** `features/Landing/sections/ServiceTimesAndLocationSection.tsx`.

## 6. Link de documentação
- `shadcn/ui Card`: https://ui.shadcn.com/docs/components/card
- `shadcn/ui Separator`: https://ui.shadcn.com/docs/components/separator
- `shadcn/ui Button`: https://ui.shadcn.com/docs/components/button

## 7. Variantes e propriedades
- **Variantes de Item de Culto:**
  - `sunday` (`dayOfWeek === 0`): Recebe borda de destaque ciano (`border-cyan-400/40 bg-cyan-950/25`) e selo `"Celebração Principal"`.
  - `teaching` (`isTeaching === true`): Exibe selo âmbar/dourado `"Culto de Ensino • Curso de Teologia"`.
  - `regular`: Card limpo com dia da semana, horário em tipografia tabular (`tabular-nums`) e título do culto.

## 8. Estrutura de layout
- **Section Container:** `<section id="programacao" className="w-full bg-[#0A1015] py-20 sm:py-24 border-b border-white/[0.06]">`
- **Container Interno:** `mx-auto max-w-[1280px] px-5 sm:px-8 space-y-12`.
- **Grid Principal (`grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch`):**
  - **Coluna Horários (`lg:col-span-7`):** `Card` principal contendo cabeçalho da programação semanal, lista de cultos separada por `Separator` (ou grid de cards internos em 2 colunas) e nota informativa sobre Santa Ceia e Ministério Infantil funcionando durante os cultos.
  - **Coluna Localização (`lg:col-span-5`):** `Card` de endereço (`Av. Ângelo Nogueira, 45 — Centro, São Pedro - SP`), orientações de chegada (estacionamento, acessibilidade, recepção na porta) separados por `Separator`, e 2 `Button`s: `"Abrir Rota no Google Maps"` (link externo seguro) e `"Planejar Minha Visita"` (`/visitante`).

## 9. Hierarquia de conteúdo
1. Cabeçalho da seção (`"Programação Semanal & Endereço"` / `"Esperamos Você e Sua Família"`).
2. Lista de dias e horários de culto ordenados de Domingo (`0`) a Sábado (`6`).
3. Endereço completo e pontos de referência em São Pedro/SP.
4. CTAs de rota e recepção de visitante.

## 10. Tipografia e cores
- **Superfície dos Cards:** `bg-[#0E171F] border border-white/10 text-white rounded-3xl shadow-xl`.
- **Horário (`time`):** `font-mono text-lg sm:text-xl font-extrabold text-cyan-300 tabular-nums`.
- **Dia da Semana:** `text-xs font-bold uppercase tracking-wider text-slate-400`.
- **Título do Culto:** `text-base sm:text-lg font-bold text-white`.
- **Separator:** `bg-white/10`.

## 11. Espaçamento e proporções
- Padding interno dos Cards: `p-6 sm:p-8`.
- Espaçamento entre itens de culto: `gap-4`.

## 12. Comportamento desktop (`>= 1024px`)
- Exibição lado a lado (`7` colunas para horários, `5` colunas para localização) com mesma altura visual (`items-stretch`).

## 13. Comportamento tablet (`768px` a `1023px`)
- Cards empilhados em `1` coluna principal, com a grade interna de cultos em `2` colunas (`sm:grid-cols-2`).

## 14. Comportamento mobile (`< 768px` — `360px`, `390px`, `430px`)
- Cada horário de culto ocupa 1 linha completa com dia/tag no topo e título + horário alinhados de forma legível sem truncar texto.
- Botões `"Abrir no Mapa"` e `"Planejar Visita"` ocupam `w-full` com `min-h-[48px]`.

## 15. Interações e animações
- Hover sutil nos cards de culto (`hover:border-cyan-400/30 transition-colors`).
- Clique em `"Abrir Rota no Google Maps"` abre `https://www.google.com/maps/search/?api=1&query=Av.+%C3%82ngelo+Nogueira,+45+-+Centro,+S%C3%A3o+Pedro+-+SP` em nova aba (`target="_blank" rel="noopener noreferrer"`).
- Clique em `"Planejar Minha Visita"` navega para `/visitante`.

## 16. Estados de carregamento, vazio e erro
- **Loading State:** Exibe 4 linhas skeleton dentro do `Card` de horários.
- **Empty / Error Fallback (Regra DA-05):** Caso `fetchWeeklyServices()` retorne `[]` (como ocorre atualmente enquanto a tabela remota tem `0` linhas) ou retorne erro de rede, o componente exibe automaticamente os 4 horários oficiais de `DEFAULT_WEEKLY_SERVICES` (Domingo 19:00, Segunda 19:30, Terça 08:00, Quinta 19:30), garantindo que a página pública nunca fique sem horários de culto.

## 17. Acessibilidade
- Horários marcados com elemento semântico `<time>`.
- Links externos com indicação clara de abertura em nova aba e `aria-label`.

## 18. Origem dos dados
- **Serviço:** `useWeeklyServices()` e `DEFAULT_WEEKLY_SERVICES` em [churchWeeklyServices.ts](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/features/Church/data/churchWeeklyServices.ts#L30-L136).
- **Tabela Supabase:** `public.church_weekly_services`.

## 19. Integração administrativa
- Gerenciado diretamente por pastores e administradores em `/igreja` ([DevChurchInfoPage.tsx](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/features/DevPortal/pages/DevChurchInfoPage.tsx#L457-L596)) no card *"Dias e Horários de Culto"*.

## 20. Dependências
- `@radix-ui/react-separator`, `@radix-ui/react-slot`, `class-variance-authority`.
- `components/ui/card.tsx`, `components/ui/separator.tsx`, `components/ui/button.tsx`.

## 21. Critérios de aceite
- [ ] Utiliza `shadcn/ui Card`, `Separator` e `Button` (`QG-02`).
- [ ] Exibe os horários semanais mesmo quando a tabela `church_weekly_services` está vazia no banco (`DA-05`, `QG-06`).
- [ ] Destaca o Culto de Ensino (Curso de Teologia) quando `isTeaching === true` (`QG-03`).
- [ ] Botão de mapa e botão de visita funcionam perfeitamente em mobile e desktop (`QG-04`).

## 22. Restrições
- Proibido exibir botão de `"Assistir Culto Online"` ao lado dos horários.
- Proibido deixar o card de horários em branco se o banco retornar `0` linhas.

## 23. Status de implementação
- `PLANEJADO`

## 24. Evidências de validação
- A preencher após implementação na Fase C.
