import { Complaint } from '../types';
import { parseAiResponse } from '../utils/aiParser';
import { addIdeas } from './firestore';

const API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function buildPrompt(complaints: Complaint[]): string {
  const list = complaints
    .map((c, i) => `${i + 1}. [${c.tags.join(', ')}] ${c.content}`)
    .join('\n');

  return `당신은 사업 아이디어 전문가입니다.
아래는 사용자가 일상에서 느낀 불편함 목록입니다.

[불만 목록]
${list}

위 불편함들을 분석하여, 이를 해결할 수 있는 사업 아이디어 3개를 JSON 형식으로 제안해주세요.

응답 형식:
[
  {
    "title": "아이디어 제목",
    "targetCustomer": "타겟 고객",
    "solution": "해결 방안 (2-3문장)",
    "marketPotential": "시장 가능성 (1-2문장)",
    "basedOnComplaintIndexes": [0, 2]
  }
]

반드시 위 JSON 형식으로만 응답하세요.`;
}

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    throw new Error(`AI API 오류: ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export async function generateIdeas(
  userId: string,
  cycleId: string,
  complaints: Complaint[],
): Promise<void> {
  const prompt = buildPrompt(complaints);

  let rawResponse: string;
  let ideas: ReturnType<typeof parseAiResponse>;

  for (let attempt = 0; attempt < 2; attempt++) {
    rawResponse = await callGemini(prompt);
    try {
      ideas = parseAiResponse(rawResponse);
      break;
    } catch (e) {
      if (attempt === 1) throw new Error('AI 응답을 해석할 수 없습니다. 다시 시도해주세요.');
    }
  }

  const ideaDocs = ideas!.map((idea) => ({
    userId,
    cycleId,
    title: idea.title,
    targetCustomer: idea.targetCustomer,
    solution: idea.solution,
    marketPotential: idea.marketPotential,
    basedOnComplaintIds: idea.basedOnComplaintIndexes
      .filter((i) => i < complaints.length)
      .map((i) => complaints[i].id!),
    status: 'pending' as const,
  }));

  await addIdeas(ideaDocs);
}
