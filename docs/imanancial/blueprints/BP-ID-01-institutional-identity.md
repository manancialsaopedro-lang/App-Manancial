# BLUEPRINT: ID-01 — Identidade Institucional (Editorial Split Layout)

---

## 1. Identificador único
- **`ID-01`**

## 2. Nome da seção
- **Quem Somos — Identidade da Igreja Família Manancial** (Âncora DOM: `#identidade`)

## 3. Objetivo funcional
- Apresentar a essência pastoral, o DNA de família e o chamado da Igreja Família Manancial em São Pedro/SP, criando conexão humana e espiritual com quem deseja conhecer a congregação.

## 4. Referência visual
- **Editorial Split Layout:** Contraste luminoso e acolhedor (`bg-[#F4FAFC]` em modo claro editorial ou superfície petróleo suave), dividido em duas colunas assimétricas: à esquerda, manifesto institucional com tipografia de revista, versículo-chave (`Salmos 25:14` / `João 4:14`) e pilares de acolhimento; à direita, composição fotográfica em camadas com legenda pastoral.

## 5. Biblioteca e componente escolhido
- **Componente Próprio (`ID-01`):** `features/Landing/sections/InstitutionalIdentitySection.tsx` construído com **Tailwind CSS v4** e **Motion for React (`motion/react`)**, utilizando `shadcn/ui Button` e `Badge`.

## 6. Link de documentação
- Documentação interna do projeto (`docs/imanancial/01-COMPONENT-REGISTRY.md`).

## 7. Variantes e propriedades
- Aceita foto de destaque dinâmica vinda da seção `'quem-somos'` de `church_site_photos` (com fallback imediato para `/assets/images/manancial_church_community_1794615448217.jpg`).

## 8. Estrutura de layout
- **Section Container:** `<section id="identidade" className="w-full bg-[#070B0E] py-20 sm:py-28 border-b border-white/[0.06]">`
- **Grid Split (`mx-auto max-w-[1280px] px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center`):**
  - **Coluna Editorial (`lg:col-span-6 space-y-6`):**
    - Eyebrow `"Nossa Identidade em São Pedro/SP"`.
    - Título editorial `h2`: `"Mais que um endereço aos domingos: uma família espiritual que acolhe, discipula e caminha junto."`
    - Parágrafos pastorais explicando o coração da igreja.
    - Bloco de citação bíblica com barra vertical ciano (`border-l-2 border-cyan-400 pl-4`).
    - 3 indicadores qualitativos em linha (`Ensino Bíblico Sólido`, `Cuidado Familiar`, `Comunhão Genuína`).
  - **Coluna Visual (`lg:col-span-6`):**
    - Moldura principal `aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl`.
    - Card sobreposto inferior em vidro escuro (`bg-[#082F38]/90 backdrop-blur-md border border-cyan-400/25 p-5 rounded-2xl`) destacando o acolhimento pastoral.

## 9. Hierarquia de conteúdo
1. Eyebrow + Título `h2` de Identidade.
2. Manifesto pastoral em 2 parágrafos curtos e escaneáveis.
3. Versículo e fundamento espiritual.
4. Fotografia real da comunidade reunida em adoração.

## 10. Tipografia e cores
- **Título `h2`:** `font-headline text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight`.
- **Corpo de Texto:** `text-sm sm:text-base text-slate-300 leading-relaxed`.
- **Destaque de Citação:** `text-sm italic text-cyan-200 bg-cyan-950/30 p-4 rounded-r-2xl`.

## 11. Espaçamento e proporções
- Padding vertical generoso: `py-20 sm:py-28`.
- Gap entre colunas no desktop: `gap-12 lg:gap-16`.

## 12. Comportamento desktop (`>= 1024px`)
- Duas colunas `6/6` perfeitamente equilibradas, com revelação suave ao entrar na viewport.

## 13. Comportamento tablet (`768px` a `1023px`)
- Coluna textual no topo seguida pela composição fotográfica em `max-w-2xl mx-auto`.

## 14. Comportamento mobile (`< 768px` — `360px`, `390px`, `430px`)
- Empilhamento em coluna única; o card de destaque da fotografia fica encaixado abaixo da imagem (`mt-3`) em `360px` para nunca cobrir o rosto das pessoas na foto.

## 15. Interações e animações
- Entrada suave com `motion.div` (`whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true, margin: "-80px" }}`).
- Botão `"Conhecer Nossa História"` rola suavemente para `#historia` (`HIS-01`).

## 16. Estados de carregamento, vazio e erro
- Texto institucional sempre disponível síncronamente.
- Se `sitePhotos` tiver foto marcada como `isFeatured` na seção `'quem-somos'`, exibe-a; caso contrário, usa o asset local `/assets/images/manancial_church_community_1794615448217.jpg`.

## 17. Acessibilidade
- Hierarquia de cabeçalhos `<h2>` e `<h3>` correta.
- Atributo `alt` descritivo na imagem institucional.

## 18. Origem dos dados
- Texto institucional validado + foto principal da seção `'quem-somos'` via `fetchChurchSitePhotos()` ([churchSiteContentApi.ts](file:///Users/stcaioaug/Documents/Meus Apps/App-Manancial-main/features/Church/data/churchSiteContentApi.ts#L697)).
- **Regra DA-07:** Não renderiza uma galeria inteira dentro desta seção; o acervo completo fica centralizado em `GAL-01`.

## 19. Integração administrativa
- Quando o pastor envia uma nova foto destacada para a seção `"Quem Somos & Nossa História"` em `/eventos` (aba Galeria), a foto de capa desta seção reflete a atualização.

## 20. Dependências
- `motion`, `lucide-react`, `components/ui/button.tsx`, `components/ui/badge.tsx`.

## 21. Critérios de aceite
- [ ] Implementa o Editorial Split Layout sem repetir a galeria completa dentro da seção (`DA-07`, `QG-03`).
- [ ] Sem sobreposição de cards sobre rostos em `360px` (`QG-04`).
- [ ] Linguagem 100% pastoral e acolhedora (`QG-03`).

## 22. Restrições
- Proibido instanciar `SitePhotoGallerySection` completo aqui (consolidado em `GAL-01`).
- Proibido exibir botões administrativos de upload para visitantes.

## 23. Status de implementação
- `PLANEJADO`

## 24. Evidências de validação
- A preencher após implementação na Fase C.
