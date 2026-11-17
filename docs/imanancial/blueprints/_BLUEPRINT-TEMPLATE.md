# TEMPLATE CANÔNICO DE BLUEPRINT iMANANCIAL (24 PONTOS OBRIGATÓRIOS)

> Todo Blueprint de seção do projeto iManancial deve conter obrigatoriamente os 24 tópicos numerados abaixo, sem omissões e sem descrições vagas.

---

## 1. Identificador único
- `ID-XX`

## 2. Nome da seção
- Nome institucional e identificador de âncora (`#secao`).

## 3. Objetivo funcional
- Qual problema do visitante ou membro esta seção resolve na jornada.

## 4. Referência visual
- Benchmark concreto, direção estética e composição esperada.

## 5. Biblioteca e componente escolhido
- Biblioteca oficial aprovada no `01-COMPONENT-REGISTRY.md` e caminho do arquivo no repositório.

## 6. Link de documentação
- URL oficial da documentação do componente.

## 7. Variantes e propriedades
- Props TypeScript, opções de configuração (ex.: Embla options, Radix props) e variantes de estado.

## 8. Estrutura de layout
- Container, largura máxima, sistema de grid/flex, posicionamento e camadas (`z-index`).

## 9. Hierarquia de conteúdo
- Ordem exata de leitura dos elementos (eyebrow, título, subtítulo, mídia, metadados, CTA).

## 10. Tipografia e cores
- Tokens exatos de fonte, tamanhos, pesos, tracking, line-height e códigos hexadecimais/classes Tailwind de fundo, superfície, borda e texto.

## 11. Espaçamento e proporções
- Paddings verticais/horizontais, gaps, `aspect-ratio`, `border-radius` e larguras percentuais.

## 12. Comportamento desktop
- Regras específicas para `>= 1024px` (`lg` e `xl`).

## 13. Comportamento tablet
- Regras específicas para `768px` a `1023px` (`md`).

## 14. Comportamento mobile
- Regras específicas para `360px`, `390px` e `430px` (`< 768px`), alvos de toque e proteção contra corte de conteúdo.

## 15. Interações e animações
- Eventos de clique, toque/swipe, hover, foco, curvas de transição `motion/react` e duração em milissegundos.

## 16. Estados de carregamento, vazio e erro
- Comportamento determinístico para `loading`, `empty` (0 itens e 1 item), `error`, `success` e `disabled`.

## 17. Acessibilidade
- Semântica HTML, roles ARIA, navegação por teclado e suporte a `prefers-reduced-motion`.

## 18. Origem dos dados
- Tabela Supabase, função de API em `features/Church/data/*`, filtros e mapeamento de campos reais.

## 19. Integração administrativa
- Onde e como pastores/administradores gerenciam este conteúdo no Portal Gerencial (`/igreja`, `/eventos`).

## 20. Dependências
- Pacotes npm necessários e componentes internos pré-requisito.

## 21. Critérios de aceite
- Checklist verificável vinculado aos Quality Gates `QG-01` a `QG-10`.

## 22. Restrições
- O que é expressamente proibido nesta seção.

## 23. Status de implementação
- Estado atual (`PLANEJADO`, `EM EXECUÇÃO`, `IMPLEMENTADO`, `VALIDADO QA`).

## 24. Evidências de validação
- Registro de arquivos modificados, testes executados e capturas/resultados de build.
