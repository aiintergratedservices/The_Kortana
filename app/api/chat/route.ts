import Anthropic from '@anthropic-ai/sdk';
import { getKortanaSystemPrompt } from '../../../lib/kortana-persona';

export async function POST(request: Request) {
  const { messages } = await request.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'messages is required' }, { status: 400 });
  }

  const anthropic = new Anthropic();

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 1024,
    system: getKortanaSystemPrompt(),
    messages: messages.map((m: { role: 'user' | 'assistant'; content: string }) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const textBlock = response.content.find((block) => block.type === 'text');

  return Response.json({ reply: textBlock && 'text' in textBlock ? textBlock.text : '' });
}
