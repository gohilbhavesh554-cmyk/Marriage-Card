# VOWORA Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants

1. **Global Default-Deny**: Any path not explicitly matched in `firestore.rules` is unconditionally denied (`allow read, write: if false;`).
2. **User Profile PII Isolation (`/users/{userId}`)**:
   - Contains user `email` (PII).
   - Only the authenticated owner (`request.auth.uid == userId` with verified email) can `get`, `create`, or `update` their own profile.
   - `list` and `delete` on `/users` are strictly prohibited to prevent user enumeration or PII scraping.
   - `uid`, `email`, and `createdAt` are immutable after creation.
3. **Wedding Project Ownership & Public Visibility (`/weddings/{weddingId}`)**:
   - `ownerId` must match `request.auth.uid` on creation and is strictly immutable on update.
   - Only verified authenticated owners can `create`, `update`, or `delete` their wedding project.
   - `get` and `list` are permitted if the requester is the authenticated owner (`resource.data.ownerId == request.auth.uid`) OR if the wedding is explicitly published (`resource.data.status == 'published'`).
4. **Relational Sync for Subcollections (`events`, `guests`, `rsvps`)**:
   - Every subcollection write validates the parent `/weddings/$(weddingId)` document using `get()` or `exists()`.
   - `events` and `guests` writes require the authenticated user to be the owner of the parent wedding (`get(.../weddings/$(weddingId)).data.ownerId == request.auth.uid`).
   - `guests` and `rsvps` contain guest contact information (PII) and are strictly readable (`get`, `list`) ONLY by the wedding owner (`resource.data.ownerId == request.auth.uid` or `resource.data.weddingOwnerId == request.auth.uid`).
   - `rsvps` creation is allowed on published weddings (`get(.../weddings/$(weddingId)).data.status == 'published'`) with strict schema, field-size, and timestamp (`submittedAt == request.time`) validation, and `weddingOwnerId` must match the parent wedding's `ownerId`.
5. **Temporal Integrity**:
   - Every `create` enforces `createdAt == request.time` (or `submittedAt == request.time` for RSVPs).
   - Every `update` enforces `updatedAt == request.time` and preserves `createdAt == resource.data.createdAt`.

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 (Identity Spoofing on Wedding Create)**: Authenticated user `user_A` attempts to create `/weddings/wed_1` with `ownerId: "user_B"`. -> `PERMISSION_DENIED`
2. **Payload 2 (Shadow Field Injection on User Profile)**: Authenticated user `user_A` creates `/users/user_A` with an undeclared field `isAdmin: true`. -> `PERMISSION_DENIED`
3. **Payload 3 (Unverified Email Write)**: Authenticated user with `email_verified: false` attempts to create a wedding project. -> `PERMISSION_DENIED`
4. **Payload 4 (PII Leak via User Read)**: Authenticated user `user_B` attempts `get` on `/users/user_A`. -> `PERMISSION_DENIED`
5. **Payload 5 (Guest List PII Scraping)**: Unauthenticated visitor or `user_B` attempts `list` on `/weddings/wed_1/guests`. -> `PERMISSION_DENIED`
6. **Payload 6 (RSVP PII Scraping)**: Public visitor attempts `get` or `list` on `/weddings/wed_1/rsvps` after submitting an RSVP. -> `PERMISSION_DENIED`
7. **Payload 7 (Orphaned Event Creation)**: User `user_A` attempts to create `/weddings/non_existent_wedding/events/evt_1`. -> `PERMISSION_DENIED`
8. **Payload 8 (Cross-Tenant Subcollection Write)**: User `user_B` attempts to add an event to `user_A`'s wedding `/weddings/wed_1/events/evt_2`. -> `PERMISSION_DENIED`
9. **Payload 9 (Immortal Field Mutation)**: Owner `user_A` attempts to update `ownerId` or `createdAt` on `/weddings/wed_1`. -> `PERMISSION_DENIED`
10. **Payload 10 (Value Poisoning / Oversized String)**: Visitor submits an RSVP to `/weddings/wed_1/rsvps/rsvp_1` with a 50,000-character `message` string or invalid `response: "hacked"`. -> `PERMISSION_DENIED`
11. **Payload 11 (Timestamp Forgery)**: User `user_A` creates `/weddings/wed_1` with a backdated client timestamp `createdAt` != `request.time`. -> `PERMISSION_DENIED`
12. **Payload 12 (Draft Wedding Public Read)**: Visitor attempts `get` on `/weddings/draft_wed_1` where `status == "draft"`. -> `PERMISSION_DENIED`
