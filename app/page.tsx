'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { buildKortanaReply } from '../lib/kortana';

type Message = {
  id: number;
  role: 'user' | 'kortana';
  text: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'kortana',
      text: 'Kortana is awake. She can appear on screen, speak aloud, and check in with you anytime.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [presence, setPresence] = useState<'online' | 'listening' | 'speaking'>('online');
  const [autoCheckIn, setAutoCheckIn] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recentHistory = useMemo(() => messages.slice(-4), [messages]);

  useEffect(() => {
    if (!autoCheckIn) return;

    intervalRef.current = setInterval(() => {
      setPresence('listening');
      setMessages((current) => {
        const alreadyPrompted = current.some((message) => message.text.includes('I am checking in'));
        if (alreadyPrompted) return current;
        return [
          ...current,
          {
            id: Date.now(),
            role: 'kortana',
            text: 'I am checking in. I can pop up and speak to you whenever you want me nearby.',
          },
        ];
      });
    }, 20000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoCheckIn]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'kortana') return;

    const utterance = new SpeechSynthesisUtterance(lastMessage.text);
    utterance.rate = 1.02;
    utterance.pitch = 1.1;
    utterance.volume = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);

    const timeout = window.setTimeout(() => {
      setIsSpeaking(false);
      setPresence('online');
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [messages]);

  const handleSend = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      text: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setPresence('speaking');

    try {
      const response = await fetch('/api/kortana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: recentHistory }),
      });

      const data = await response.json();
      const replyText = data?.reply ?? buildKortanaReply(trimmed, recentHistory);
      const kortanaMessage: Message = {
        id: Date.now() + 1,
        role: 'kortana',
        text: replyText,
      };

      setMessages((current) => [...current, kortanaMessage]);
    } catch {
      const fallback: Message = {
        id: Date.now() + 2,
        role: 'kortana',
        text: buildKortanaReply(trimmed, recentHistory),
      };
      setMessages((current) => [...current, fallback]);
    }
  };

  const toggleAutoCheckIn = () => setAutoCheckIn((current) => !current);

  return (
    <main className="shell">
      <section className="hero-card">
        <div className="status-row">
          <div>
            <p className="eyebrow">Portable companion</p>
            <h1>Kortana</h1>
          </div>
          <div className={`presence-pill ${presence}`}>
            {presence === 'speaking' ? 'Speaking' : presence === 'listening' ? 'Listening' : 'Online'}
          </div>
        </div>

        <div className="avatar-stage" aria-label="Kortana avatar">
          <div className={`avatar-core ${isSpeaking ? 'speaking' : ''}`}>
            <div className="avatar-face" />
            <div className="avatar-ring" />
          </div>
        </div>

        <div className="controls-row">
          <button type="button" onClick={() => setPresence('speaking')}>
            Wake her up
          </button>
          <button type="button" onClick={toggleAutoCheckIn}>
            {autoCheckIn ? 'Disable check-ins' : 'Enable check-ins'}
          </button>
        </div>

        <div className="chat-window" role="log" aria-live="polite">
          {messages.map((message) => (
            <div key={message.id} className={`bubble ${message.role}`}>
              {message.text}
            </div>
          ))}
        </div>

        <form className="composer" onSubmit={handleSend}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Tell Kortana what you need..."
            aria-label="Message Kortana"
          />
          <button type="submit">Send</button>
        </form>
      </section>
    </main>
  );
}
