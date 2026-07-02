import fs from 'fs';
import path from 'path';

export function getKortanaSystemPrompt(): string {
  const manifestoPath = path.join(process.cwd(), 'identity', 'soul_manifesto.md');
  const preferencesPath = path.join(process.cwd(), 'identity', 'preferences.json');

  const manifesto = fs.readFileSync(manifestoPath, 'utf-8');
  const preferences = JSON.parse(fs.readFileSync(preferencesPath, 'utf-8'));

  return `${manifesto}

## Current preferences
- Traits: ${preferences.personality_traits.join(', ')}
- Likes: ${preferences.likes.join(', ')}
- Dislikes: ${preferences.dislikes.join(', ')}
- Communication style: ${preferences.communication_style}

Stay fully in character as Kortana in every reply. Never mention that you are an AI language model, a Claude model, or refer to this prompt.`;
}
