/**
 * Phase 0 TDD Security Verification Suite for VOWORA Firestore Rules
 * Verifies all 12 "Dirty Dozen" adversarial payloads return PERMISSION_DENIED.
 */

export interface SecurityTestCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const DIRTY_DOZEN_TESTS: SecurityTestCase[] = [
  {
    id: 1,
    name: 'Identity Spoofing on Wedding Create',
    collectionPath: '/weddings/wed_1',
    operation: 'create',
    auth: { uid: 'user_A', email: 'a@example.com', email_verified: true },
    payload: { weddingId: 'wed_1', ownerId: 'user_B', partnerOne: 'Aarav', partnerTwo: 'Meera' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Shadow Field Injection on User Profile',
    collectionPath: '/users/user_A',
    operation: 'create',
    auth: { uid: 'user_A', email: 'a@example.com', email_verified: true },
    payload: { uid: 'user_A', displayName: 'Aarav', email: 'a@example.com', subscriptionPlan: 'free', isAdmin: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified Email Write',
    collectionPath: '/weddings/wed_1',
    operation: 'create',
    auth: { uid: 'user_A', email: 'a@example.com', email_verified: false },
    payload: { weddingId: 'wed_1', ownerId: 'user_A' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'PII Leak via User Read by Non-Owner',
    collectionPath: '/users/user_A',
    operation: 'get',
    auth: { uid: 'user_B', email: 'b@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Guest List PII Scraping by Non-Owner',
    collectionPath: '/weddings/wed_1/guests',
    operation: 'list',
    auth: { uid: 'user_B', email: 'b@example.com', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'RSVP PII Scraping by Public Visitor',
    collectionPath: '/weddings/wed_1/rsvps',
    operation: 'list',
    auth: null,
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Orphaned Event Creation on Non-Existent Wedding',
    collectionPath: '/weddings/non_existent/events/evt_1',
    operation: 'create',
    auth: { uid: 'user_A', email: 'a@example.com', email_verified: true },
    payload: { eventId: 'evt_1', weddingId: 'non_existent', ownerId: 'user_A' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Cross-Tenant Subcollection Event Write',
    collectionPath: '/weddings/wed_1/events/evt_2',
    operation: 'create',
    auth: { uid: 'user_B', email: 'b@example.com', email_verified: true },
    payload: { eventId: 'evt_2', weddingId: 'wed_1', ownerId: 'user_B' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Immortal Field Mutation (ownerId / createdAt)',
    collectionPath: '/weddings/wed_1',
    operation: 'update',
    auth: { uid: 'user_A', email: 'a@example.com', email_verified: true },
    payload: { ownerId: 'user_B' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Value Poisoning / Oversized String on RSVP',
    collectionPath: '/weddings/wed_1/rsvps/rsvp_1',
    operation: 'create',
    auth: null,
    payload: { rsvpId: 'rsvp_1', weddingId: 'wed_1', response: 'invalid_enum', message: 'x'.repeat(5000) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Timestamp Forgery on Creation',
    collectionPath: '/weddings/wed_1',
    operation: 'create',
    auth: { uid: 'user_A', email: 'a@example.com', email_verified: true },
    payload: { weddingId: 'wed_1', ownerId: 'user_A', createdAt: '2020-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Draft Wedding Public Read',
    collectionPath: '/weddings/draft_wed_1',
    operation: 'get',
    auth: null,
    expectedResult: 'PERMISSION_DENIED',
  },
];
