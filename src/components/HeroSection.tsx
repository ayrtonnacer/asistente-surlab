import { useState } from "react";
import { Send } from "lucide-react";

const HeroSection = () => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      console.log("Message sent:", message);
      setMessage("");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-radial-gradient" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 animate-pulse-slow" />
      
      {/* Floating Dots Decoration */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-primary/40 animate-float" style={{ animationDelay: "0s" }} />
      <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-primary/30 animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-primary/50 animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 right-1/4 w-1 h-1 rounded-full bg-primary/40 animate-float" style={{ animationDelay: "3s" }} />
      <div className="absolute bottom-1/4 right-1/2 w-1.5 h-1.5 rounded-full bg-primary/30 animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Title */}
          <h1 
            className="text-4xl md:text-5xl lg:text-7xl font-light text-foreground leading-tight mb-6 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Integramos personas
            <br />
            <span className="font-normal">y tecnología</span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            Creamos soluciones que generan impacto real en los negocios.
          </p>

          {/* Chat Input */}
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

export default HeroSection;
