import { describe, it, expect } from 'vitest';
import { TEMPLATES } from '../utils/templates';

describe('Templates sanity', () => {
  it('has at least one template', () => {
    expect(Object.keys(TEMPLATES).length).toBeGreaterThan(0);
  });
});
