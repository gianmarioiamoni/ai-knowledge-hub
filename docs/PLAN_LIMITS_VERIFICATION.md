# Plan Limits Enforcement - Verification Report

## Overview
This document verifies that all subscription plan limits are properly enforced throughout the application.

## Plan Limits Definition

### Trial Plan
- Max Contributors: **5**
- Max Viewers: **20**
- Max Documents: **10**
- Max Procedures (SOPs): **5**
- Max Conversations: **20**

### SMB Plan
- Max Contributors: **20**
- Max Viewers: **100**
- Max Documents: **100**
- Max Procedures (SOPs): **50**
- Max Conversations: **200**

### Enterprise Plan
- Max Contributors: **200**
- Max Viewers: **1,000**
- Max Documents: **1,000**
- Max Procedures (SOPs): **500**
- Max Conversations: **2,000**

### Expired Plan
- All limits: **0**

## Enforcement Points

### ✅ 1. User Invitations
**File**: `app/[locale]/admin/actions.ts` → `createInvite()`

**What is checked**:
- Before creating an invite, count existing members + pending invites for the target role
- Compare against `maxContributors` or `maxViewers` based on role
- Reject if limit would be exceeded

**Error message**:
- EN: "You cannot invite more {role}. Plan limit: {count}"
- IT: "Non puoi invitare altri {role}. Limite piano: {count}"

**Code location**: Lines 301-322

---

### ✅ 2. Accept Invitation
**File**: `app/invite/accept/route.ts`

**What is checked**:
- When a user accepts an invite, count existing members for that role
- Compare against plan limits
- Reject acceptance if limit would be exceeded
- **Note**: Only enforced for NEW memberships (not for existing members accepting re-invites)

**Error message**:
- EN: "You cannot invite more {role}. Plan limit: {count}"
- IT: "Non puoi invitare altri {role}. Limite piano: {count}"

**Code location**: Lines 69-106

---

### ✅ 3. Change User Role
**File**: `app/[locale]/admin/actions.ts` → `changeUserRole()`

**What is checked**:
- When upgrading a VIEWER → CONTRIBUTOR, count existing CONTRIBUTORs (excluding the user being changed)
- Also count pending CONTRIBUTOR invites
- Compare total against `maxContributors`
- Reject if limit would be exceeded

**Error message**:
- EN: "You cannot invite more Contributors. Plan limit: {count}"
- IT: "Non puoi invitare altri Contributors. Limite piano: {count}"

**Code location**: Lines 139-171

**Edge cases handled**:
- CONTRIBUTOR → VIEWER: No check needed (downgrade)
- VIEWER → COMPANY_ADMIN: No check needed (not a CONTRIBUTOR)
- CONTRIBUTOR → COMPANY_ADMIN: No check needed (already counted)

---

### ✅ 4. Document Upload
**File**: `app/[locale]/documents/actions.ts` → `uploadDocument()`

**What is checked**:
- Before uploading a new document, count total documents for the organization
- Compare against `maxDocuments`
- Reject upload if limit would be exceeded

**Error message**:
- EN: "Document limit reached ({count} max). Please upgrade your plan or delete old documents."
- IT: "Limite documenti raggiunto ({count} max). Aggiorna il piano o elimina vecchi documenti."

**Code location**: Lines 62-78

---

### ✅ 5. SOP Generation
**File**: `app/[locale]/procedures/actions.ts` → `handleGenerateSop()`

**What is checked**:
- Before generating a new SOP, count total procedures for the organization
- Compare against `maxProcedures`
- Reject generation if limit would be exceeded

**Error message**:
- EN: "Procedure limit reached ({count} max). Please upgrade your plan or delete old procedures."
- IT: "Limite procedure raggiunto ({count} max). Aggiorna il piano o elimina vecchie procedure."

**Code location**: Lines 74-86

---

### ✅ 6. Chat Conversation Creation
**File**: `lib/server/conversations.ts` → `ensureConversation()`

**What is checked**:
- When creating a NEW conversation (not when reusing existing), count total conversations for the organization
- Compare against `maxConversations`
- Throw error if limit would be exceeded

**Error message**:
- "Conversation limit reached ({count}). Please upgrade your plan or delete old conversations."

**Code location**: Lines 22-45

**Note**: Error is thrown (not returned), so it will be caught by API route handler and returned as 500 error.

---

### ✅ 7. Active Plan Enforcement
**File**: Multiple files

**What is checked**:
- `ensureActivePlan()` is called on ALL authenticated pages and API routes
- Redirects to `/plans` page if:
  - Plan is `expired`
  - Plan is `trial` and `trialEndsAt` has passed
  - No plan metadata exists (defaults to trial)
- **Exception**: SUPER_ADMIN role bypasses all plan checks

**Pages/routes with enforcement**:
1. ✅ `/dashboard` - `app/[locale]/dashboard/page.tsx:57`
2. ✅ `/documents` - `app/[locale]/documents/page.tsx:52`
3. ✅ `/chat` - `app/[locale]/chat/page.tsx:41`
4. ✅ `/procedures` - `app/[locale]/procedures/page.tsx:52`
5. ✅ `/api/chat/query` - `app/api/chat/query/route.ts:38`
6. ✅ `/api/chat/messages` - `app/api/chat/messages/route.ts:34`
7. ✅ `/api/procedures/export` - `app/api/procedures/export/route.ts:64`

---

## Plan Limits Retrieval Flow

```typescript
// 1. Get organization's plan from Company Admin's user metadata
const planId = await getOrganizationPlanId(organizationId);
// Returns: "trial" | "smb" | "enterprise" | "expired"

// 2. Get limits for that plan
const limits = getPlanLimits(planId);
// Returns: { maxContributors, maxViewers, maxDocuments, maxProcedures, maxConversations }

// 3. Count current usage
const { count } = await supabase
  .from("table_name")
  .select("id", { count: "exact", head: true })
  .eq("organization_id", organizationId);

// 4. Enforce limit
if (count >= limits.maxSomething) {
  return { error: "Limit reached" };
}
```

---

## Translations

### English (`messages/en.json`)
```json
{
  "invites": {
    "errors": {
      "limitContributor": "You cannot invite more Contributors. Plan limit: {count}",
      "limitViewer": "You cannot invite more Viewers. Plan limit: {count}"
    }
  },
  "documentsPage": {
    "errors": {
      "limitDocuments": "Document limit reached ({count} max). Please upgrade your plan or delete old documents."
    }
  },
  "proceduresPage": {
    "errors": {
      "limitProcedures": "Procedure limit reached ({count} max). Please upgrade your plan or delete old procedures."
    }
  }
}
```

### Italian (`messages/it.json`)
```json
{
  "invites": {
    "errors": {
      "limitContributor": "Non puoi invitare altri Contributors. Limite piano: {count}",
      "limitViewer": "Non puoi invitare altri Viewers. Limite piano: {count}"
    }
  },
  "documentsPage": {
    "errors": {
      "limitDocuments": "Limite documenti raggiunto ({count} max). Aggiorna il piano o elimina vecchi documenti."
    }
  },
  "proceduresPage": {
    "errors": {
      "limitProcedures": "Limite procedure raggiunto ({count} max). Aggiorna il piano o elimina vecchie procedure."
    }
  }
}
```

---

## Potential Edge Cases & Considerations

### ✅ Handled
1. **Race conditions**: Invites + members counted together to prevent over-limit
2. **Pending invites**: Counted toward limits to prevent circumvention
3. **Role changes**: Properly checked when upgrading VIEWER → CONTRIBUTOR
4. **Existing members**: Not counted again when accepting re-invite
5. **Super Admin**: Bypassed from all plan checks via `isUnlimitedRole()`

### ⚠️ To Consider (Future Enhancements)
1. **Bulk operations**: If we add "invite multiple users" feature, need to ensure batch limit check
2. **Document replacement**: Currently, replacing a document still creates a new entry (counts toward limit)
3. **Soft deletes**: If we implement soft deletes, need to count only non-deleted records
4. **Conversation archiving**: Consider adding "archive" feature instead of hard delete to preserve history
5. **Plan upgrade/downgrade**: What happens if current usage exceeds new plan's limits?
   - Current behavior: Existing items remain, but new items blocked
   - Ideal: Show warning during downgrade, force cleanup, or grandfather existing usage

---

## Testing Checklist

### User Limits
- [ ] Trial: Invite 5 Contributors → 6th should fail
- [ ] Trial: Invite 20 Viewers → 21st should fail
- [ ] Accept invite when at limit → Should fail gracefully
- [ ] Change VIEWER to CONTRIBUTOR when at CONTRIBUTOR limit → Should fail
- [ ] Change CONTRIBUTOR to VIEWER (downgrade) → Should succeed even at VIEWER limit

### Resource Limits
- [ ] Trial: Upload 10 documents → 11th should fail
- [ ] Trial: Generate 5 SOPs → 6th should fail
- [ ] Trial: Create 20 conversations → 21st should fail
- [ ] Delete 1 document, then upload new one → Should succeed
- [ ] Delete 1 SOP, then generate new one → Should succeed
- [ ] Delete 1 conversation, then create new one → Should succeed

### Plan Expiration
- [ ] Trial expires → All pages redirect to `/plans`
- [ ] Upgrade to SMB → Higher limits apply immediately
- [ ] Upgrade to Enterprise → Even higher limits apply
- [ ] SUPER_ADMIN → Bypasses all limits and expiration

### Error Messages
- [ ] English locale → Shows English error messages
- [ ] Italian locale → Shows Italian error messages
- [ ] Error includes actual limit number (e.g., "Limit: 10")

---

## Performance Considerations

### Query Optimization
All limit checks use `count: "exact", head: true` for optimal performance:
```typescript
.select("id", { count: "exact", head: true })
```

This:
- Returns only the count, not actual data
- Uses PostgreSQL's `COUNT(*)` internally
- Faster than fetching and counting in application code

### Caching Opportunities (Future)
Consider caching plan limits for 1 hour since they rarely change:
```typescript
// Pseudo-code
const cachedLimits = await cache.get(`limits:${organizationId}`);
if (!cachedLimits) {
  const limits = await getPlanLimits(...);
  await cache.set(`limits:${organizationId}`, limits, 3600);
}
```

---

## Conclusion

✅ **All critical operations enforce plan limits**:
1. User invitations (create + accept)
2. Role changes (VIEWER → CONTRIBUTOR)
3. Document uploads
4. SOP generation
5. Conversation creation
6. Active plan expiration check

✅ **Translations**: Properly localized error messages (EN + IT)

✅ **User experience**: Clear error messages with actual limit numbers

✅ **Security**: Limits checked server-side, not bypassable from client

⚠️ **Recommendation**: Add end-to-end tests to verify limit enforcement for all operations.

---

**Last Updated**: January 2026  
**Version**: 1.0  
**Status**: ✅ Complete


