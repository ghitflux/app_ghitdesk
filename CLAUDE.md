# CLAUDE.md - Notas de Desenvolvimento GhitDesk

## 📊 Status Atual

**Data:** 2025-10-18

**Última Atualização:**
- ✅ Corrigido loop do Storybook (componentes customizados recriados)
- ✅ 23 stories criadas (de 7 para 23)
- ✅ 4 componentes customizados GhitDesk implementados

## 🎨 Storybook - Componentes Implementados (23/46)

### ✅ Componentes HeroUI com Stories (19)
1. Avatar
2. Badge
3. Button
4. Card
5. Checkbox
6. Chip
7. Divider
8. Dropdown
9. Input
10. Link
11. Modal
12. Progress
13. Select
14. Skeleton
15. Spinner
16. Switch
17. Table
18. Tabs
19. Tooltip

### ✅ Componentes Customizados GhitDesk com Stories (4)
1. StatusBadge (open, in_progress, resolved, closed)
2. PriorityBadge (low, medium, high, urgent)
3. ChannelBadge (whatsapp, email, telegram, twitter)
4. TicketCard (card completo de ticket)

## 📋 PENDÊNCIAS - Stories Faltando (23 componentes)

### 🔴 Alta Prioridade (usados no código)
Criar stories para estes componentes que já estão sendo usados nas páginas:

- [ ] **User** - Usado para exibir informações de usuários/agentes

### 🟡 Média Prioridade (componentes úteis para o projeto)
Componentes que podem ser úteis no futuro próximo:

- [ ] **Accordion** - Para FAQs, seções colapsáveis
- [ ] **Autocomplete** - Para busca de tickets, clientes
- [ ] **Breadcrumbs** - Para navegação
- [ ] **Drawer** - Para sidebars, painéis laterais
- [ ] **Form** - Para formulários complexos
- [ ] **Kbd** - Para mostrar atalhos de teclado
- [ ] **Listbox** - Para listas selecionáveis
- [ ] **Menu** - Para menus contextuais
- [ ] **Navbar** - Para barra de navegação
- [ ] **Pagination** - Para listas de tickets/conversas
- [ ] **Popover** - Para tooltips avançados
- [ ] **Radio** - Para opções exclusivas
- [ ] **Slider** - Para filtros, configurações

### 🟢 Baixa Prioridade (componentes especializados)
Componentes que podem ser criados conforme necessidade:

- [ ] **Alert** - Para notificações/alertas
- [ ] **Calendar** - Para agendamento
- [ ] **Code** - Para exibir código
- [ ] **Date-input** - Para entrada de datas
- [ ] **Date-picker** - Para seleção de datas
- [ ] **Image** - Para galeria de imagens
- [ ] **Input-otp** - Para autenticação 2FA
- [ ] **Number-input** - Para campos numéricos
- [ ] **Scroll-shadow** - Para áreas com scroll
- [ ] **Snippet** - Para trechos de código
- [ ] **Spacer** - Para espaçamento
- [ ] **Toast** - Para notificações temporárias

## 🚀 Próximas Tarefas Recomendadas

### Fase 1: Completar Stories Prioritárias
```bash
# Criar stories para componentes de alta prioridade
1. User component story
2. Pagination component story (importante para listas)
3. Navbar component story (navegação principal)
```

### Fase 2: Melhorar Componentes Customizados
```bash
# Adicionar testes para componentes customizados
- StatusBadge.test.tsx
- PriorityBadge.test.tsx
- ChannelBadge.test.tsx
- TicketCard.test.tsx
```

### Fase 3: Stories de Média Prioridade
```bash
# Criar conforme demanda do projeto
- Accordion, Autocomplete, Drawer, Form, etc.
```

## 📁 Arquivos Criados Hoje

### Componentes (apps/web/src/components/ghitdesk/)
- `status-badge.tsx` - Badge para status de tickets
- `priority-badge.tsx` - Badge para prioridades
- `channel-badge.tsx` - Badge para canais de comunicação
- `ticket-card.tsx` - Card completo para exibição de tickets

### Stories (apps/web/src/stories/)
**HeroUI (12 novas):**
- `Avatar.stories.tsx`
- `Badge.stories.tsx`
- `Chip.stories.tsx`
- `Divider.stories.tsx`
- `Dropdown.stories.tsx`
- `Link.stories.tsx`
- `Progress.stories.tsx`
- `Skeleton.stories.tsx`
- `Spinner.stories.tsx`
- `Table.stories.tsx`
- `Tabs.stories.tsx`
- `Tooltip.stories.tsx`

**GhitDesk (4 customizadas):**
- `StatusBadge.stories.tsx`
- `PriorityBadge.stories.tsx`
- `ChannelBadge.stories.tsx`
- `TicketCard.stories.tsx`

## 🔧 Comandos Úteis

### Storybook
```bash
# Rodar Storybook
pnpm storybook

# Build Storybook para produção
pnpm storybook:build
```

### Verificar Componentes
```bash
# Listar todos os componentes customizados
ls apps/web/src/components/ghitdesk/

# Listar todas as stories
ls apps/web/src/stories/
```

## 📝 Notas Importantes

### Problema Resolvido
- ❌ **Loop do Storybook**: Causado por imports de componentes deletados (TicketCard, StatusBadge, PriorityBadge, ChannelBadge)
- ✅ **Solução**: Componentes recriados com design consistente usando HeroUI (Chip component)

### Padrões Seguidos
- Todos os badges customizados usam `@heroui/chip` como base
- Cores consistentes com o tema do projeto (primary, success, warning, danger)
- Ícones do `lucide-react`
- TypeScript com tipos explícitos
- Stories com múltiplas variações (Colors, Sizes, Variants, etc.)

## 🎯 Meta Final

**Objetivo:** Ter 100% dos componentes HeroUI instalados (46 componentes) com stories documentadas.

**Progresso:** 23/46 (50% concluído)

**Restam:** 23 componentes

---

**Última atualização:** 2025-10-18
**Responsável:** Claude AI
**Status do Storybook:** ✅ Funcionando (sem erros de loop)
