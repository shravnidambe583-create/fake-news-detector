# TruthGuard AI Security Specification

This document details the Zero-Trust attribute-based security rules plan for TruthGuard AI's Firestore database fields and document endpoints.

## 1. Data Invariants

1. **User Ownership**: A user profile path (`/users/{userId}`) can only be written to if `{userId}` corresponds exactly to the authenticated user's `auth.uid`. No user can alter another user's profile.
2. **Report Accountability**: Any verification report (`/reports/{reportId}`) must map to the authenticating user (`uid == request.auth.uid`). Users can write their own reports, but are prohibited from editing other users' reports. Administrators can read all reports in the system.
3. **Audit Trail Authenticity**: Action logs (`/history/{historyId}`) can only be written by the respective user (`uid == request.auth.uid`), and are completely immutable upon creation (`createdAt / timestamp == request.time`).
4. **Chat Privacy**: Interactive chat Q&A dialogues (`/chats/{chatId}`) belong explicitly to the user who started the session (`uid == request.auth.uid`). All reads and updates must verify this owner mapping.

---

## 2. The "Dirty Dozen" Attack Payloads

These 12 specific payloads represent vectors an attacker on a client SDK might utilize to attempt privilege escalation or state manipulation. The Firestore Rules are designed to strictly reject all of them:

### A. Identity Spoofing & Profiling
1. **Rogue Admin Promotion**: Writing to `/users/attacker_id` with `{ "role": "admin" }` to escalate self-privileges.
2. **Cross-User Profile Hijacking**: Authenticated user `user_A` trying to write/modify fields on `/users/user_B`.
3. **Anonymized Profile Write**: Attempting to create or alter user profile details when unauthenticated or without email verification.

### B. Report tampering
4. **Report Author Spoofing**: Authenticated user `attacker_id` submitting a verification report directly via a client SDK setting `uid: "victim_id"`.
5. **Report Edit Intrusion**: User `user_A` attempting to edit the `verdict` or `trustScore` of an existing report belonging to `user_B` (or even their own, as reports should be system generated or locked).
6. **Ghost Injection**: Submitting an analysis report with illegal custom fields (e.g., `{ "vulnerability_score": 100, "ghost_flag": true }`) because of missing schema matches.

### C. History Spoofing & Integrity
7. **Retroactive Timestamp Injection**: Writing a history action log with a falsified timestamp in the past (`timestamp: "2010-01-01T00:00:00Z"`) to corrupt logs.
8. **Foreign Action Log Deletion**: Attempting to delete a historic action log belonging to a different user to clean audit footprints.
9. **History Key Tampering**: Attempting to update a history log's immutable action string after initial audit creation.

### D. Chat Intrusion & State Shortcutting
10. **Chat Dialogue Sniffing**: User `attacker_id` requesting list access on `/chats` without specifying their owner filter `uid == request.auth.uid`.
11. **Chat Session Overwrite**: Authenticated user trying to append models' answers (`role: "model"`) pretending to be the AI engine to bypass actual API costs and logic.
12. **Malicious Long String ID Injection**: Writing a chat session using a doc ID containing massive 1.5KB malicious SQL/script characters to cause Denial of Wallet resource fatigue.

---

## 3. Test Assertion Plan

We will formulate `firestore.rules` such that each of these attacks is guaranteed to yield `PERMISSION_DENIED`. The security architecture is structured with:
- `isValidId` and type check filters.
- `affectedKeys().hasOnly()` actions.
- Mandatory verified email clauses (`request.auth.token.email_verified == true`).
