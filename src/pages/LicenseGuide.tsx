import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, CheckCircle2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useApp } from "@/context/AppContext";
import { getLicenseGuide } from "@/data/licenseGuide";

export default function LicenseGuide() {
  const navigate = useNavigate();
  const { language } = useApp();
  const guide = useMemo(() => getLicenseGuide(language), [language]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [category, setCategory] = useState<string>(guide.categories[0]?.key ?? "beginner");

  useEffect(() => {
    if (!guide.categories.find((item) => item.key === category)) {
      setCategory(guide.categories[0]?.key ?? "beginner");
    }
  }, [guide, category]);

  return (
    <div className="min-h-screen bg-background pb-10" dir={guide.direction}>
      <header className="p-4 flex items-center gap-3 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{guide.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{guide.homeSubtitle}</p>
        </div>
      </header>

      <main className="p-6 space-y-6">
        <Card className="p-4 bg-muted/40 border-border">
          <div className="flex items-start gap-3 rtl-row">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-card-foreground">{guide.sectionTitles.checklist}</h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {guide.needsChecklist.map((item) => (
                  <Toggle
                    key={item}
                    variant="outline"
                    pressed={!!checked[item]}
                    onPressedChange={(pressed) => setChecked((prev) => ({ ...prev, [item]: pressed }))}
                    className="rounded-full text-xs sm:text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{item}</span>
                  </Toggle>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{guide.sectionTitles.steps}</h2>
          <Accordion type="single" collapsible className="space-y-3">
            {guide.steps.map((step, index) => (
              <AccordionItem
                key={step.id}
                value={step.id}
                className="border rounded-2xl bg-card shadow-sm px-[calc(1rem*var(--lang-pad))]"
              >
                <AccordionTrigger className="no-underline hover:no-underline">
                  <div className="flex items-start gap-3 rtl-row w-full">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-card-foreground">{step.title}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <span className="font-semibold text-foreground">{guide.labels.whatYouDo}:</span>{" "}
                      {step.whatYouDo}
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">{guide.labels.where}:</span> {step.where}
                    </p>
                    <p>
                      <span className="font-semibold text-foreground">{guide.labels.whatYouNeed}:</span>{" "}
                      {step.whatYouNeed}
                    </p>
                    {step.tip ? <p className="text-xs text-muted-foreground">{step.tip}</p> : null}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{guide.sectionTitles.categories}</h2>
          <ToggleGroup
            type="single"
            value={category}
            onValueChange={(value) => value && setCategory(value)}
            className="flex flex-wrap gap-2 justify-start"
          >
            {guide.categories.map((item) => (
              <ToggleGroupItem key={item.key} value={item.key} variant="outline" className="rounded-full text-xs sm:text-sm">
                {item.title}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <div className="text-sm text-muted-foreground">
            {guide.categories.find((item) => item.key === category)?.shortDesc}
          </div>
          <div className="text-xs text-muted-foreground">{guide.categoryNote}</div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{guide.sectionTitles.fees}</h2>
          <Card className="p-4 border-border">
            <div className="flex items-start gap-3 rtl-row">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">{guide.feeLabels.packageFee}:</span>{" "}
                  {guide.fees.packageFee} SAR
                </p>
                <p>
                  <span className="font-semibold text-foreground">{guide.feeLabels.theoryRetest}:</span>{" "}
                  {guide.fees.theoryRetestFee} SAR
                </p>
                <p className="text-xs">{guide.fees.feeNote}</p>
              </div>
            </div>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">{guide.sectionTitles.qna}</h2>
          <Accordion type="multiple" className="space-y-3">
            {guide.qna.map((item, index) => (
              <AccordionItem
                key={`qna-${index}`}
                value={`qna-${index}`}
                className="border rounded-2xl bg-card shadow-sm px-[calc(1rem*var(--lang-pad))]"
              >
                <AccordionTrigger className="no-underline hover:no-underline text-left">
                  <span className="font-medium text-card-foreground">{item.q}</span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <p className="text-sm text-muted-foreground">{item.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">{guide.sectionTitles.mistakes}</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {guide.mistakes.map((item, index) => (
              <li key={`mistake-${index}`}>{item}</li>
            ))}
          </ul>
        </section>

        <p className="text-xs text-muted-foreground">{guide.disclaimer}</p>
      </main>
    </div>
  );
}
