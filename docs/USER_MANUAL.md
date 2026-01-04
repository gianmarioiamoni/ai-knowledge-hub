# AI Knowledge Hub — User Manual

## Overview
AI Knowledge Hub is a multi-tenant RAG platform to centralize company knowledge, search it with AI, and produce SOPs. Upload documents, ingest them into a vector DB, chat with contextual answers, and generate operational procedures. Designed for security (Supabase Auth + RLS + RBAC) and scale (pgvector + LangChain + OpenAI).

**What is a SOP?**  
A Standard Operating Procedure (SOP) is a structured, repeatable set of steps to perform a task safely and consistently (e.g., onboarding steps, incident runbooks, compliance checklists).

## Who benefits (by company size)
- **Startup**: fast onboarding, centralize scattered docs, create SOPs without heavy tooling, invite team members with appropriate roles.
- **Small business**: single place for manuals/policies, quick answers to "how do we…" questions, exportable SOPs, team collaboration with role-based access.
- **Mid-size**: department-level knowledge bases, governed access, auditable SOP generation, team management and permission control.
- **Enterprise**: multi-tenant isolation, structured ingestion, retrieval on large corpora, repeatable SOPs with export and review flows, super admin oversight.

## User Roles & What You Can Do

### VIEWER (Read-Only)
- **View documents**: Browse uploaded company documents
- **Use Chat (RAG)**: Ask questions and get AI-powered answers
- **View SOPs**: Read existing procedures
- **Cannot**: Upload documents, generate SOPs, invite users, or modify anything

**Best for**: Employees who need to reference information but don't create content.

### CONTRIBUTOR (Standard User)
- **Everything VIEWER can do**, plus:
- **Upload documents**: Add PDFs to the knowledge base
- **Manage own documents**: Delete documents you uploaded
- **Generate SOPs**: Create new procedures based on company docs
- **Export SOPs**: Download procedures in Markdown or PDF format
- **Cannot**: Invite users, manage team, or change organization settings

**Best for**: Most employees who actively work with company documentation.

### COMPANY_ADMIN (Organization Admin)
- **Everything CONTRIBUTOR can do**, plus:
- **Invite team members**: Send email invitations with role assignment
- **Manage users**: Change roles, suspend/enable accounts, remove users
- **Monitor invitations**: Track pending, accepted, expired, and revoked invites
- **Manage subscription**: Upgrade, downgrade, or cancel organization plan
- **Access billing**: View and manage payment information

**Best for**: Team leads, managers, or IT admins who manage the organization.

### SUPER_ADMIN (Platform Admin)
- **Global oversight**: Manage all organizations and users
- **System statistics**: Monitor platform-wide usage and health
- **User management**: Promote/demote users across organizations
- **Organization control**: Enable/disable organizations

**Best for**: Platform administrators only (not regular company users).

## Access & Accounts
- **Sign in** with email/password or Google OAuth.
- **Profile page**: See your email, role, current plan, renewal or trial end, and manage password or account deletion.
- **Logout**: Available on all pages (top-right corner) for quick sign-out.

## Navigation

### Desktop Navigation (screens ≥1024px)
- **Top menu bar**: Dashboard, Documents, Chat, Procedures (+ Plans and Admin for Company Admins)
- **Icons**: Help (?), Language switcher (🌐), Command palette (⌘K)
- **Logout button**: Always visible in page header (aligned right)

### Mobile Navigation (screens <1024px)
- **Compact header**: Organization name, essential icons
- **Command Palette (⌘K)**: Primary navigation method
  - Press **Ctrl+K** (Windows/Linux) or **Cmd+K** (Mac)
  - Shows all pages you can access based on your role
  - Type to filter, use arrows to navigate, Enter to open
- **Menu items**: Dynamically filtered by your permissions

### Navigation Map
- **Dashboard**: Entry points and status overview at a glance
- **Documents**: Upload and monitor ingestion pipeline
- **Chat**: Ask questions on your ingested docs (RAG)
- **Procedures**: Generate, manage, and export SOPs
- **Admin** *(COMPANY_ADMIN only)*: Team management, invitations, user roles
- **Plans** *(COMPANY_ADMIN only)*: Subscription and billing management
- **Profile**: Personal settings and account management
- **Contact**: Reach support (technical, commercial, billing, other)
- **Help**: User manuals, FAQ, and documentation

## Documents — Ingestion Pipeline

### Uploading Documents *(CONTRIBUTOR and above)*
1. Go to **Documents** page
2. Click **Upload** or drag & drop PDF files
3. Monitor status progression:
   - **Pending**: Uploaded, waiting for processing
   - **Processing**: Being chunked and embedded
   - **Ingested**: Ready for use in Chat and SOPs
   - **Failed**: Error during processing (retry by re-uploading)

### After Ingestion
- Content is automatically:
  - Split into semantic chunks
  - Converted to vector embeddings (OpenAI)
  - Stored in pgvector database
  - Searchable in Chat
  - Available for SOP generation

### Tips
- **Prefer clean PDFs**: Text-based PDFs work best
- **Avoid scanned images**: Unless they have OCR (Optical Character Recognition)
- **Update regularly**: Re-upload modified documents to refresh AI answers
- **Check status**: Ensure documents show "Ingested" before using them

## Chat (RAG) — Ask with Context

### How to Use
1. Open **Chat** page
2. Type your question in natural language
3. AI retrieves relevant chunks from your documents
4. Get a concise, contextual answer with source references

### Features
- **Context inspection**: See which document chunks were used for each answer
- **Conversation history**: Continues context within the same chat
- **Multiple chats**: Start new conversations to separate topics
- **Source attribution**: Know which documents informed each response

### Use Cases
- "What is our password policy?"
- "How do I onboard a new employee?"
- "What are the safety procedures for machine X?"
- "Summarize our client communication guidelines"
- "What is the process for expense reimbursement?"

### Tips
- **Be specific**: "What is the vacation policy for full-time employees?" vs "vacation"
- **Ensure ingestion**: Check that relevant documents are "Ingested"
- **Add context**: Include department or process name if needed
- **Review sources**: Check the context chunks to verify answer accuracy

## Procedures (SOP) — From Docs to Action

### Generating SOPs *(CONTRIBUTOR and above)*
1. Go to **Procedures** page
2. Click **Generate New SOP**
3. Provide:
   - **Title**: Clear name for the procedure (e.g., "Employee Onboarding")
   - **Scope/Context**: What the SOP should cover (e.g., "First day setup for new hires")
4. AI generates structured SOP based on your documents:
   - Purpose and scope
   - Prerequisites
   - Numbered steps
   - Safety warnings
   - Checklists

### Managing SOPs
- **View**: Read full procedure with formatted steps
- **Edit**: Modify title or regenerate content *(in development)*
- **Export Markdown**: Download as .md file
- **Export PDF**: Download formatted PDF *(requires backend setup)*
- **Delete**: Remove procedure (with confirmation)

### Use Cases
- Safety checklists for equipment operation
- Onboarding steps for new employees
- Incident response runbooks
- Compliance procedures
- Customer support workflows
- Software deployment checklists

### Tips
- **Clear titles**: "How to Deploy Production Code" vs "Deployment"
- **Specific scope**: Include key steps you want covered
- **Update sources**: Regenerate SOPs when underlying docs change
- **Review output**: Always review AI-generated procedures for accuracy

## Team Management *(COMPANY_ADMIN only)*

Company Admins have access to the **Admin** page for team management.

### Inviting Team Members

1. Go to **Admin** page
2. In the **Invite New Member** section:
   - Enter email address
   - Select role (CONTRIBUTOR or VIEWER)
   - Click **Invite**
3. User receives invitation email with signup link
4. Track invitation status:
   - **Pending**: Sent, awaiting acceptance
   - **Accepted**: User has signed up
   - **Expired**: Invitation link expired (resend if needed)
   - **Revoked**: Invitation cancelled by admin

### Managing Existing Users

In the **Users** section, you can:

- **Change role**: Select new role from dropdown (COMPANY_ADMIN, CONTRIBUTOR, VIEWER)
  - Changes apply immediately
  - User sees updated permissions on next action
- **Suspend user**: Temporarily disable account access
  - User cannot log in while suspended
  - Data remains intact
  - Can be re-enabled anytime
- **Enable user**: Restore access for suspended accounts
- **Delete user**: Permanently remove from organization
  - Requires confirmation
  - User is removed from all teams
  - Their uploaded content may remain (depending on policy)

### Monitoring Invitations

- **Filter invitations**: View by status (all, pending, accepted, expired, revoked)
- **Revoke invitation**: Cancel pending invitations
- **Delete invitation**: Remove invitation record
- **Bulk delete**: Remove all invitations at once

### Best Practices
- **Assign minimal roles**: Start with VIEWER, promote to CONTRIBUTOR as needed
- **Review regularly**: Audit team members and their roles periodically
- **Remove promptly**: Delete or suspend users who leave the organization
- **Track invitations**: Clean up expired or rejected invitations

## Plans & Billing *(COMPANY_ADMIN only)*

### Managing Subscription
1. Go to **Plans** page
2. Compare available tiers:
   - **Trial**: Free trial with limited features and time
   - **SMB**: Small/Medium Business plan
   - **Enterprise**: Advanced features and support
3. Click **Choose Plan** or **Upgrade**
4. Complete Stripe checkout
5. Subscription activates immediately

### Billing Information
- View in **Profile** page:
  - Current plan name
  - Billing cycle (monthly/annual)
  - Next renewal date or trial end date
  - Cancellation status (if applicable)

### Cancellation
- Cancelled plans remain active until period end
- Trial remains active until expiry date
- No prorated refunds (per Stripe policy)
- Can resubscribe anytime

## Contact & Support

### Submitting Support Requests
1. Go to **Contact** page
2. Fill in the form:
   - **Category**: Technical, Commercial, Billing, Other
   - **Subject**: Brief description of your issue
   - **Message**: Detailed explanation
   - **Email**: Pre-filled if logged in (editable)
   - **Phone**: Optional contact number
3. Click **Send**
4. Receive confirmation email
5. Admin is automatically notified

### Response Times
- Technical: 24-48 hours (business days)
- Billing: 24 hours
- Commercial: 2-3 business days

### For Faster Resolution
- Include screenshots if applicable
- Specify page/feature where issue occurs
- Describe steps to reproduce
- Mention your role and organization

## Security & Privacy

### Authentication
- Supabase Auth with email/password or OAuth (Google)
- Secure session management with automatic expiration
- Password reset via email

### Data Isolation
- **Multi-tenant architecture**: Each organization's data is completely isolated
- **Row-Level Security (RLS)**: Database-enforced access control
- **No cross-tenant access**: Even admins cannot see other organizations' data

### Data Storage
- **Documents**: Supabase Storage with encryption at rest
- **Embeddings**: PostgreSQL + pgvector
- **User data**: Supabase Auth (encrypted)

### Permissions Enforcement
- **UI level**: Hide features based on role
- **API level**: Server-side validation for all actions
- **Database level**: RLS policies prevent unauthorized access

### Security Headers
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options, X-Content-Type-Options

### Rate Limiting
- Chat queries: Prevents abuse
- API endpoints: Protects against attacks
- File uploads: Reasonable limits

## Troubleshooting

### Upload Issues
- **Problem**: PDF upload fails
- **Solutions**:
  - Ensure file is valid PDF (not corrupted)
  - Check file size (max 10MB typically)
  - Verify you have CONTRIBUTOR role or above
  - Retry after a few seconds
  - Check Documents page for status

### Chat Quality Issues
- **Problem**: Answers are inaccurate or vague
- **Solutions**:
  - Confirm documents are fully "Ingested"
  - Use more specific questions
  - Add context (department, process, time period)
  - Check if relevant documents are uploaded
  - Review source chunks to verify context

### SOP Generation Problems
- **Problem**: SOP content is incomplete or off-topic
- **Solutions**:
  - Provide clearer scope/context
  - Ensure source documents contain relevant info
  - Be specific about required steps
  - Try regenerating with refined prompt
  - Review and edit output

### Export Failures
- **Problem**: PDF/Markdown export fails
- **Solutions**:
  - Retry export after a few seconds
  - Ensure SOP exists and is saved
  - Check browser console for errors
  - Try different browser
  - Contact support if persistent

### Access Denied Errors
- **Problem**: Cannot access certain features
- **Solutions**:
  - Check your role in Profile page
  - Contact Company Admin to request role upgrade
  - Verify you're logged in
  - Clear browser cache and re-login

### Invitation Issues
- **Problem**: Invited user cannot sign up
- **Solutions**:
  - Check spam folder for invitation email
  - Verify email address is correct
  - Resend invitation if expired
  - Check invitation status in Admin page
  - Contact support with invitation details

## Getting the Most Out of It

### For All Users
- **Keep documents updated**: Re-ingest after major changes
- **Use clear language**: Specific questions get better answers
- **Explore context**: Review source chunks to understand AI reasoning
- **Organize chats**: Use separate conversations for different topics

### For Contributors
- **Upload systematically**: Organize documents by category/department
- **Name clearly**: Use descriptive filenames
- **Update regularly**: Refresh documents when policies change
- **Generate SOPs**: Turn frequently asked questions into procedures

### For Company Admins
- **Assign roles carefully**: Follow principle of least privilege
- **Monitor usage**: Check who's active and who needs training
- **Review team regularly**: Audit roles and permissions quarterly
- **Clean up invitations**: Delete expired invitations periodically
- **Manage subscription**: Upgrade/downgrade based on team size

### For Teams
- **Share procedures**: Export SOPs and distribute to relevant teams
- **Collaborate in chat**: Share useful queries with colleagues
- **Standardize uploads**: Agree on naming and organization conventions
- **Provide feedback**: Report issues to improve the knowledge base

## Keyboard Shortcuts

- **Ctrl+K** (Windows/Linux) or **Cmd+K** (Mac): Open Command Palette
- **Esc**: Close Command Palette
- **Arrow keys**: Navigate Command Palette results
- **Enter**: Select/open highlighted item

## Need Help?

### In-App Support
- **Help page**: `/{locale}/help` - Manuals, FAQ, quick links
- **Contact page**: `/{locale}/contact` - Submit support ticket

### Email Support
- Email the configured admin/support address
- Include:
  - Your email and organization
  - Page/feature where issue occurs
  - Steps to reproduce
  - Screenshots (if applicable)
  - Expected vs actual behavior

### Response Priority
1. Critical: System down, data loss (immediate)
2. High: Features broken, access issues (24 hours)
3. Medium: Usability issues, questions (48 hours)
4. Low: Feature requests, enhancements (best effort)

---

**Version**: 2.0  
**Last Updated**: January 2026  
**For technical documentation**: See README.md in project root
