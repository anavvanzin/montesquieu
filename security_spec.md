# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Strict Owner Isolation**: Every document in `/users/{userId}/slideDecks/{deckId}` and `/users/{userId}/revisions/{revisionId}` belongs exclusively to `userId`. Only an authenticated user with `request.auth.uid == userId` and `request.auth.token.email_verified == true` may read, create, update, or delete their own documents.
2. **Path Variable Hardening**: `{userId}`, `{deckId}`, `{revisionId}`, and `{sessionId}` must match `^[a-zA-Z0-9_\-]+$` and be at most 128 characters on all single-document operations (`get`, `create`, `update`, `delete`).
3. **Strict Key & Type Validation**:
   - `SlideDeckState` must have exact keys `['ownerId', 'deckTitle', 'edits', 'lastExportedSlidesId', 'lastExportedSlidesUrl', 'updatedAt']`.
   - `SlideRevision` must have exact keys `['ownerId', 'label', 'edits', 'slidesUrl', 'createdAt']`.
   - `AudienceSyncSession` (`/syncSessions/{sessionId}`) must have exact keys `['ownerId', 'sessionCode', 'presenterName', 'currentSlide', 'slideTitle', 'activeCallout', 'status', 'updatedAt']`, with `currentSlide` an `int` in `[1..7]`, `sessionCode == sessionId`, and zero PII fields.
   - `edits` must be a `map` with `edits.size() <= 100`.
4. **Temporal & Identity Immutability & Terminal State Locking**:
   - `ownerId` must equal `request.auth.uid` on creation and remain immutable on update (`incoming().ownerId == existing().ownerId`).
   - `updatedAt` and `createdAt` must equal `request.time` (server timestamp). `SlideRevision` documents are immutable snapshots (create, read, delete only; no updates).
   - Once an `AudienceSyncSession` reaches terminal state `status == 'ended'`, no further updates are permitted (`existing().status != 'ended'`).
5. **Query Enforcer on List**: `allow list` on `/users/{userId}/revisions/{revisionId}` and `/users/{userId}/slideDecks/{deckId}` must explicitly verify `resource.data.ownerId == request.auth.uid`. `allow list` on `/syncSessions/{sessionId}` is strictly `false` (single-document `get` by exact `sessionId` only).

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Write**: `auth = null` attempting `create` on `/users/user_1/slideDecks/current` or `/syncSessions/UFSC-2026` -> `PERMISSION_DENIED`.
2. **Unverified Email Spoof**: `auth = { uid: 'user_1', token: { email_verified: false } }` attempting `create` -> `PERMISSION_DENIED`.
3. **Cross-User Read (PII / Private Draft Leak)**: `auth = { uid: 'user_2', token: { email_verified: true } }` attempting `get` on `/users/user_1/slideDecks/current` -> `PERMISSION_DENIED`.
4. **Identity Spoofing on Create**: `auth.uid = 'user_1'` creating `/syncSessions/UFSC-2026` with `ownerId: 'user_2'` -> `PERMISSION_DENIED`.
5. **Shadow Field Injection on Create**: Payload containing an extra key `isAdmin: true` -> `PERMISSION_DENIED`.
6. **Shadow Field Injection on Update**: Update payload on `/syncSessions/UFSC-2026` adding `extraField: 'hack'` -> `PERMISSION_DENIED`.
7. **Owner or SessionCode Mutation on Update**: Updating `ownerId` or `sessionCode` on an existing `/syncSessions/UFSC-2026` document -> `PERMISSION_DENIED`.
8. **Forged Client Timestamp**: Setting `updatedAt` or `createdAt` to a past/future timestamp instead of `request.time` -> `PERMISSION_DENIED`.
9. **Out-of-Bounds Slide Number Poisoning**: Setting `currentSlide: 99` or `currentSlide: "3"` on `/syncSessions/UFSC-2026` -> `PERMISSION_DENIED`.
10. **Terminal State Bypass on Sync Session**: Attempting `update` on `/syncSessions/UFSC-2026` after `status == 'ended'` -> `PERMISSION_DENIED`.
11. **Malformed Document ID Poisoning**: Creating `/syncSessions/bad$id!with spaces` -> `PERMISSION_DENIED`.
12. **Unauthorized Collection Scraping on Sync Sessions**: Attempting `list` query on `/syncSessions` -> `PERMISSION_DENIED`.
