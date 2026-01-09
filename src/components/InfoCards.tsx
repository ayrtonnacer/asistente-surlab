import { ArrowRight } from "lucide-react";

interface InfoCard {
  title: string;
  description: string;
  href: string;
}

const InfoCards = () => {
  const cards: InfoCard[] = [
    {
      title: "Sobre Skall",
      description: "Descubre cómo creamos valor desde hace 26 años.",
      href: "#sobre",
    },
    {
      title: "Explora el Skt Lab",
      description: "Conoce el espacio de experimentación con IA.",
      href: "#lab",
    },
    {
      title: "Agenda una llamada",
      description: "Ponte en contacto con nuestro equipo.",
      href: "#contacto",
    },
  ];

  return (
    <section className="relative py-12 pb-24">
      <div className="container mx-auto px-6">
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.8s" }}
        >
          {cards.map((card, index) => (
            <a
              key={index}
              href={card.href}
              className="group relative bg-card/50 border border-border hover:border-primary/30 rounded-xl p-6 transition-all duration-300 hover:bg-card/80"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-foreground font-medium text-base mb-2 group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {card.description}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1" />
              </div>
              
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 rounded-xl bg-primary/5" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InfoCards;
