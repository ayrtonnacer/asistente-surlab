import { ArrowRight } from "lucide-react";

interface InfoCard {
  title: string;
  description: string;
  href: string;
}

const InfoCards = () => {
  const cards: InfoCard[] = [
    {
      title: "Sobre SurLab",
      description: "Laboratorio de innovación política con base en Córdoba y proyección en América Latina y el Caribe.",
      href: "#sobre",
    },
    {
      title: "Nuestras Áreas",
      description: "Doce áreas de trabajo que articulan el sector público, privado, academia y organismos internacionales.",
      href: "#areas",
    },
    {
      title: "Agenda una reunión",
      description: "Conectá con nuestro equipo para explorar oportunidades de colaboración e innovación.",
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
              className="group relative p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
            >
              <h3 className="text-foreground font-semibold mb-2">{card.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{card.description}</p>
              <div className="flex items-center gap-2 text-primary text-sm font-medium">
                Explorar
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InfoCards;
