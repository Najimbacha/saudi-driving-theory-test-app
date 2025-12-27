import { licenseGuideEn } from "./en";
import { licenseGuideAr } from "./ar";
import { licenseGuideUr } from "./ur";
import { licenseGuideHi } from "./hi";
import { licenseGuideBn } from "./bn";
import type { LanguageCode } from "@/i18n";
export { PACKAGE_FEE_SAR, THEORY_RETEST_FEE_SAR } from "./fees";

export type LicenseGuideContent = typeof licenseGuideEn;

const guides: Record<LanguageCode, LicenseGuideContent> = {
  en: licenseGuideEn,
  ar: licenseGuideAr,
  ur: licenseGuideUr,
  hi: licenseGuideHi,
  bn: licenseGuideBn,
};

export function getLicenseGuide(language: LanguageCode): LicenseGuideContent {
  return guides[language] ?? licenseGuideEn;
}
