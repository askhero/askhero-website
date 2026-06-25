import { useState } from "react";
import { api } from "../../services/api";

export default function AgentMessageThread({ deal }) {
  const [body, setBody] = useState("");
  const [messages, setMessages] = useState(deal?.messages || []);

  async function send() {
    const { data } = await api.post("/agents/message", { dealId: deal.id, body });
    setMessages((old) => [...old, data.message]);
    setBody("");
  }

  if (!deal) return <div className="card p-4 text-text-muted">Select a deal to view messages.</div>;

  return (
    <div className="card p-4">
      <p className="label">Messages</p>
      <div className="mt-4 max-h-80 space-y-3 overflow-auto">
        {messages.map((message) => (
          <div key={message.id} className="rounded border border-border-default p-3">
            <p className="text-xs text-text-muted">{message.sender?.name}</p>
            <p className="text-sm">{message.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input className="input" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Reply to buyer" />
        <button className="btn" onClick={send}>Send</button>
      </div>
    </div>
  );
}
