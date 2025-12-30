import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TrafficViolationPoints() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
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
  const consequences = [
    {
      step: t("violationPoints.consequences.first.step"),
      icon: "⏸",
      text: t("violationPoints.consequences.first.text"),
    },
    {
      step: t("violationPoints.consequences.second.step"),
      icon: "⏸",
      text: t("violationPoints.consequences.second.text"),
    },
    {
      step: t("violationPoints.consequences.third.step"),
      icon: "⏸",
      text: t("violationPoints.consequences.third.text"),
    },
    {
      step: t("violationPoints.consequences.fourth.step"),
      icon: "❌",
      text: t("violationPoints.consequences.fourth.text"),
    },
  ];

  const severityGroups = [
    {
      id: "severe",
      title: t("violationPoints.severeTitle"),
      color: "bg-warning",
      min: 12,
      max: 24,
    },
    {
      id: "major",
      title: t("violationPoints.majorTitle"),
      color: "bg-warning/40",
      min: 6,
      max: 8,
    },
    {
      id: "minor",
      title: t("violationPoints.minorTitle"),
      color: "bg-muted",
      min: 2,
      max: 4,
    },
  ];
  const getSeverityLabel = (groupId: string) => {
    if (groupId === "severe") return t("learn.severity.serious");
    if (groupId === "major") return t("learn.severity.moderate");
    return t("learn.severity.minor");
  };

  const focusId = new URLSearchParams(location.search).get('focus');
  const focusKey = focusId ? `violations.${focusId}` : null;
  const focusItem = focusKey ? violations.find(v => v.key === focusKey) : null;
  const focusGroup = focusItem
    ? severityGroups.find(group => focusItem.points >= group.min && focusItem.points <= group.max)?.id
    : null;

  const numberFormatter = new Intl.NumberFormat(i18n.language);

  const keyRules = [
    t("violationPoints.summaryLine1"),
    t("violationPoints.summaryLine2"),
    t("violationPoints.resetNote"),
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 flex items-center gap-3 border-b safe-top">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 rtl-flip" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold">
            {t("violationPoints.title")}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t("violationPoints.subtitle")}
          </p>
        </div>
      </header>

      <main className="p-4 sm:p-6 space-y-5 text-sm leading-relaxed text-foreground safe-bottom">
        <section className="space-y-3">
          <Tabs defaultValue={focusGroup ?? severityGroups[0].id}>
            <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-2 pb-3 bg-background/95 backdrop-blur">
              <h3 className="text-sm font-semibold text-card-foreground">{t("violationPoints.violationsTitle")}</h3>
              <TabsList className="mt-3 grid w-full grid-cols-3">
                <TabsTrigger value="severe">{t("violationPoints.severeTab")}</TabsTrigger>
                <TabsTrigger value="major">{t("violationPoints.majorTab")}</TabsTrigger>
                <TabsTrigger value="minor">{t("violationPoints.minorTab")}</TabsTrigger>
              </TabsList>
            </div>
            {severityGroups.map((group) => {
              const items = violations.filter(v => v.points >= group.min && v.points <= group.max);
              return (
                <TabsContent key={group.id} value={group.id} className="mt-3">
                  <div className="space-y-2">
                    {items.map((violation) => (
                      <div key={violation.key} className="bg-card rounded-xl border border-border px-3 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-card-foreground text-left break-words min-w-0">
                            {t(violation.key)}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            {t("learn.pointsBadge", { value: numberFormatter.format(violation.points) })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </section>

        <section className="bg-card rounded-2xl p-4 shadow-sm border border-border space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-card-foreground">
              {t("violationPoints.summaryTitle")}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {keyRules.map((rule) => (
                <span
                  key={rule}
                  className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                >
                  {rule}
                </span>
              ))}
            </div>
          </div>

          <div className="h-px bg-border/60" />

          <div>
            <h3 className="text-sm font-semibold text-card-foreground">
              {t("violationPoints.impactTitle")}
            </h3>
            <div className="mt-3 space-y-2">
              {consequences.map((item) => (
                <div key={item.step} className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-base">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground">{item.step}</p>
                      <p className="mt-1 text-sm font-semibold text-card-foreground break-words leading-snug">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <p className="text-xs text-muted-foreground">
          {t("violationPoints.educationalNote")}
        </p>
      </main>
    </div>
  );
}
