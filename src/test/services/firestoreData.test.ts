import { describe, expect, it } from 'vitest';
import { removeUndefinedFields } from '../../services/firestoreData';

describe('removeUndefinedFields', () => {
  it('removes only undefined values from a flat Firestore document', () => {
    expect(removeUndefinedFields({
      missing: undefined,
      nullable: null,
      zero: 0,
      empty: '',
      disabled: false,
      items: [],
    })).toEqual({
      nullable: null,
      zero: 0,
      empty: '',
      disabled: false,
      items: [],
    });
  });
});
