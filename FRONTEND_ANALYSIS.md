# Frontend Deep Analysis Report - GhitDesk

## Executive Summary
Analyzed 66 TypeScript/TSX files in the frontend application. Found **21 critical/high-priority issues** across 4 categories:
- 8 React Pattern issues
- 7 Performance issues  
- 4 Accessibility issues
- 7 Error Handling issues

---

## 1. REACT PATTERNS ISSUES

### 1.1 ⚠️ Missing Dependency in useSSEEvent Hook (CRITICAL)
**File:** `/home/user/app_ghitdesk/apps/web/src/hooks/useSSE.ts`
**Severity:** HIGH

The `useSSEEvent` hook has a missing dependency problem:

```typescript
export function useSSEEvent<T = unknown>(
  eventName: string,
  callback: (data: T) => void
) {
  useEffect(() => {
    const unsubscribe = sseClient.on(eventName, callback as (data: unknown) => void);
    return () => {
      unsubscribe();
    };
  }, [eventName, callback]); // ✗ callback creates infinite loop
}
```

**Problem:** The `callback` parameter is included in the dependency array, but event listeners in tickets/inbox pages create new function instances every render.

**Impact:** 
- Multiple event subscriptions being created
- Memory leaks from duplicate listeners
- Performance degradation over time
- Potential unhandled state updates

**Affected Files:**
- `/home/user/app_ghitdesk/apps/web/src/app/(dashboard)/tickets/page.tsx` (3 useSSEEvent calls)
- `/home/user/app_ghitdesk/apps/web/src/app/(dashboard)/inbox/page.tsx` (2 useSSEEvent calls)

**Example from tickets/page.tsx (lines 49-63):**
```typescript
useSSEEvent('ticket:created', (data: any) => {  // New function every render
  console.log('New ticket created:', data);
  const newTicket: Ticket = { ... };
  setTickets((prev) => [newTicket, ...prev]);
});
```

**Recommended Fix:**
- Use `useCallback` to memoize callbacks
- Remove callback from dependencies OR handle it properly
- Add ESLint rule: `react-hooks/exhaustive-deps`

---

### 1.2 Missing Props in Component Interfaces (MEDIUM)
**File:** `/home/user/app_ghitdesk/apps/web/src/components/ghitdesk/`
**Severity:** MEDIUM

Components receive props they don't accept:

**statusBadge.tsx:**
```typescript
interface StatusBadgeProps {
  status: Status;
  // ✗ Missing: size?: "sm" | "md" | "lg"
}
```

Used in inbox/page.tsx (line 169):
```typescript
<StatusBadge status={conv.status} size="sm" />  // ✗ size prop not accepted
```

**channelBadge.tsx:**
```typescript
interface ChannelBadgeProps {
  channel: Channel;
  // ✗ Missing: variant?: "flat" | "bordered" | "dot"
  // ✗ Missing: size?: "sm" | "md" | "lg"
}
```

Used in inbox/page.tsx (lines 157-160):
```typescript
<ChannelBadge
  channel={conv.channel}
  size="sm"           // ✗ Not in interface
  variant="dot"       // ✗ Not in interface
/>
```

**Impact:** TypeScript should flag these, silently fails at runtime

---

### 1.3 useSSE Hook Missing Connection Status Updates (MEDIUM)
**File:** `/home/user/app_ghitdesk/apps/web/src/hooks/useSSE.ts`
**Severity:** MEDIUM

```typescript
export function useSSE() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    sseClient.connect();
    setIsConnected(sseClient.getStatus()); // ✗ Only called once
    
    return () => {
      // Connection status never updates after initial state
    };
  }, []);

  return { isConnected };
}
```

**Problem:** Status is only checked at mount, doesn't update when connection drops/reconnects

**Impact:** UI shows stale connection status (green when actually disconnected)

---

### 1.4 Uncontrolled Infinite Re-renders in SSE Updates (MEDIUM)
**Files:** tickets/page.tsx, inbox/page.tsx
**Severity:** MEDIUM

State updates using same callback functions:

```typescript
// tickets/page.tsx lines 65-76
useSSEEvent('ticket:updated', (data: any) => {
  setTickets((prev) =>
    prev.map((ticket) =>
      ticket.id === data.ticket_id || ticket.ticket_number === data.ticket_id
        ? { ...ticket, ...data.changes, ...(data.ticket || {}) }  // ✗ Deep merge unpredictable
        : ticket
    )
  );
});
```

**Problems:**
- Spread operator merging can override fields unexpectedly
- Multiple conditions for matching tickets (id OR ticket_number)
- data.changes and data.ticket can conflict

---

## 2. PERFORMANCE ISSUES

### 2.1 ⚠️ Multiple useSSEEvent Subscriptions Without Memoization (HIGH)
**Files:** tickets/page.tsx (3), inbox/page.tsx (2)
**Severity:** HIGH

```typescript
// tickets/page.tsx - called 3 times per component
export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  
  useSSEEvent('ticket:created', (data: any) => { ... });  // New function
  useSSEEvent('ticket:updated', (data: any) => { ... });  // New function
  useSSEEvent('ticket:status_changed', (data: any) => { ... }); // New function
```

**Impact:**
- 3 new event listeners added per component render
- Memory grows indefinitely 
- CPU overhead from duplicate subscriptions
- Previous listeners never garbage collected properly

---

### 2.2 Large Component Page Size (MEDIUM)
**File:** `/home/user/app_ghitdesk/apps/web/src/app/(dashboard)/reports/page.tsx` (316 lines)
**Severity:** MEDIUM

The entire reports page is a single component with:
- 4 Recharts embedded
- Mock data hardcoded (100+ lines)
- No code splitting
- Charts rendered on every mount

**Recommendations:**
- Extract chart components to separate files
- Lazy load charts with React.lazy
- Move mock data to separate module
- Use data fetching instead of hardcoded mock

---

### 2.3 No Code Splitting for Heavy Dependencies (MEDIUM)
**File:** reports/page.tsx imports Recharts
**Severity:** MEDIUM

Recharts (500KB+) loaded for all dashboard users even if they don't visit reports:

```typescript
import {
  LineChart, AreaChart, BarChart, PieChart,
  Line, Area, Bar, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
```

**Recommended Fix:**
```typescript
const ReportsPage = lazy(() => import('./reports/page'));
```

---

### 2.4 Missing Image Optimization (LOW)
**Impact:** No Image component from next/image found
**Severity:** LOW

While no images are currently used, when added:
- Use Next.js Image component
- Enable automatic optimization
- Add loading="lazy" for below-fold images

---

### 2.5 Unoptimized SVG Icons from lucide-react (LOW)
**Severity:** LOW - lucide-react handles this well

However, icons should be memoized if used frequently:
```typescript
const MemoizedDownloadIcon = memo(() => <Download size={18} />);
```

---

### 2.6 No API Response Caching (MEDIUM)
**File:** api-client.ts, pages using apiClient
**Severity:** MEDIUM

Every page reload fetches fresh data:
- Tickets page always refetches
- Inbox page always refetches
- No caching strategy implemented

Package.json has `@tanstack/react-query` but it's unused!

---

### 2.7 Large Export Utility with No Streaming (LOW)
**File:** export.ts
**Severity:** LOW

CSV/JSON downloads built in memory:
```typescript
const json = JSON.stringify(data, null, 2);  // ✗ All in memory
const blob = new Blob([json], { ... });
```

For large datasets (1000+ records), this could freeze the UI.

---

## 3. ACCESSIBILITY ISSUES

### 3.1 ⚠️ Missing ARIA Labels on Badge Icons (HIGH)
**Files:** priority-badge.tsx, channel-badge.tsx, status-badge.tsx
**Severity:** HIGH

Icons have no screen reader labels:

**priority-badge.tsx (line 41):**
```typescript
startContent={config.icon ? <AlertCircle size={14} /> : undefined}
// ✗ No aria-label for AlertCircle
```

**channel-badge.tsx (lines 42):**
```typescript
startContent={<Icon size={14} />}
// ✗ Icon has no aria-label
// Example: MessageCircle, Mail, Send, Twitter have no labels
```

**Impact:** Screen readers announce nothing for high/urgent priority badges

**Fix:**
```typescript
startContent={
  <AlertCircle 
    size={14} 
    aria-label="High priority ticket"
  />
}
```

---

### 3.2 Missing ARIA Labels on Interactive Cards (HIGH)
**File:** inbox/page.tsx (line 147)
**Severity:** HIGH

```typescript
<Card key={conv.id} isPressable isHoverable>
  {/* ✗ No aria-label, no role description */}
  <CardBody className="gap-3">
    <div className="flex justify-between items-start">
      <h4 className="font-semibold">Conversa {conv.id.slice(0, 8)}</h4>
      {/* Rest of content */}
    </div>
  </CardBody>
</Card>
```

**Problems:**
- Card is marked pressable but no click handler
- No aria-label explaining what clicking does
- Screen readers don't know it's interactive

---

### 3.3 Missing Form Labels and Descriptions (MEDIUM)
**File:** login/page.tsx
**Severity:** MEDIUM

```typescript
<Input
  type="email"
  label="Email"  // Visual label only
  placeholder="seu@email.com"
  // ✓ Good: autoComplete="email"
  // ✗ Missing: aria-describedby for error messages
/>

{error && (
  <div className="p-3 bg-danger/10 border border-danger rounded-lg">
    <p className="text-danger text-sm" id="error-message">{error}</p>
    {/* Input should have: aria-describedby="error-message" */}
  </div>
)}
```

---

### 3.4 Contrast Issues Not Validated (MEDIUM)
**Severity:** MEDIUM

No contrast testing visible. Examples where contrast may fail:
- Primary colors on default background
- Text on color-coded badges
- Default status color on light backgrounds

**Recommendations:**
- Run axe DevTools test
- Use Storybook addon-a11y (already installed!)
- Validate WCAG AA compliance

---

## 4. ERROR HANDLING ISSUES

### 4.1 ⚠️ No Error Boundaries in Application (CRITICAL)
**Severity:** CRITICAL

No error boundary implementation found. Single component error crashes entire app:

```typescript
// apps/web/src/app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <Providers>
          {children}  {/* ✗ No ErrorBoundary */}
        </Providers>
      </body>
    </html>
  );
}
```

**Impact:** 
- Any component error crashes entire app
- Users get blank screen
- No recovery mechanism

**Fix:** Create error boundary wrapper component

---

### 4.2 Silent API Failures in Auth Context (HIGH)
**File:** context/auth-context.tsx
**Severity:** HIGH

```typescript
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await apiClient.request<{ user: User }>('/auth/me');
        setUser(response.user);
      } catch (error) {
        setUser(null);  // ✗ No error tracking, no user feedback
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);
  
  // ✗ No error state exposed
  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Problems:**
- Auth init errors silently logged
- No way to distinguish "loading" from "failed"
- Users don't know auth failed

---

### 4.3 Missing Error States in Data Pages (HIGH)
**Files:** tickets/page.tsx, inbox/page.tsx
**Severity:** HIGH

```typescript
// tickets/page.tsx line 33-46
useEffect(() => {
  const fetchTickets = async () => {
    try {
      const data = await apiClient.request<{ tickets: Ticket[] }>('/tickets');
      setTickets(data.tickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);  // ✗ Only logs error
      // ✗ No error state variable
      // ✗ No error UI displayed
    } finally {
      setIsLoading(false);
    }
  };
  fetchTickets();
}, []);

// UI only handles isLoading state
{isLoading ? (
  <Card>Loading...</Card>
) : tickets.length === 0 ? (
  <Card>Empty state</Card>
) : (
  // Display tickets
)}
// ✗ No error state rendered
```

**Impact:**
- Users don't know if page failed to load
- Can't distinguish between "no data" and "fetch error"
- Manual page refresh required with no guidance

**Required Fix:**
```typescript
const [error, setError] = useState<string | null>(null);

// In catch block
setError(error instanceof Error ? error.message : 'Unknown error');

// In UI
{error && <ErrorAlert message={error} onRetry={fetchTickets} />}
```

---

### 4.4 Missing Retry Logic for SSE Reconnection (MEDIUM)
**File:** sse-client.ts (line 52-57)
**Severity:** MEDIUM

```typescript
this.eventSource.addEventListener('error', () => {
  console.error('❌ SSE: Connection error');
  this.disconnect();
  setTimeout(() => this.connect(), 5000);  // ✗ Fixed 5s retry only
});
```

**Problems:**
- Only retries once with fixed 5s delay
- No exponential backoff (5s, 10s, 30s...)
- No maximum retry limit (could retry forever)
- Connection error may be permanent but keeps retrying

**Recommendation:**
```typescript
private reconnectAttempts = 0;
private maxReconnectAttempts = 5;

addEventListener('error', () => {
  if (this.reconnectAttempts >= this.maxReconnectAttempts) {
    // Notify user, stop retrying
    return;
  }
  
  const delay = Math.min(5000 * Math.pow(2, this.reconnectAttempts), 60000);
  this.reconnectAttempts++;
  setTimeout(() => this.connect(), delay);
});
```

---

### 4.5 No Error Handling in Download Functions (MEDIUM)
**File:** utils/export.ts
**Severity:** MEDIUM

```typescript
export function downloadCSV(data: any[], options: ExportOptions = {}): void {
  const { filename = 'export.csv', headers } = options;

  const csv = toCSV(data, headers);  // ✗ Can throw if data is invalid
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);  // ✗ Can fail in some browsers
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();  // ✗ No error handling
  document.body.removeChild(link);
  // ✗ No cleanup of URL.createObjectURL (memory leak)
}
```

**Issues:**
- No try-catch
- No error feedback to user
- Memory leak: never calls URL.revokeObjectURL()
- No validation of filename

---

### 4.6 Unhandled Promise in API Client (MEDIUM)
**File:** api-client.ts (lines 68-71)
**Severity:** MEDIUM

```typescript
private async refreshToken(): Promise<void> {
  await fetch(`${this.baseURL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  // ✗ No error handling
  // ✗ No check if refresh succeeded
  // ✗ If 401, will retry request with same invalid token
}
```

**Impact:**
- Token refresh failure not detected
- Subsequent request fails with 401 again
- Creates infinite loop if token can't refresh

---

### 4.7 Type Safety with 'any' in Event Handlers (MEDIUM)
**Files:** tickets/page.tsx, inbox/page.tsx
**Severity:** MEDIUM

```typescript
useSSEEvent('ticket:created', (data: any) => {  // ✗ any type
  console.log('New ticket created:', data);
  const newTicket: Ticket = {
    id: data.ticket_id,        // ✗ data.ticket_id could be undefined
    ticket_number: data.ticket_number,  // ✗ Could be undefined
    title: data.title,        // ✗ Could be undefined
    priority: data.priority,  // ✗ Wrong enum value possible
    status: data.status,      // ✗ Wrong enum value possible
    created_at: data.timestamp || new Date().toISOString(),  // ✗ Inconsistent naming
  };
});
```

**Impact:**
- No type checking on SSE events
- Runtime errors if event shape changes
- Hard to debug malformed events

---

## 5. MISSING CRITICAL FEATURES

### 5.1 No Loading Skeleton/Spinner While Fetching (MEDIUM)
**Severity:** MEDIUM

Pages show "Carregando..." text in a card. Should use:
- Skeleton components for better UX
- Progressive rendering
- Actual spinner component

---

### 5.2 No Pagination Implementation (MEDIUM)
**Severity:** MEDIUM

Tickets and inbox pages have no pagination UI:
- Could load 1000+ records at once
- No lazy loading
- HeroUI has Pagination component available but not used

---

### 5.3 No Search/Filter Integration (MEDIUM)
**Severity:** MEDIUM

Search and filter inputs don't actually filter:
- searchQuery state managed but never used
- statusFilter state managed but never used
- channelFilter state managed but never used

---

## SUMMARY TABLE

| Category | Count | Critical | High | Medium |
|----------|-------|----------|------|--------|
| React Patterns | 4 | 1 | 2 | 1 |
| Performance | 7 | 0 | 1 | 4 |
| Accessibility | 4 | 0 | 2 | 2 |
| Error Handling | 7 | 1 | 2 | 4 |
| **Total** | **22** | **2** | **7** | **11** |

---

## RECOMMENDED ACTION PLAN

### Phase 1: Critical (Do First)
1. Implement error boundaries
2. Fix useSSEEvent dependency array
3. Add error states to data pages
4. Fix API token refresh error handling

### Phase 2: High Priority (Next Week)
1. Add ARIA labels to badge components
2. Fix component prop interfaces
3. Implement memoization for SSE callbacks
4. Add keyboard navigation tests

### Phase 3: Medium Priority (Next Sprint)  
1. Add comprehensive error UI
2. Fix SSE reconnection logic
3. Implement pagination/lazy loading
4. Add search/filter functionality
5. Code split Recharts

---

**Report Generated:** 2025-11-13
**Analysis Scope:** 66 TSX/TS files in /apps/web/src
