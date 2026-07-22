import { describe, expect, it } from 'vitest';
import { getPlanReference } from '../../utils/planReferenceUtils';

describe('planReferenceUtils', () => {
  it('creates stable distinct references for plans with the same description', () => {
    expect(getPlanReference('plan-a')).toBe(getPlanReference('plan-a'));
    expect(getPlanReference('plan-a')).not.toBe(getPlanReference('plan-b'));
  });
});
