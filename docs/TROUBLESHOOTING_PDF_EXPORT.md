# Troubleshooting PDF Export in Production

## Issue: 500 Error on PDF Export in Vercel

### Problem Description
When attempting to export a procedure as PDF in production (Vercel), users receive:
```
GET /api/procedures/export?id=xxx&format=pdf&locale=en 500 (Internal Server Error)
```

### Root Causes

#### 1. **Serverless Function Limits**
Vercel serverless functions have limits that can be exceeded during PDF generation:
- **Memory**: 1024MB default (can be insufficient for large PDFs)
- **Timeout**: 10s (Hobby), 60s (Pro) - PDF generation may take longer
- **Bundle Size**: Large libraries like `pdf-lib` increase cold start time

#### 2. **pdf-lib Library Issues**
- Dynamic import may fail in serverless environment
- Memory-intensive operations for large content
- Complex markdown parsing can timeout

#### 3. **Missing Error Logs**
- Original implementation lacked detailed error logging
- Hard to diagnose root cause in production

---

## Solutions Implemented

### 1. Enhanced Error Handling & Logging

**File**: `lib/server/sopPdf.ts`
```typescript
// Added try-catch with detailed logging
logInfo("Starting PDF generation", { ... });
// ... PDF generation code ...
logInfo("PDF generation completed", { byteSize: pdfBytes.length });
```

**File**: `app/api/procedures/export/route.ts`
```typescript
try {
  const pdf = await renderSopPdf({ ... });
  // ... return PDF ...
} catch (pdfError) {
  logError("PDF export failed", { error, stack, ... });
  return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
}
```

### 2. Increased Function Limits

**File**: `vercel.json`
```json
{
  "functions": {
    "app/api/procedures/export/route.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

**File**: `app/api/procedures/export/route.ts`
```typescript
export const maxDuration = 30; // 30 seconds timeout
```

---

## How to Debug in Production

### 1. Check Vercel Logs
```bash
# Via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Functions" tab
4. Find "/api/procedures/export"
5. Check logs for error messages

# Via Vercel CLI
vercel logs --follow
```

### 2. Check Sentry (if configured)
If `SENTRY_DSN` is set, errors are automatically captured:
```bash
1. Go to sentry.io
2. Find the error event
3. Check stack trace and context
```

### 3. Test Locally
```bash
# Build production bundle
npm run build

# Start production server
npm start

# Test PDF export
curl "http://localhost:3000/api/procedures/export?id=<ID>&format=pdf&locale=en" \
  -H "Cookie: <auth-cookie>" \
  --output test.pdf
```

### 4. Check Function Execution Time
In Vercel logs, look for:
```
Duration: XXXms
Memory Used: XXX MB
```

If duration > 30s or memory > 1024MB, increase limits.

---

## Alternative Solutions

### Option 1: Increase Vercel Plan Limits
**Pro Plan** provides:
- Up to 60s timeout
- More memory allocation
- Better cold start performance

### Option 2: Use External PDF Service
Replace `pdf-lib` with external service:
- **Puppeteer** (requires Docker on Vercel)
- **CloudConvert API**
- **PDFShift**
- **WeasyPrint** (Python-based)

Example with external service:
```typescript
// lib/server/sopPdf.ts
const renderSopPdf = async (sop: SopGenerated): Promise<Buffer> => {
  const html = await renderSopHtml(sop); // Convert markdown to HTML
  
  const response = await fetch('https://pdf-service.com/api/convert', {
    method: 'POST',
    body: JSON.stringify({ html }),
    headers: { 'Content-Type': 'application/json' }
  });
  
  return Buffer.from(await response.arrayBuffer());
};
```

### Option 3: Client-Side PDF Generation
Use browser-based PDF generation:
- **jsPDF** (lighter, client-side)
- **pdfmake** (client-side, better formatting)

Pros: No server load, no timeout issues
Cons: Slower for users, requires client-side JS

### Option 4: Simplify PDF Content
Reduce PDF complexity:
- Limit content length (truncate after N pages)
- Remove complex markdown formatting
- Use simpler fonts/layouts

```typescript
// Truncate content for PDF
const MAX_PDF_LINES = 100;
const content = sop.content.split('\n').slice(0, MAX_PDF_LINES).join('\n');
```

---

## Monitoring & Prevention

### 1. Add Content Length Validation
```typescript
// Before PDF generation
if (sop.content.length > 50000) {
  throw new Error("Content too large for PDF export");
}
```

### 2. Add Performance Metrics
```typescript
const startTime = Date.now();
const pdf = await renderSopPdf(sop);
const duration = Date.now() - startTime;
logInfo("PDF generation metrics", { duration, size: pdf.length });
```

### 3. Implement Caching
Cache generated PDFs:
```typescript
// Check cache first
const cacheKey = `pdf:${procedureId}:${updatedAt}`;
const cached = await redis.get(cacheKey);
if (cached) return Buffer.from(cached, 'base64');

// Generate and cache
const pdf = await renderSopPdf(sop);
await redis.set(cacheKey, pdf.toString('base64'), 'EX', 3600); // 1 hour
```

---

## Quick Fix Checklist

- [ ] Deploy latest code with enhanced logging
- [ ] Check Vercel logs for specific error messages
- [ ] Verify `vercel.json` is committed and deployed
- [ ] Test with small procedure first
- [ ] Test with demo procedure that's failing
- [ ] Check if error is consistent or intermittent
- [ ] Verify Vercel plan has sufficient limits
- [ ] Consider alternative PDF libraries if issue persists

---

## Contact Points

**If issue persists after all fixes:**
1. Check Vercel Status: https://www.vercel-status.com/
2. Review pdf-lib issues: https://github.com/Hopding/pdf-lib/issues
3. Consider switching to alternative solution (Option 2 or 3 above)

---

**Last Updated**: January 2026  
**Status**: Under investigation / Fixes deployed

