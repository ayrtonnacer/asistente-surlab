import { useState, useRef, useEffect } from "react";
import { Send, ArrowDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    }
  };

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
        throw new Error("Error al conectar con Fede");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

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

  const hasMessages = messages.length > 0;

  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-radial-gradient" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      {/* Content Container */}
      <div className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 pt-24 pb-8">
        
        {/* Hero Content - Only visible when no messages */}
        {!hasMessages && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
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
          </div>
        )}

        {/* Messages Area */}
        {hasMessages && (
          <div 
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto space-y-6 pb-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" ? (
                  <div className="flex gap-4 max-w-[85%]">
                    {/* Bot Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-semibold text-sm">
                      F
                    </div>
                    {/* Bot Message */}
                    <div className="bg-card border border-border rounded-2xl px-5 py-4">
                      <p className="text-foreground text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[75%] bg-muted/50 rounded-2xl px-5 py-3">
                    <p className="text-foreground text-sm md:text-base">{msg.content}</p>
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-4 max-w-[85%]">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-semibold text-sm">
                  F
                </div>
                <div className="bg-card border border-border rounded-2xl px-5 py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 p-3 bg-card border border-border rounded-full shadow-lg hover:bg-muted transition-colors"
          >
            <ArrowDown className="w-5 h-5 text-foreground" />
          </button>
        )}

        {/* Input Area */}
        <form 
          onSubmit={handleSubmit}
          className={cn(
            "mt-auto",
            !hasMessages && "opacity-0 animate-fade-in-up"
          )}
          style={!hasMessages ? { animationDelay: "0.6s" } : undefined}
        >
          <div className="relative">
            <div className="relative flex items-center bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 focus-within:border-primary/50 focus-within:glow-primary">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Cuéntale a Fede qué necesitas..."
                disabled={isLoading}
                className="flex-1 bg-transparent px-6 py-5 text-foreground placeholder:text-muted-foreground focus:outline-none text-base disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="m-2 p-4 bg-primary hover:bg-primary/90 rounded-xl text-primary-foreground transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ChatInterface;
