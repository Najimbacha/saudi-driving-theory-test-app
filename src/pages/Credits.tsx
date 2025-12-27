import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Credits() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 flex items-center gap-3 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">Credits & Attribution</h1>
      </header>

      <main className="p-6 space-y-4 text-sm leading-relaxed text-foreground">
        <h2 className="text-base font-semibold">Traffic Sign Sources</h2>
        <p>Traffic sign images used in this application are sourced from Wikimedia Commons.</p>
        <p>The images are licensed under Creative Commons licenses and are used for educational purposes only.</p>
        <p>Source:</p>
        <p>Wikimedia Commons – Saudi Arabia Road Signs</p>
        <p>https://commons.wikimedia.org</p>
        <p>Individual images may be subject to their respective Creative Commons licenses as specified on Wikimedia Commons.</p>
        <p>No affiliation with any government authority is implied.</p>
        <p>Disclaimer:</p>
        <p>This application is not affiliated with any government entity and is intended for educational practice only.</p>
      </main>
    </div>
  );
}
