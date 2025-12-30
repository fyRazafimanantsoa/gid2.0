import { describe, it, expect } from 'vitest';
import { TEMPLATES } from '../utils/templates';

describe('Templates content', () => {
  it('contains code space template with a code block', () => {
    const tpl = TEMPLATES['tpl:code_space'];
    expect(tpl).toBeDefined();
    const hasCode = tpl.blocks.some(b => b.type === 'code');
    expect(hasCode).toBe(true);
  });
});
