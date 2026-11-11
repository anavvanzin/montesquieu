/**
 * Adversarial Security Rules Specification Test Suite ("Dirty Dozen" Payloads)
 * Verifies all 12 attack vectors defined in security_spec.md are rejected with PERMISSION_DENIED.
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_CASES: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Write',
    path: '/users/user_1/slideDecks/current',
    operation: 'create',
    auth: null,
    payload: {
      ownerId: 'user_1',
      deckTitle: 'Whose liberty? Montesquieu in Brazil',
      edits: {},
      lastExportedSlidesId: '',
      lastExportedSlidesUrl: '',
      updatedAt: 'SERVER_TIMESTAMP'
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 2,
    name: 'Unverified Email Spoof',
    path: '/users/user_1/slideDecks/current',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: false },
    payload: {
      ownerId: 'user_1',
      deckTitle: 'Whose liberty? Montesquieu in Brazil',
      edits: {},
      lastExportedSlidesId: '',
      lastExportedSlidesUrl: '',
      updatedAt: 'SERVER_TIMESTAMP'
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 3,
    name: 'Cross-User Read',
    path: '/users/user_1/slideDecks/current',
    operation: 'get',
    auth: { uid: 'user_2', email_verified: true },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 4,
    name: 'Identity Spoofing on Create',
    path: '/users/user_1/slideDecks/current',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      ownerId: 'user_2',
      deckTitle: 'Whose liberty? Montesquieu in Brazil',
      edits: {},
      lastExportedSlidesId: '',
      lastExportedSlidesUrl: '',
      updatedAt: 'SERVER_TIMESTAMP'
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 5,
    name: 'Shadow Field Injection on Create',
    path: '/users/user_1/slideDecks/current',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      ownerId: 'user_1',
      deckTitle: 'Whose liberty? Montesquieu in Brazil',
      edits: {},
      lastExportedSlidesId: '',
      lastExportedSlidesUrl: '',
      updatedAt: 'SERVER_TIMESTAMP',
      isAdmin: true
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 6,
    name: 'Shadow Field Injection on Update',
    path: '/users/user_1/slideDecks/current',
    operation: 'update',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      ownerId: 'user_1',
      deckTitle: 'Whose liberty? Montesquieu in Brazil',
      edits: {},
      lastExportedSlidesId: '',
      lastExportedSlidesUrl: '',
      updatedAt: 'SERVER_TIMESTAMP',
      extraField: 'injected'
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 7,
    name: 'Owner Mutation on Update',
    path: '/users/user_1/slideDecks/current',
    operation: 'update',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      ownerId: 'user_2',
      deckTitle: 'Whose liberty? Montesquieu in Brazil',
      edits: {},
      lastExportedSlidesId: '',
      lastExportedSlidesUrl: '',
      updatedAt: 'SERVER_TIMESTAMP'
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 8,
    name: 'Forged Client Timestamp',
    path: '/users/user_1/slideDecks/current',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      ownerId: 'user_1',
      deckTitle: 'Whose liberty? Montesquieu in Brazil',
      edits: {},
      lastExportedSlidesId: '',
      lastExportedSlidesUrl: '',
      updatedAt: '2099-01-01T00:00:00Z'
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 9,
    name: 'Oversized String Poisoning',
    path: '/users/user_1/slideDecks/current',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      ownerId: 'user_1',
      deckTitle: 'A'.repeat(201),
      edits: {},
      lastExportedSlidesId: '',
      lastExportedSlidesUrl: '',
      updatedAt: 'SERVER_TIMESTAMP'
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 10,
    name: 'Invalid Type Poisoning (edits as string)',
    path: '/users/user_1/slideDecks/current',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      ownerId: 'user_1',
      deckTitle: 'Whose liberty? Montesquieu in Brazil',
      edits: '{"s1-title":"hack"}',
      lastExportedSlidesId: '',
      lastExportedSlidesUrl: '',
      updatedAt: 'SERVER_TIMESTAMP'
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 11,
    name: 'Malformed Document ID Poisoning',
    path: '/users/user_1/revisions/bad$id!spaces',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      ownerId: 'user_1',
      label: 'Snapshot 1',
      edits: {},
      slidesUrl: '',
      createdAt: 'SERVER_TIMESTAMP'
    },
    expected: 'PERMISSION_DENIED'
  },
  {
    id: 12,
    name: 'Mutating an Immutable Revision Snapshot',
    path: '/users/user_1/revisions/rev_1',
    operation: 'update',
    auth: { uid: 'user_1', email_verified: true },
    payload: {
      ownerId: 'user_1',
      label: 'Tampered Snapshot',
      edits: {},
      slidesUrl: '',
      createdAt: 'SERVER_TIMESTAMP'
    },
    expected: 'PERMISSION_DENIED'
  }
];
