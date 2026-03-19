interface RawIdea {
  title: string;
  targetCustomer: string;
  solution: string;
  marketPotential: string;
  basedOnComplaintIndexes: number[];
}

export function parseAiResponse(raw: string): RawIdea[] {
  let cleaned = raw.trim();
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }

  const parsed = JSON.parse(cleaned);

  if (!Array.isArray(parsed)) {
    throw new Error('응답이 배열이 아닙니다');
  }

  for (const item of parsed) {
    if (!item.title || !item.targetCustomer || !item.solution || !item.marketPotential) {
      throw new Error('필수 필드가 누락되었습니다');
    }
    if (!Array.isArray(item.basedOnComplaintIndexes)) {
      throw new Error('basedOnComplaintIndexes가 배열이 아닙니다');
    }
  }

  return parsed;
}
