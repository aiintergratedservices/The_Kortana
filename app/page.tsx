import ChatWindow from './components/ChatWindow';

export default function Home() {
  return (
    <main>
      <h1>Welcome to Kortana</h1>
      <p>Your LLM Agent is online.</p>
      <ChatWindow />
    </main>
  );
}
