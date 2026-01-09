import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Globe, Menu, X } from "lucide-react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Servicios", hasDropdown: true },
    { label: "Industrias", hasDropdown: true },
    { label: "Insights", hasDropdown: true },
    { label: "Comunidad", hasDropdown: true },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-primary font-bold text-lg">S</span>
            </div>
            <span className="text-foreground font-semibold text-xl tracking-tight">
              skall
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                className="flex items-center gap-1 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
              >
                <span className="text-sm font-medium">{item.label}</span>
                {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="default"
              className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6"
            >
              Contáctanos
            </Button>
            <button className="hidden md:flex items-center gap-1 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors">
              <Globe className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  className="flex items-center justify-between px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
                </button>
              ))}
              <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                Contáctanos
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
