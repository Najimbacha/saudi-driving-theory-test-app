import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrafficFinesPenalties() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 flex items-center gap-3 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">{t("trafficFines.title")}</h1>
      </header>

      <main className="p-6 space-y-4 text-sm leading-relaxed text-foreground">
        <p>{t("trafficFines.intro")}</p>

        <div>
          <p className="font-semibold">{t("trafficFines.categoriesTitle")}</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>{t("trafficFines.categories.minor")}</li>
            <li>{t("trafficFines.categories.moderate")}</li>
            <li>{t("trafficFines.categories.serious")}</li>
            <li>{t("trafficFines.categories.verySerious")}</li>
          </ul>
        </div>

        <p>{t("trafficFines.closing")}</p>

        <p className="text-xs text-muted-foreground">
          {t("disclaimer.educationalGovernment")}
        </p>
      </main>
    </div>
  );
}
