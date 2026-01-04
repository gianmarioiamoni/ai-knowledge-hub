# Demo Users System - Quick Reference

## Overview
The demo users system creates 3 pre-configured users for demonstrations and presentations. These users are automatically created at startup and have specific restrictions to prevent accidental data loss.

---

## Demo Users

### 1. Demo Admin (COMPANY_ADMIN)
- **Email**: `DEMO_USER_EMAIL` env var or `demo@aiknowledgehub.com`
- **Password**: `DEMO_USER_PASSWORD` env var or `Demo@2025!Secure`
- **Name**: `DEMO_USER_NAME` env var or `Demo Admin`
- **Role**: COMPANY_ADMIN
- **Plan**: SMB (monthly)
- **Organization**: Demo Company

**Capabilities**:
- Full admin access to company
- Can invite users
- Can manage subscriptions
- Can upload documents
- Can create SOPs
- Can use chat (RAG)

---

### 2. Demo Contributor
- **Email**: `demo.contributor@aiknowledgehub.com` (fixed)
- **Password**: Same as Demo Admin
- **Name**: `Demo Contributor` (fixed)
- **Role**: CONTRIBUTOR
- **Organization**: Demo Company (same as Admin)

**Capabilities**:
- Can upload documents
- Can create SOPs
- Can use chat (RAG)
- Cannot invite users
- Cannot manage subscriptions

---

### 3. Demo Viewer
- **Email**: `demo.viewer@aiknowledgehub.com` (fixed)
- **Password**: Same as Demo Admin
- **Name**: `Demo Viewer` (fixed)
- **Role**: VIEWER
- **Organization**: Demo Company (same as Admin)

**Capabilities**:
- Can view documents
- Can view procedures
- Can use chat (RAG)
- Cannot upload documents
- Cannot create procedures
- Cannot invite users

---

## Environment Variables (Optional)

Add to `.env.local`:

```bash
# Demo User Configuration (Optional - defaults will be used if not set)
DEMO_USER_EMAIL=demo@aiknowledgehub.com
DEMO_USER_PASSWORD=Demo@2025!Secure
DEMO_USER_NAME=Demo Admin
```

**Important**: If you set any of these, you MUST set all 3, or none at all.

---

## Restrictions

### ❌ Demo Users CANNOT:
1. Delete their own account (self-deletion blocked)
2. Change their password (password change blocked)

### ✅ Demo Users CAN:
1. Be enabled/disabled by Super Admin
2. Be deleted by Super Admin (for cleanup/reset)
3. Login normally
4. Use all features based on their role
5. Be managed like regular users

---

## Auto-Creation

Demo users are created automatically:
1. When the server starts
2. After Super Admin creation
3. Only if they don't already exist

**Creation Log Output**:
```
[createDemoUsers] Creating demo organization and users...
[createDemoUsers] Demo organization created: <uuid>
[createDemoUsers] Demo admin created: <uuid>
[createDemoUsers] Demo contributor created: <uuid>
[createDemoUsers] Demo viewer created: <uuid>
[createDemoUsers] Demo users setup complete!
Demo Admin: demo@aiknowledgehub.com
Demo Contributor: demo.contributor@aiknowledgehub.com
Demo Viewer: demo.viewer@aiknowledgehub.com
Password (all): Demo@2025!Secure
```

---

## Use Cases

### 1. Product Demonstrations
```
Login: demo@aiknowledgehub.com
Password: Demo@2025!Secure
```
- Show full COMPANY_ADMIN capabilities
- No email verification needed
- Immediate access

### 2. Testing Different Roles
Test as CONTRIBUTOR:
```
Login: demo.contributor@aiknowledgehub.com
Password: Demo@2025!Secure
```

Test as VIEWER:
```
Login: demo.viewer@aiknowledgehub.com
Password: Demo@2025!Secure
```

### 3. Training Sessions
- Pre-configured users
- Safe environment
- Can't be deleted accidentally
- Easy to reset (disable/enable from Super Admin)

---

## Super Admin Management

From `/admin/users` page (Super Admin only):

**Enable/Disable Demo Users**:
- ✅ Available - Use "Enable" / "Disable" buttons
- Demo users can be temporarily disabled

**Delete Demo Users**:
- ✅ Available - Super Admin can delete demo users
- Useful for cleanup or reset
- Demo users will NOT be recreated automatically (only on server restart)
- Self-deletion by demo users is still blocked

---

## Security

### User Metadata
All demo users have:
```json
{
  "is_demo_user": true,
  "role": "COMPANY_ADMIN" | "CONTRIBUTOR" | "VIEWER",
  "organization_id": "<demo-org-uuid>",
  "organization_name": "Demo Company"
}
```

### Password Security
- Default password is strong: `Demo@2025!Secure`
- Can be changed via env vars
- Same password for all 3 users (simplicity for demos)

### Protection Functions
- `isDemoUser(email)` - Check if user is demo
- Used in actions to prevent:
  - Password changes
  - Account deletion

---

## Technical Details

### Files
- `lib/server/demoUsers.ts` - Core demo users logic
- `lib/server/bootstrapSuperAdmin.ts` - Integration with startup
- `lib/env.ts` - Environment variables validation
- `app/[locale]/profile/actions.ts` - Self-deletion protection
- `app/[locale]/admin/users/actions.ts` - Admin deletion protection

### Database
- **organizations** table: "Demo Company" organization
- **organization_members** table: 3 members
- **auth.users** table: 3 users with email_confirmed = true

### Flags
- `is_demo_user: true` in user_metadata
- Used to identify and protect demo users

---

## Troubleshooting

### Demo users not created?
1. Check server logs for `[createDemoUsers]` messages
2. Verify no errors during startup
3. Check Super Admin creation succeeded first

### Can't login?
1. Verify email: `demo@aiknowledgehub.com` (or your env var)
2. Verify password: `Demo@2025!Secure` (or your env var)
3. Check Super Admin dashboard - users should be visible

### Want to reset demo data?
1. Super Admin → `/admin/users`
2. Find "Demo Company" organization
3. Disable → Re-enable all 3 users
4. Or delete demo data manually from database

---

## Best Practices

### For Presentations
1. Create demo documents beforehand
2. Have some chat conversations ready
3. Show role differences with the 3 accounts
4. Explain the "cannot delete" safety feature

### For Training
1. Let trainees use demo accounts
2. Reset between sessions (disable/enable)
3. Add more users to demo company if needed
4. Don't share admin password publicly

### For Development
1. Use demo accounts for testing
2. Test role-based features easily
3. No need to create test users manually
4. Safe to experiment (can't break them)

---

**Status**: ✅ Fully implemented and tested
**Last Updated**: January 2026

