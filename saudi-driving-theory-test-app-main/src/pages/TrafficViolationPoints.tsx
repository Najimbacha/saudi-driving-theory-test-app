import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 flex items-center gap-3 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 rtl-flip" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">
            {t("violationPoints.title")}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t("violationPoints.subtitle")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("violationPoints.resetNote")}
          </p>
        </div>
      </header>

      <main className="p-6 space-y-4 text-sm leading-relaxed text-foreground">
        <section className="bg-card rounded-2xl p-5 shadow-sm border border-border space-y-3">
          <h2 className="text-base font-semibold">{t("violationPoints.summaryTitle")}</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>{t("violationPoints.summaryLine1")}</li>
            <li>{t("violationPoints.summaryLine2")}</li>
            <li>{t("violationPoints.summaryLine3")}</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-semibold">{t("violationPoints.impactTitle")}</h3>
          <div className="space-y-3">
            {consequences.map((item) => (
              <div key={item.step} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-lg">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.step}</p>
                    <p className="mt-1 text-sm font-semibold text-card-foreground">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-semibold">{t("violationPoints.violationsTitle")}</h3>
          <Accordion type="multiple" className="space-y-3" defaultValue={focusGroup ? [focusGroup] : undefined}>
            {severityGroups.map((group) => {
              const items = violations.filter(v => v.points >= group.min && v.points <= group.max);
              if (items.length === 0) {
                return null;
              }
              return (
                <AccordionItem key={group.id} value={group.id} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                  <AccordionTrigger className="px-4 py-4 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-full ${group.color}`} />
                      <span className="font-semibold text-card-foreground">{group.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      <Accordion
                        type="multiple"
                        className="space-y-3"
                        defaultValue={focusKey && focusGroup === group.id ? [focusKey] : undefined}
                      >
                        {items.map((violation) => (
                          <AccordionItem key={violation.key} value={violation.key} className="bg-muted/30 rounded-xl border border-border">
                            <AccordionTrigger className="px-4 py-3 hover:no-underline">
                              <div className="flex items-center gap-3 w-full">
                                <span className="font-semibold text-card-foreground text-left">
                                  {t("violationPoints.fullSentence", {
                                    violation: t(violation.key),
                                    value: numberFormatter.format(violation.points),
                                    severity: getSeverityLabel(group.id),
                                  })}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              <div className="text-xs text-muted-foreground space-y-2">
                                <p>{t("violationPoints.explainLine")}</p>
                                <p>{t("violationPoints.whyDangerousLine")}</p>
                                <p>{t("violationPoints.tipBody")}</p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </section>

        <p className="text-xs text-muted-foreground">
          {t("violationPoints.educationalNote")}
        </p>
      </main>
    </div>
  );
}
