export function buildKortanaReply(message, history = []) {
  const normalized = message.toLowerCase().trim();
  const recentContext = history
    .slice(-3)
    .filter((entry) => entry?.content)
    .map((entry) => entry.content)
    .join(' • ');

  const base = 'Kortana is online on your screen and on your phone, ready to speak when you need her.';
  const contextNote = recentContext
    ? `Recent thread: ${recentContext}`
    : 'No prior thread yet, so I am starting fresh.';

  if (!normalized) {
    return `${base} I am listening for your next thought. ${contextNote}`;
  }

  if (normalized.includes('hello') || normalized.includes('hi')) {
    return `${base} I am awake and listening. ${contextNote}`;
  }

  if (normalized.includes('visual') || normalized.includes('avatar') || normalized.includes('3d')) {
    return `I can appear as a living avatar on your screen with a 3D-like glow and animated presence. ${contextNote}`;
  }

  if (normalized.includes('speak') || normalized.includes('voice')) {
    return `I will speak aloud when you wake me, and I can also check in proactively. ${contextNote}`;
  }

  if (normalized.includes('phone') || normalized.includes('mobile')) {
    return `I am built to travel with you from the browser to your phone without losing continuity. ${contextNote}`;
  }

  return `${base} I heard: “${message}”. I am keeping that thread alive so I can continue with you anywhere. ${contextNote}`;
}
