// seed/sampleConversations.ts
import type { SeedConversation } from "./types";

// Function to generate sample conversations with dynamic email addresses
export function getSampleConversations(adminEmail: string, contributorEmail: string): SeedConversation[] {
  return [
    {
      title: "Password Reset Procedure",
      userEmail: adminEmail,
    messages: [
      { role: "user", content: "How do I reset my password if I forgot it?" },
      {
        role: "assistant",
        content: `Based on the IT Security Policy document:

1. Go to https://password.company.com
2. Click 'Forgot Password'
3. Enter your email address
4. Check your email for reset link (expires in 1 hour)
5. Create new password meeting requirements:
   - Minimum 12 characters
   - Include uppercase, lowercase, numbers, symbols
   - Cannot reuse last 10 passwords

If you don't receive the email within 5 minutes, contact IT Support at ext. 5555.`,
      },
    ],
  },
    {
      title: "VPN Connection Issue",
      userEmail: contributorEmail,
    messages: [
      { role: "user", content: "I can't connect to the company VPN from home. What should I check?" },
      {
        role: "assistant",
        content: `Based on the VPN Setup Guide, here's a troubleshooting checklist:

**Step 1: Verify Credentials**
- Ensure you're using your company email
- Password should be your Active Directory password

**Step 2: Check VPN Client**
- Confirm Cisco AnyConnect is installed
- Version should be 4.9 or later
- Try restarting the VPN client

**Step 3: Network Requirements**
- Your home network must allow port 443 (HTTPS)
- Some ISPs block VPN traffic - check with your provider
- Try using mobile hotspot to rule out network issues

**Step 4: Certificate Issues**
- VPN certificate must be valid (check system date/time)
- If expired, contact IT to reissue

**Step 5: Contact IT**
If none of the above work, contact IT Support with:
- Error message screenshot
- Your employee ID
- Location and ISP name

IT Helpdesk: ext. 5555 or helpdesk@company.com`,
      },
    ],
  },
    {
      title: "New Employee Onboarding",
      userEmail: adminEmail,
    messages: [
      { role: "user", content: "What are the IT tasks for onboarding a new employee?" },
      {
        role: "assistant",
        content: `Based on the New Employee IT Onboarding checklist:

**Week 1 - Before Start Date:**
1. Create Active Directory account
2. Assign to appropriate security groups
3. Set up email account (firstname.lastname@company.com)
4. Order laptop/workstation
5. Generate temporary password

**Day 1 - First Day:**
6. Provide laptop + peripherals
7. User logs in with temporary password
8. Force password change on first login
9. Install required software:
   - Microsoft Office 365
   - Cisco AnyConnect VPN
   - Slack
   - Project-specific tools

**Day 2-5 - Training:**
10. Security awareness training (mandatory)
11. VPN setup and testing
12. Access to shared drives
13. Introduction to company security policies

**Ongoing:**
- Badge access provisioning
- Software license assignments
- Team-specific tool access

All steps must be documented in ServiceNow with ticket number.`,
      },
    ],
  },
    {
      title: "Multi-Factor Authentication Setup",
      userEmail: contributorEmail,
    messages: [
      { role: "user", content: "How do I enable MFA on my account?" },
      {
        role: "assistant",
        content: `Based on the IT Security Policy, here's how to enable MFA:

**Step 1: Access MFA Portal**
- Go to https://mfa.company.com
- Log in with your credentials

**Step 2: Choose MFA Method**
You can use:
- **Microsoft Authenticator (Recommended)**
- Google Authenticator
- SMS codes (backup only)
- Hardware token (for privileged accounts)

**Step 3: Setup Process**
1. Scan QR code with authenticator app
2. Enter 6-digit verification code
3. Save backup codes in secure location

**Step 4: Test MFA**
- Log out and log back in
- Verify MFA prompt appears
- Use authenticator code to complete login

**Important Notes:**
- MFA is mandatory for all users
- Backup codes should be stored securely (not in email)
- If you lose your device, contact IT immediately for MFA reset

**Security Best Practices:**
- Don't share codes or QR codes
- Enable biometric lock on authenticator app
- Review login history monthly`,
      },
    ],
    },
  ];
}
