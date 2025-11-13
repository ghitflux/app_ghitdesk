# GhitDesk Security Audit Report

**Date:** 2025-11-13  
**Status:** CRITICAL VULNERABILITIES FOUND  
**Severity Levels:**
- CRITICAL: 5
- HIGH: 6
- MEDIUM: 5

---

## CRITICAL ISSUES

### 1. Missing Authentication on All API Endpoints

**Severity:** CRITICAL  
**Files:**
- `/home/user/app_ghitdesk/apps/api/app/api/routes/tickets.py` (Lines 15-109)
- `/home/user/app_ghitdesk/apps/api/app/api/routes/conversations.py` (Lines 12-86)
- `/home/user/app_ghitdesk/apps/api/app/api/routes/events.py` (Lines 10-39)

**Issue:** All endpoints are completely unprotected. Anyone can access:
- GET /tickets - List all tickets
- GET /tickets/{id} - Get specific ticket details
- GET /conversations - List all conversations
- GET /conversations/{id} - Get conversation details
- GET /events/stream - Access SSE real-time stream

**Example (tickets.py, line 15):**
```python
@router.get("/")
async def list_tickets(
    status: Optional[TicketStatus] = None,
    priority: Optional[TicketPriority] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    session: AsyncSession = Depends(get_session),  # NO AUTH!
):
```

**Impact:** Unauthorized access to sensitive customer conversations, tickets, and support data. Complete data breach.

**Fix Required:** Add `Depends(get_current_user)` dependency to all routes.

---

### 2. Missing /auth/refresh Endpoint

**Severity:** CRITICAL  
**File:** `/home/user/app_ghitdesk/apps/api/app/api/routes/auth.py`

**Issue:** Frontend tries to call `/auth/refresh` endpoint (line 68 in api-client.ts), but it doesn't exist:

```python
# Auth routes only have:
@router.post("/login")  # exists
@router.post("/logout") # exists
# /refresh is MISSING but frontend expects it!
```

Frontend code trying to use it:
```typescript
// /home/user/app_ghitdesk/apps/web/src/services/api-client.ts:68
private async refreshToken(): Promise<void> {
    await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
    });
}
```

**Impact:** Token refresh fails silently. Users get logged out unexpectedly. JWT expiration not handled properly.

---

### 3. Insecure Cookie Configuration

**Severity:** CRITICAL  
**File:** `/home/user/app_ghitdesk/apps/api/app/api/routes/auth.py` (Lines 40, 49)

**Issue:** Cookies are set with `secure=False`:
```python
# Line 40
response.set_cookie(
    key="access_token",
    value=tokens["access_token"],
    httponly=True,
    secure=False,  # VULNERABLE! Allows HTTP transmission
    samesite="lax",
    max_age=86400,
)

# Line 49
response.set_cookie(
    key="refresh_token",
    value=tokens["refresh_token"],
    httponly=True,
    secure=False,  # VULNERABLE! Allows HTTP transmission
    samesite="lax",
    max_age=604800,
)
```

**Impact:** Authentication tokens can be transmitted over HTTP. Vulnerable to man-in-the-middle attacks. Production must use HTTPS with `secure=True`.

---

### 4. Hardcoded Webhook Verification Token

**Severity:** CRITICAL  
**File:** `/home/user/app_ghitdesk/apps/api/app/api/routes/webhooks.py` (Line 21)

**Issue:** Webhook token is hardcoded instead of using environment variable:
```python
@router.get("/whatsapp")
async def whatsapp_webhook_verify(request: Request):
    """WhatsApp webhook verification"""
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    # Verificar token (em produção, usar settings.WHATSAPP_WEBHOOK_VERIFY_TOKEN)
    VERIFY_TOKEN = "ghitdesk_verify_token"  # HARDCODED!

    if mode == "subscribe" and token == VERIFY_TOKEN:
        return Response(content=challenge, media_type="text/plain")

    raise HTTPException(status_code=403, detail="Verification failed")
```

**Impact:** Known webhook token. Anyone can send fake webhooks to the system. Compromised data integrity.

**Fix:** Use `settings.WHATSAPP_WEBHOOK_VERIFY_TOKEN` from environment.

---

### 5. Information Disclosure in Error Handling

**Severity:** CRITICAL  
**File:** `/home/user/app_ghitdesk/apps/api/app/api/routes/webhooks.py` (Line 53)

**Issue:** Exception details are exposed in HTTP response:
```python
except Exception as e:
    print(f"Webhook error: {e}")
    raise HTTPException(status_code=500, detail=str(e))  # EXPOSES INTERNAL ERROR!
```

**Impact:** Leaks internal system details, database errors, stack traces to attackers.

---

## HIGH SEVERITY ISSUES

### 6. Overly Permissive CORS Configuration

**Severity:** HIGH  
**File:** `/home/user/app_ghitdesk/apps/api/app/main.py` (Lines 43-44)

**Issue:** All HTTP methods and headers are allowed:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],  # Allows PUT, DELETE, PATCH, OPTIONS, etc
    allow_headers=["*"],  # Allows ANY header
)
```

**Impact:** Cross-site request forgery (CSRF) vulnerabilities. Overly broad attack surface.

**Fix:** Specify only needed methods: `["GET", "POST"]`  
Specify safe headers: `["Content-Type"]`

---

### 7. Storybook Exposed in Production CORS

**Severity:** HIGH  
**File:** `/home/user/app_ghitdesk/apps/api/app/core/config.py` (Lines 33-36)

**Issue:** Storybook (localhost:6006) is in CORS allowed origins:
```python
CORS_ORIGINS: List[str] = [
    "http://localhost:3000",
    "http://localhost:6006",  # Storybook - dev only!
]
```

**Impact:** Storybook is a dev-only tool. Should not be in production CORS config.

---

### 8. Weak Default Test Passwords in Seed Data

**Severity:** HIGH  
**File:** `/home/user/app_ghitdesk/apps/api/seed_data.py` (Lines 27, 33, 39)

**Issue:** Weak, predictable test credentials documented publicly:
```python
users_data = [
    {
        "name": "Admin",
        "email": "admin@ghitdesk.com",
        "password": "admin123",  # Weak!
        "role": Role.ADMIN,
    },
    {
        "name": "João Silva",
        "email": "joao@ghitdesk.com",
        "password": "agent123",  # Weak!
        "role": Role.AGENT,
    },
    {
        "name": "Maria Santos",
        "email": "maria@ghitdesk.com",
        "password": "agent123",  # Weak!
        "role": Role.AGENT,
    },
]
```

Also printed in console:
```python
print("🔑 Credenciais:")
print("  - admin@ghitdesk.com / admin123 (Admin)")
print("  - joao@ghitdesk.com / agent123 (Agent)")
print("  - maria@ghitdesk.com / agent123 (Agent)")
```

**Impact:** Public knowledge of test credentials. If seed script is run in production, default accounts created.

---

### 9. Debug Information Leakage on Startup

**Severity:** HIGH  
**File:** `/home/user/app_ghitdesk/apps/api/app/main.py` (Line 17)

**Issue:** Database connection details logged at startup:
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Application starting...")
    print(f"📊 Database URL: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'Not configured'}")
```

While it attempts to hide the password, this still exposes:
- Database host
- Database name
- Database username

**Impact:** Leaks infrastructure details to anyone with access to logs.

---

### 10. Missing Authentication for Frontend Auth Routes

**Severity:** HIGH  
**File:** `/home/user/app_ghitdesk/apps/web/src/context/auth-context.tsx` (Lines 48-54)

**Issue:** User data is hardcoded instead of extracted from token:
```typescript
const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient.request<TokenResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    // Extrair user do token (simulado por enquanto, na prática viria do backend)
    setUser({
        id: '1',
        email,
        name: 'User',
        role: 'agent',  // Always 'agent' - even for admins!
    });
}, []);
```

**Impact:** All users have hardcoded 'agent' role. Admins cannot access admin functions on frontend.

---

## MEDIUM SEVERITY ISSUES

### 11. Missing Rate Limiting

**Severity:** MEDIUM  
**File:** Global (no rate limiting implementation)

**Issue:** No rate limiting configured. Settings has `RATE_LIMIT_PER_MINUTE: int = 60` but it's never used.

**Impact:** Vulnerability to brute force attacks, DDoS, API abuse.

**Fix:** Implement rate limiting middleware using `slowapi` or similar.

---

### 12. API_URL Inconsistency in BFF Routes

**Severity:** MEDIUM  
**File:** `/home/user/app_ghitdesk/apps/web/src/app/api/bff/auth/login/route.ts` (Line 3)

**Issue:** BFF routes use different API_URL than frontend:
```typescript
const API_URL = process.env.API_URL || 'http://localhost:8000';
```

But frontend uses:
```typescript
process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/bff'
```

**Impact:** Potential cross-environment misconfiguration. BFF routes might call wrong backend.

---

### 13. Missing CSRF Tokens

**Severity:** MEDIUM  
**Global**

**Issue:** No CSRF token implementation. While httpOnly cookies help, CSRF tokens provide additional protection.

**Impact:** Vulnerability to CSRF attacks if cookies alone are compromised.

---

### 14. Generic Error Message in Auth But Not Webhooks

**Severity:** MEDIUM  
**Files:**
- `/home/user/app_ghitdesk/apps/api/app/api/routes/auth.py` (Line 30) - Good: Generic error
- `/home/user/app_ghitdesk/apps/api/app/api/routes/webhooks.py` (Line 53) - Bad: Detailed error

**Issue:** Inconsistent error handling. Auth properly returns generic error, but webhooks expose details.

---

### 15. SSE Stream No Client Validation

**Severity:** MEDIUM  
**File:** `/home/user/app_ghitdesk/apps/api/app/api/routes/events.py` (Lines 10-39)

**Issue:** SSE endpoint accepts any client without validation. No client_id verification:
```python
@router.get("/stream")
async def events_stream():
    """SSE stream endpoint for real-time updates"""
    client_id = str(uuid4())  # Generated, not validated
    sse_manager = SSEManager.get_instance()

    async def event_generator():
        try:
            # Send initial connection message
            yield f"data: {{'event': 'connected', 'client_id': '{client_id}'}}\n\n"

            # Subscribe to events
            async for message in sse_manager.subscribe(client_id):
                yield message
```

**Impact:** Clients can connect without authentication. Could receive sensitive real-time events meant for other users.

---

## SUMMARY TABLE

| # | Category | Severity | File | Line(s) | Quick Fix |
|---|----------|----------|------|---------|-----------|
| 1 | Auth | CRITICAL | tickets.py, conversations.py, events.py | 15, 12, 10 | Add `Depends(get_current_user)` to all routes |
| 2 | Auth | CRITICAL | auth.py | N/A | Implement /auth/refresh endpoint |
| 3 | Auth | CRITICAL | auth.py | 40, 49 | Set `secure=True` in production |
| 4 | Auth | CRITICAL | webhooks.py | 21 | Use environment variable for webhook token |
| 5 | Error Handling | CRITICAL | webhooks.py | 53 | Use generic error messages |
| 6 | CORS | HIGH | main.py | 43-44 | Restrict to specific methods/headers |
| 7 | Config | HIGH | config.py | 34 | Remove localhost:6006 from prod CORS |
| 8 | Credentials | HIGH | seed_data.py | 27, 33, 39 | Use strong random passwords |
| 9 | Logging | HIGH | main.py | 17 | Remove connection details from logs |
| 10 | Frontend | HIGH | auth-context.tsx | 50 | Extract role from token |
| 11 | Rate Limiting | MEDIUM | Global | N/A | Implement rate limiting middleware |
| 12 | Config | MEDIUM | auth/login/route.ts | 3 | Use NEXT_PUBLIC_API_URL consistently |
| 13 | CSRF | MEDIUM | Global | N/A | Implement CSRF tokens |
| 14 | Error Handling | MEDIUM | webhooks.py | 53 | Standardize error responses |
| 15 | Auth | MEDIUM | events.py | 10-39 | Add client authentication to SSE |

---

## RECOMMENDATIONS (Priority Order)

### Phase 1: IMMEDIATE (Before Any Production Deployment)
1. **Add authentication dependency to all routes** - Implement proper JWT validation
2. **Create /auth/refresh endpoint** - Support token refresh
3. **Fix cookie secure flag** - Set to True with HTTPS
4. **Replace hardcoded webhook token** - Use environment variable
5. **Implement proper error handling** - No detail exposure

### Phase 2: URGENT (Within 1 week)
6. **Restrict CORS configuration** - Specify allowed methods/headers
7. **Extract user role from token** - Fix frontend auth context
8. **Generate strong random test credentials** - Don't use predictable passwords
9. **Remove debug logging** - Hide infrastructure details
10. **Implement rate limiting** - Protect against abuse

### Phase 3: SHORT TERM (Within 1 month)
11. **Add CSRF token support** - Additional request validation
12. **Standardize error responses** - Consistent security handling
13. **Authenticate SSE connections** - Validate client identity
14. **Audit all environment variables** - Ensure proper usage throughout

---

## Files Most Critical to Fix

1. **`/home/user/app_ghitdesk/apps/api/app/api/routes/`** - All route files need authentication
2. **`/home/user/app_ghitdesk/apps/api/app/main.py`** - CORS and logging issues
3. **`/home/user/app_ghitdesk/apps/api/app/api/routes/webhooks.py`** - Token and error handling
4. **`/home/user/app_ghitdesk/apps/web/src/context/auth-context.tsx`** - Frontend role handling

---

## Testing Recommendations

1. **Test unauthenticated access** - Verify routes properly reject unauthorized requests
2. **Test token expiration** - Verify refresh flow works properly
3. **Test webhook signature verification** - Ensure only legitimate webhooks accepted
4. **Penetration testing** - Professional security audit before production
5. **SAST scanning** - Use tools like Bandit (Python) and ESLint security plugins

