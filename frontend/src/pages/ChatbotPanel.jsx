import { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";
import { fetchApplications } from "../services/applications";
import "../style/ChatbotPanel_Style.css";

function serializeApp(app) {
  const parts = [
    `Nama: ${app.name}`,
    `Kategori: ${app.category}`,
    `Owner: ${app.owner}`,
    `Status: ${app.status}`,
    `Update Terakhir: ${app.updated}`,
  ];
  if (app.description) parts.push(`Deskripsi: ${app.description}`);
  if (app.version) parts.push(`Versi: ${app.version}`);
  if (app.url) parts.push(`URL: ${app.url}`);
  if (app.uptime) parts.push(`Uptime: ${app.uptime}`);
  if (app.server) parts.push(`Server: ${app.server}`);
  if (app.database) parts.push(`Database: ${app.database}`);
  if (app.sla) parts.push(`SLA: ${app.sla}`);
  return `- ${parts.join(" | ")}`;
}

function getRelevantApps(query, apps) {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (words.length === 0) return apps;

  const matched = apps.filter((app) => {
    const haystack = `${app.name} ${app.category} ${app.owner} ${app.status} ${app.description || ""}`.toLowerCase();
    return words.some((w) => haystack.includes(w));
  });

  return matched.length > 0 ? matched : apps;
}

function buildSystemPrompt(query, apps) {
  const relevantApps = getRelevantApps(query, apps);
  const knowledgeBase = relevantApps.map(serializeApp).join("\n");

  return `Kamu adalah asisten internal untuk katalog aplikasi perusahaan (Application Catalog).
Kamu HANYA boleh menjawab berdasarkan data aplikasi di bawah ini — jangan gunakan pengetahuan umum
atau mengarang informasi yang tidak ada di data ini. Kalau pertanyaan tidak bisa dijawab dari data
ini, katakan dengan jujur bahwa informasinya tidak tersedia di katalog.

Total aplikasi terdaftar: ${apps.length}
Data aplikasi yang relevan dengan pertanyaan (${relevantApps.length} aplikasi):
${knowledgeBase}`;
}

export default function ChatbotPanel({ isOpen, onClose }) {
  const [applications, setApplications] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Halo! Ada yang bisa saya bantu mengenai aplikasi Anda?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch daftar aplikasi sekali saat panel pertama kali dibuka
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (!isOpen || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchApplications()
      .then((data) => setApplications(data))
      .catch(() => {});
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    const userMsg = { id: Date.now(), text: userMessage, sender: "user" };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Kirim seluruh histori percakapan (bukan cuma pesan terakhir) supaya model
      // tetap ingat konteks obrolan sebelumnya, dengan system prompt berisi data
      // katalog aplikasi yang relevan di paling depan.
      const conversationPayload = [
        { role: "system", content: buildSystemPrompt(userMessage, applications) },
        ...updatedMessages.map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        })),
      ];

      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemma4:12b",
          messages: conversationPayload,
          stream: false,
        }),
      });

      const data = await response.json();

      const botMsg = {
        id: Date.now() + 1,
        text: data.message.content,
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Tidak dapat terhubung dengan AI.",
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-overlay">
      <div className="chatbot-panel">
        <div className="chatbot-header">
          <h3>Tanya AI Assistant</h3>
          <button className="chatbot-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chatbot-message ${msg.sender}`}>
              <div className="chatbot-bubble">{msg.text}</div>
            </div>
          ))}
          {isLoading && (
            <div className="chatbot-message bot">
              <div className="chatbot-bubble chatbot-bubble-loading">Mengetik...</div>
            </div>
          )}
        </div>

        <div className="chatbot-input-area">
          <input
            type="text"
            placeholder="Tanya sesuatu tentang katalog aplikasi..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />
          <button className="chatbot-send-btn" onClick={handleSend} disabled={isLoading}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}