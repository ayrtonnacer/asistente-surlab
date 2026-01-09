import Header from "@/components/Header";
import ChatInterface from "@/components/ChatInterface";
import InfoCards from "@/components/InfoCards";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <ChatInterface />
        <InfoCards />
      </main>
    </div>
  );
};

export default Index;
