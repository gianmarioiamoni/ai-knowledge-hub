// seed/sampleProcedures.ts
import type { SeedProcedure } from "./types";

export const SAMPLE_PROCEDURES: SeedProcedure[] = [
  {
    title: "Standard Operating Procedure: Password Reset",
    content: `# Password Reset - Standard Operating Procedure

## Purpose
This SOP describes the process for resetting user passwords in compliance with company security policy.

## Scope
Applies to all employees requiring password reset assistance.

## Procedure

### Step 1: User Self-Service (Preferred)
1. Direct user to https://password.company.com
2. User clicks "Forgot Password"
3. System sends reset email
4. User creates new password meeting requirements

### Step 2: IT Support Reset (If self-service fails)
1. Verify user identity (employee ID + security questions)
2. Open Active Directory Users & Computers
3. Locate user account
4. Right-click > Reset Password
5. Generate temporary password
6. Email temporary password to user
7. Check "User must change password at next logon"
8. Log ticket in helpdesk system

### Step 3: New Password Requirements
- Minimum 12 characters
- Uppercase + lowercase + numbers + symbols
- No reuse of last 10 passwords
- Change every 90 days

## Safety & Compliance
⚠️ **WARNING**: Never share passwords via phone or unsecured channels
⚠️ **CRITICAL**: Always verify user identity before resetting

## Documentation
- Log all password resets in IT audit log
- Record ticket number and timestamp

---
*Source: IT Security Policy 2025*
*Generated: 2025-01-04*`,
    sourceDocuments: ["IT Security Policy 2025"],
  },
  {
    title: "Standard Operating Procedure: VPN Access Setup",
    content: `# VPN Access Setup - Standard Operating Procedure

## Purpose
Enable secure remote access to company resources via VPN.

## Scope
All employees requiring remote work capabilities.

## Prerequisites
- Active company email account
- Laptop/workstation with admin rights
- Stable internet connection

## Procedure

### Step 1: Install VPN Client
1. Download Cisco AnyConnect from IT Portal
2. Run installer as administrator
3. Accept license agreement
4. Complete installation wizard
5. Restart computer if prompted

### Step 2: Configure VPN
1. Launch Cisco AnyConnect
2. Enter VPN address: vpn.company.com
3. Click "Connect"
4. Enter credentials:
   - Username: company email
   - Password: Active Directory password
5. Accept security certificate

### Step 3: First Connection
1. Complete MFA challenge (if enabled)
2. Verify connection status (green checkmark)
3. Test access to internal resources
4. Confirm IP address shows company network

### Step 4: Troubleshooting
**Connection Fails:**
- Verify credentials
- Check internet connection
- Ensure port 443 is open
- Try different network (mobile hotspot)

**Certificate Errors:**
- Check system date/time
- Update VPN client to latest version
- Contact IT if certificate expired

## Security Guidelines
- Never share VPN credentials
- Disconnect when not actively working
- Use only on trusted networks
- Report suspicious connection attempts

## Support
IT Helpdesk: ext. 5555
Email: helpdesk@company.com
Available: 24/7

---
*Source: VPN Setup Guide - Remote Access*
*Generated: 2025-01-04*`,
    sourceDocuments: ["VPN Setup Guide - Remote Access"],
  },
  {
    title: "Standard Operating Procedure: New Employee IT Onboarding",
    content: `# New Employee IT Onboarding - Standard Operating Procedure

## Purpose
Standardize IT setup process for new hires to ensure security and productivity.

## Scope
All new employees joining the company.

## Timeline
- Week 1 before start: IT provisioning
- Day 1: Device setup
- Week 1: Training and access

## Procedure

### Phase 1: Pre-Arrival (1 week before)
**IT Provisioning:**
1. Receive hire notification from HR
2. Create Active Directory account
   - Username format: firstname.lastname
   - Generate temporary password
3. Create email account (same format)
4. Assign to security groups per role
5. Order hardware:
   - Laptop (MacBook Pro / Dell XPS)
   - Monitor, keyboard, mouse
   - Headset
   - Docking station

**Access Setup:**
6. Add to Microsoft 365 tenant
7. Create VPN account
8. Generate software licenses
9. Configure network shares access

### Phase 2: Day 1 - Device Setup
**Hardware Delivery:**
1. Provide sealed laptop package
2. Verify serial numbers in asset management
3. Collect signed equipment receipt

**Initial Login:**
4. User logs in with temporary password
5. Force immediate password change
6. Configure MFA (Microsoft Authenticator)
7. Install baseline software:
   - Microsoft Office 365
   - Cisco AnyConnect VPN
   - Slack
   - Web browsers (Chrome, Edge)
   - Antivirus (if not pre-installed)

### Phase 3: Training & Orientation
**Security Training (Mandatory):**
- Complete online security awareness course
- Review IT Security Policy
- Sign acceptable use policy
- MFA setup verification

**System Training:**
- VPN connection walkthrough
- Email and calendar basics
- Shared drive navigation
- Password management tools

**Access Verification:**
- Test VPN from home
- Verify email sending/receiving
- Confirm file share access
- Check application permissions

### Phase 4: Ongoing Support
**30-Day Check-in:**
- Verify no outstanding issues
- Collect feedback on setup process
- Address any access gaps

**90-Day Review:**
- Audit access levels
- Remove unused permissions
- Update software/licenses as needed

## Documentation Requirements
- All steps logged in ServiceNow
- Asset tracking updated
- Security acknowledgments filed
- Training completion recorded

## Key Contacts
- IT Helpdesk: ext. 5555
- HR Coordinator: ext. 3000
- Manager (for role-specific access)

---
*Source: New Employee IT Onboarding*
*Generated: 2025-01-04*`,
    sourceDocuments: ["New Employee IT Onboarding"],
  },
];
