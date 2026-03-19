import { parseAiResponse } from '../aiParser';

describe('parseAiResponse', () => {
  it('parses valid JSON array', () => {
    const raw = JSON.stringify([
      { title: 'T', targetCustomer: 'C', solution: 'S', marketPotential: 'M', basedOnComplaintIndexes: [0] },
    ]);
    const result = parseAiResponse(raw);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('T');
  });

  it('extracts JSON from markdown code block', () => {
    const raw = '```json\n[{"title":"T","targetCustomer":"C","solution":"S","marketPotential":"M","basedOnComplaintIndexes":[0]}]\n```';
    const result = parseAiResponse(raw);
    expect(result).toHaveLength(1);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseAiResponse('not json')).toThrow();
  });

  it('throws on wrong structure', () => {
    expect(() => parseAiResponse('[{"wrong": "field"}]')).toThrow();
  });
});
