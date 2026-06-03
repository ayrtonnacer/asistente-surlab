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
        throw new Error("Error al conectar con SurLab AI");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      setMessages(prev => {
        const updated = [...prev, { role: "assistant" as const, content: "" }];
        console.log("Added empty assistant message, total:", updated.length);
        return updated;
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("Stream done. Final content:", assistantContent);
          break;
        }

        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;

        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            console.log("Received [DONE] signal");
            break;
          }

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
    <div className="relative flex-1 flex flex-col min-h-screen pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-radial-gradient" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col flex-1 container mx-auto px-6 max-w-4xl">

        {/* Hero Content - Only visible when no messages */}
        {!hasMessages && (
          <div className="flex flex-col items-center justify-center flex-1 text-center py-20 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8 animate-float">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-slow" />
              Laboratorio de Innovación Política
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Conocimiento
              <br />
              <span className="text-primary">estratégico</span> para América Latina
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-8">
              SurLab articula el sector público, privado, la academia y organismos internacionales para generar innovación con impacto regional.
            </p>
          </div>
        )}

        {/* Messages Area */}
        {hasMessages && (
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto py-6 space-y-6"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-4",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" ? (
                  <>
                    {/* Bot Avatar */}
                    <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-bold text-sm">S</span>
                    </div>
                    {/* Bot Message */}
                    <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3 text-foreground text-sm leading-relaxed">
                      {msg.content}
                    </div>
                  </>
                ) : (
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary/20 border border-primary/30 px-4 py-3 text-foreground text-sm leading-relaxed">
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
            {/* Loading indicator */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">S</span>
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
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
            className="absolute bottom-24 right-6 w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center hover:bg-primary/30 transition-colors"
          >
            <ArrowDown className="w-4 h-4 text-primary" />
          </button>
        )}

        {/* Input Area */}
        <div className="py-6">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 bg-card border border-border rounded-2xl focus-within:border-primary/50 transition-colors"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Consultá al asistente de SurLab..."
              disabled={isLoading}
              className="flex-1 bg-transparent px-6 py-5 text-foreground placeholder:text-muted-foreground focus:outline-none text-base disabled:opacity-50"
            />
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mr-4" />
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="mr-2 w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 text-primary" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
