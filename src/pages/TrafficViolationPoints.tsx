import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TrafficViolationPoints() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const violations = [
    { key: "violations.v01", points: 24 },
    { key: "violations.v02", points: 24 },
    { key: "violations.v03", points: 12 },
    { key: "violations.v04", points: 12 },
    { key: "violations.v05", points: 8 },
    { key: "violations.v06", points: 8 },
    { key: "violations.v07", points: 8 },
    { key: "violations.v08", points: 6 },
    { key: "violations.v09", points: 6 },
    { key: "violations.v10", points: 6 },
    { key: "violations.v11", points: 6 },
    { key: "violations.v12", points: 6 },
    { key: "violations.v13", points: 6 },
    { key: "violations.v14", points: 4 },
    { key: "violations.v15", points: 4 },
    { key: "violations.v16", points: 4 },
    { key: "violations.v17", points: 4 },
    { key: "violations.v18", points: 4 },
    { key: "violations.v19", points: 2 },
    { key: "violations.v20", points: 2 },
    { key: "violations.v21", points: 2 },
  ];
  const penalties = [
    "violationPoints.penalties.first",
    "violationPoints.penalties.second",
    "violationPoints.penalties.third",
    "violationPoints.penalties.fourth",
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 flex items-center gap-3 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">{t("violationPoints.title")}</h1>
      </header>

      <main className="p-6 space-y-4 text-sm leading-relaxed text-foreground">
        <p>{t("violationPoints.intro")}</p>

        <div>
          <p className="font-semibold">{t("violationPoints.impactTitle")}</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            {penalties.map((penaltyKey) => (
              <li key={penaltyKey}>{t(penaltyKey)}</li>
            ))}
          </ul>
        </div>

        <p>{t("violationPoints.closing")}</p>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-muted text-left">
                <th className="border px-3 py-2">{t("violationPoints.table.number")}</th>
                <th className="border px-3 py-2">{t("violationPoints.table.violation")}</th>
                <th className="border px-3 py-2">{t("violationPoints.table.points")}</th>
              </tr>
            </thead>
            <tbody>
              {violations.map((violation, index) => (
                <tr key={violation.key}>
                  <td className="border px-3 py-2">{index + 1}</td>
                  <td className="border px-3 py-2">{t(violation.key)}</td>
                  <td className="border px-3 py-2">{violation.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">
          {t("disclaimer.educationalGovernment")}
        </p>
      </main>
    </div>
  );
}
