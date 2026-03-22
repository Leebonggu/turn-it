import { Complaint } from '../types';
import { parseAiResponse } from '../utils/aiParser';
import { addIdeas } from './firestore';

const API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const MAX_RETRIES = 3;

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

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(prompt: string): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const res = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (res.status === 429) {
      const retryAfter = Math.min(Math.pow(2, attempt) * 1000, 30000);
      if (attempt < MAX_RETRIES - 1) {
        await sleep(retryAfter);
        continue;
      }
      throw new Error('API 요청 한도를 초과했어요. 잠시 후 다시 시도해주세요.');
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      if (attempt < MAX_RETRIES - 1) {
        await sleep(Math.pow(2, attempt) * 1000);
        continue;
      }
      throw new Error(`AI API 오류 (${res.status}). 잠시 후 다시 시도해주세요.`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }
  throw new Error('AI 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
}

export async function generateIdeas(
  userId: string,
  cycleId: string,
  complaints: Complaint[],
): Promise<void> {
  if (complaints.length === 0) {
    throw new Error('기록이 없어서 아이디어를 생성할 수 없어요.');
  }

  const prompt = buildPrompt(complaints);
  let ideas: ReturnType<typeof parseAiResponse>;

  for (let attempt = 0; attempt < 2; attempt++) {
    const rawResponse = await callGemini(prompt);
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
