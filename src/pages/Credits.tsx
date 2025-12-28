import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Credits() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 flex items-center gap-3 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 rtl-flip" />
        </Button>
        <h1 className="text-xl font-bold">{t("credits.title")}</h1>
      </header>

      <main className="p-6 space-y-4 text-sm leading-relaxed text-foreground">
        <h2 className="text-base font-semibold">{t("credits.signsTitle")}</h2>
        <p>{t("credits.signsLine1")}</p>
        <p>{t("credits.signsLine2")}</p>
        <p>{t("credits.sourceLabel")}</p>
        <p>{t("credits.sourceName")}</p>
        <p>https://commons.wikimedia.org</p>
        <p>{t("credits.signsLine3")}</p>
        <p>{t("credits.signsLine4")}</p>
        <p>{t("credits.disclaimerLabel")}</p>
        <p>{t("credits.disclaimerBody")}</p>
      </main>
    </div>
  );
}
