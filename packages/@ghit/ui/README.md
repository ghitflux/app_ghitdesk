# @ghit/ui

Design System for GhitDesk - Component library with design patterns.

## Architecture

### Design Patterns

- **Factory Pattern**: ComponentFactory for creating component variants
- **Composition**: Reusable base components that compose into complex UIs

## Components

### Data Display

#### Badge
Status, priority, and SLA indicators with multiple variants.

```tsx
import { Badge, StatusBadge, PriorityBadge, SLABadge } from '@ghit/ui';

<Badge variant="primary">Custom Badge</Badge>
<StatusBadge status="in_progress" />
<PriorityBadge priority="high" />
<SLABadge status="warning" />
```

#### Avatar
User avatars with fallback initials and status indicators.

```tsx
import { Avatar } from '@ghit/ui';

<Avatar
  src="/avatar.jpg"
  fallback="John Doe"
  size="md"
  status="online"
/>
```

#### StatCard
Metric cards for dashboards with trends and icons.

```tsx
import { StatCard } from '@ghit/ui';

<StatCard
  title="Conversas Ativas"
  value={12}
  subtitle="5 não lidas"
  trend={{ value: 15, direction: 'up' }}
  icon={<ChatIcon />}
  variant="primary"
/>
```

## Hooks

### useTheme
Manage light/dark theme with persistence.

```tsx
import { useTheme } from '@ghit/ui';

const { theme, toggleTheme, isDark } = useTheme();
```

## Utilities

### cn()
Merge Tailwind classes with conflict resolution.

```tsx
import { cn } from '@ghit/ui';

<div className={cn('base-class', condition && 'conditional-class')} />
```

## Design Tokens

Import the design tokens in your app:

```css
@import "@ghit/ui/styles";
```

### Color Variables

- Background: `--color-background`
- Surface: `--color-surface`
- Primary: `--color-primary`
- Success: `--color-success`
- Warning: `--color-warning`
- Danger: `--color-danger`

### Component Classes

- `.card-base` - Base card styling
- `.card-hover` - Hover effects for cards
- `.badge-base` - Base badge styling
- `.button-base` - Base button styling
- `.input-base` - Base input styling

## Usage in apps/web

The package is automatically transpiled and available:

```tsx
import { Badge, Avatar, StatCard, useTheme } from '@ghit/ui';
```

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev

# Type check
pnpm typecheck
```

## Future Components

Based on the design screenshots, these components will be added:

- **Layout**: Sidebar, Header, PageContainer
- **Cards**: TicketCard, TaskCard, BaseCard
- **Kanban**: KanbanBoard, KanbanColumn, KanbanCard (with @dnd-kit)
- **Forms**: SearchBar, FilterGroup
- **Charts**: BarChart, LineChart (for dashboard)

## Design Philosophy

1. **Dark-first**: Optimized for dark theme with light theme support
2. **Accessible**: ARIA labels and keyboard navigation
3. **Performant**: Tree-shakeable exports and optimized bundles
4. **Type-safe**: Full TypeScript support with exported types
5. **Composable**: Small, focused components that compose well
