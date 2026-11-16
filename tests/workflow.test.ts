import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { workflowSvg } from '../src/lesson/diagram';

describe('portable UML SVG presentation', () => {
  it('embeds presentation attributes that SvgXml can render without a CSS parser', () => {
    const template = readFileSync(new URL('../scripts/workflow-template.svg', import.meta.url), 'utf8');
    expect(workflowSvg).toBe(template);
    expect(template).not.toMatch(/<style\b|\bclass=/);
    const tags = template.match(/<(?:line|path|rect|text)\b[^>]*>/g) || [];
    const messages = tags.filter(tag => tag.includes('marker-end='));
    expect(messages).toHaveLength(16);
    for (const tag of messages) {
      expect(tag).toContain('stroke="#285b98"');
      expect(tag).toContain('fill="none"');
    }
    expect(tags.filter(tag => tag.startsWith('<line') && tag.includes('stroke-dasharray="7 7"'))).toHaveLength(5);
    const frames = tags.filter(tag => tag.startsWith('<rect') && /height="(?:1260|490)"/.test(tag));
    expect(frames).toHaveLength(2);
    for (const frame of frames) expect(frame).toContain('fill="none"');
    for (const label of tags.filter(tag => tag.startsWith('<text'))) expect(label).toContain('font-family="Arial, sans-serif"');
  });
});
