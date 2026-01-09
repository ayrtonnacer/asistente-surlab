import { useState, useRef, useEffect } from "react";
import { Send, X, Loader2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const ChatInterface = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    console.log("streamChat called with:", userMessage);
    console.log("CHAT_URL:", CHAT_URL);
    
    const userMsg: Message = { role: "user", content: userMessage };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);
    setInput("");

    try {
      console.log("Sending request to chat function...");
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });
      
      console.log("Response status:", response.status);

      if (!response.ok || !response.body) {
        throw new Error("Error al conectar con SAM");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      // Add empty assistant message
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1] = { role: "assistant", content: assistantContent };
                return newMsgs;
              });
            }
          } catch {
            // Incomplete JSON, wait for more data
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Lo siento, hubo un error. Por favor intenta de nuevo." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      streamChat(input.trim());
    }
  };

  const handleQuickStart = (message: string) => {
    setIsOpen(true);
    setTimeout(() => streamChat(message), 100);
  };

  // Hero input handler
  const handleHeroSubmit = (e: React.FormEvent, message: string) => {
    e.preventDefault();
    if (message.trim()) {
      setIsOpen(true);
      setTimeout(() => streamChat(message.trim()), 100);
    }
  };

  return (
    <>
      {/* Hero Chat Input */}
      <HeroInput onSubmit={handleHeroSubmit} />

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl h-[600px] bg-card border border-border rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">SAM</h3>
                  <p className="text-xs text-muted-foreground">Asistente virtual de Skall</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-primary/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    ¡Hola! Soy SAM, tu asistente de Skall. ¿En qué puedo ayudarte?
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-3 rounded-2xl",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  disabled={isLoading}
                  className="flex-1 bg-muted px-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-3 bg-primary hover:bg-primary/90 rounded-xl text-primary-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// Hero Input Component
const HeroInput = ({ onSubmit }: { onSubmit: (e: React.FormEvent, message: string) => void }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    onSubmit(e, message);
    setMessage("");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-radial-gradient" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 animate-pulse-slow" />
      
      {/* Floating Dots */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-primary/40 animate-float" style={{ animationDelay: "0s" }} />
      <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-primary/30 animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-primary/50 animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 right-1/4 w-1 h-1 rounded-full bg-primary/40 animate-float" style={{ animationDelay: "3s" }} />
      <div className="absolute bottom-1/4 right-1/2 w-1.5 h-1.5 rounded-full bg-primary/30 animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 
            className="text-4xl md:text-5xl lg:text-7xl font-light text-foreground leading-tight mb-6 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Integramos personas
            <br />
            <span className="font-normal">y tecnología</span>
          </h1>

          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            Creamos soluciones que generan impacto real en los negocios.
          </p>

          <form 
            onSubmit={handleSubmit}
            className="opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            <div className="relative max-w-2xl mx-auto">
              <div className="relative flex items-center bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 focus-within:border-primary/50 focus-within:glow-primary">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Cuéntale a SAM qué necesitas..."
                  className="flex-1 bg-transparent px-6 py-5 text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
                />
                <button
                  type="submit"
                  className="m-2 p-4 bg-primary hover:bg-primary/90 rounded-xl text-primary-foreground transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ChatInterface;
