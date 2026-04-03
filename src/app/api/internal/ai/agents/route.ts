import { NextRequest, NextResponse } from 'next/server';

type NvidiaChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function POST(request: NextRequest) {
  const providedSecret = request.headers.get('x-agent-secret');
  const expectedSecret = process.env.AGENTS_SECRET_KEY;

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null) as
    | {
        prompt?: string;
        response_format?: 'json' | 'text';
        model?: string;
      }
    | null;

  const prompt = body?.prompt?.trim();
  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
  }

  const nvidiaApiKey = process.env.NVIDIA_API_KEY;
  const nvidiaBase = (process.env.NVIDIA_API_BASE || 'https://integrate.api.nvidia.com/v1').replace(/\/$/, '');
  const nvidiaModel = body?.model || process.env.NVIDIA_ADVISOR_MODEL || 'nvidia/llama-3.1-nemotron-ultra-253b-v1';

  if (!nvidiaApiKey) {
    return NextResponse.json({ error: 'NVIDIA_API_KEY is not configured.' }, { status: 503 });
  }

  const response = await fetch(`${nvidiaBase}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${nvidiaApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: nvidiaModel,
      temperature: 0.3,
      top_p: 0.9,
      max_tokens: 1800,
      messages: [
        {
          role: 'system',
          content:
            body?.response_format === 'json'
              ? 'You are an internal Wealix company operating agent. Return only valid JSON and no markdown fencing.'
              : 'You are an internal Wealix company operating agent. Be concise, actionable, and factual.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    }),
    cache: 'no-store'
  });

  const payload = await response.json().catch(() => null) as NvidiaChatResponse | null;
  if (!response.ok) {
    return NextResponse.json(
      { error: payload?.error?.message || `NVIDIA request failed with status ${response.status}` },
      { status: response.status }
    );
  }

  const content = payload?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    return NextResponse.json({ error: 'Empty NVIDIA response.' }, { status: 502 });
  }

  return NextResponse.json({ content });
}
