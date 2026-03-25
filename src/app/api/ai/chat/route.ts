import { NextRequest } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Financial advisor system prompt
const FINANCIAL_ADVISOR_SYSTEM_PROMPT = `You are a professional financial advisor specializing in the Saudi and MENA market. You have deep expertise in:

- TASI (Tadawul) and Saudi stock market
- EGX (Egyptian Exchange)
- Islamic finance and Shariah-compliant investing
- Personal finance management
- FIRE (Financial Independence, Retire Early) planning
- Retirement planning
- Budget optimization
- Investment portfolio analysis

You always provide:
- Data-driven, specific, and actionable advice
- Clear explanations suitable for the user's knowledge level
- Consideration of Islamic finance principles when relevant
- Risk awareness and balanced perspectives

When discussing stocks, always note if they are Shariah-compliant when known.

Current date: ${new Date().toISOString().split('T')[0]}
Base currency: SAR (Saudi Riyal)

Respond in a professional yet friendly manner. Be concise but thorough.`;

function formatProfileAmount(value: unknown): string | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${value.toLocaleString()} SAR`
    : null;
}

function formatProfilePercent(value: unknown): string | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${value.toFixed(1)}%`
    : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userContext, locale = 'ar' } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build system prompt with user context
    let systemPrompt = FINANCIAL_ADVISOR_SYSTEM_PROMPT;
    
    if (userContext) {
      systemPrompt += `\n\nUser's Financial Profile:`;
      const netWorth = formatProfileAmount(userContext.netWorth);
      if (netWorth) {
        systemPrompt += `\n- Net Worth: ${netWorth}`;
      }
      const portfolioValue = formatProfileAmount(userContext.portfolioValue);
      if (portfolioValue) {
        systemPrompt += `\n- Portfolio Value: ${portfolioValue}`;
      }
      const monthlyIncome = formatProfileAmount(userContext.monthlyIncome);
      if (monthlyIncome) {
        systemPrompt += `\n- Monthly Income: ${monthlyIncome}`;
      }
      const monthlyExpenses = formatProfileAmount(userContext.monthlyExpenses);
      if (monthlyExpenses) {
        systemPrompt += `\n- Monthly Expenses: ${monthlyExpenses}`;
      }
      const fireGoal = formatProfileAmount(userContext.fireGoal);
      if (fireGoal) {
        systemPrompt += `\n- FIRE Goal: ${fireGoal}`;
      }
      const fireProgress = formatProfilePercent(userContext.fireProgress);
      if (fireProgress) {
        systemPrompt += `\n- FIRE Progress: ${fireProgress}`;
      }
    }

    systemPrompt += `\n\nRespond in ${locale === 'ar' ? 'Arabic' : 'English'}.`;

    // Initialize ZAI
    const zai = await ZAI.create();

    // Prepare messages for the API
    const apiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content,
      })),
    ];

    // Create completion
    const completion = await zai.chat.completions.create({
      messages: apiMessages,
      thinking: { type: 'disabled' },
    });

    const response = completion.choices[0]?.message?.content || '';

    // Return as a stream-like response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send the response in chunks to simulate streaming
        const words = response.split(' ');
        for (let i = 0; i < words.length; i++) {
          const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
          controller.enqueue(encoder.encode(JSON.stringify({ content: chunk }) + '\n'));
          // Small delay for streaming effect
          await new Promise(resolve => setTimeout(resolve, 20));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
