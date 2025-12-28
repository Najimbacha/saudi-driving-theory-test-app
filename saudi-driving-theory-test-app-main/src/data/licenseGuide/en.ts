import { PACKAGE_FEE_SAR, THEORY_RETEST_FEE_SAR } from "./fees";

export const licenseGuideEn = {
  direction: "ltr",
  title: "How to Apply for Driving License in KSA (Simple Guide)",
  homeSubtitle: "Simple steps from Absher booking to getting your license",
  cta: "Start",
  labels: {
    whatYouDo: "What you do",
    where: "Where",
    whatYouNeed: "What you need",
  },
  sectionTitles: {
    checklist: "What you need",
    steps: "Steps",
    categories: "Category level",
    fees: "Fees",
    qna: "Questions & Answers",
    mistakes: "Common mistakes",
  },
  feeLabels: {
    packageFee: "Package fee",
    theoryRetest: "Theory retest",
  },
  needsChecklist: [
    "Absher account",
    "Valid ID (Saudi ID or Iqama)",
    "Appointment SMS",
    "Personal photos (if required)",
    "Payment method",
    "Medical report (after final test)",
  ],
  categories: [
    {
      key: "beginner",
      title: "Beginner",
      shortDesc: "No driving experience. Full training package.",
    },
    {
      key: "intermediate",
      title: "Intermediate",
      shortDesc: "Some experience. Shorter training after assessment.",
    },
    {
      key: "advanced",
      title: "Advanced",
      shortDesc: "Good experience. Minimal training if you pass.",
    },
  ],
  categoryNote: "Steps stay the same. Training length can be different.",
  fees: {
    packageFee: PACKAGE_FEE_SAR,
    theoryRetestFee: THEORY_RETEST_FEE_SAR,
    feeNote: "Fees may differ by school.",
  },
  steps: [
    {
      id: "s1",
      title: "Book in Absher",
      whatYouDo: "Book a driving license appointment and get the SMS.",
      where: "Absher",
      whatYouNeed: "Absher account and valid ID",
      tip: "Keep the SMS for the school.",
    },
    {
      id: "s2",
      title: "Go to the school",
      whatYouDo: "Visit the driving school on your appointment day.",
      where: "Driving school",
      whatYouNeed: "Appointment SMS and ID",
      tip: "Arrive early for the first check.",
    },
    {
      id: "s3",
      title: "Initial assessment",
      whatYouDo: "The school checks your level and assigns a category.",
      where: "Driving school",
      whatYouNeed: "Basic driving info",
      tip: "Be honest about your experience.",
    },
    {
      id: "s4",
      title: "Pay the package",
      whatYouDo: "If you pass the assessment, pay the package fee.",
      where: "Driving school",
      whatYouNeed: "Payment method",
      tip: "Ask the school about available packages.",
    },
    {
      id: "s5",
      title: "Attend classes",
      whatYouDo: "Attend required classes and training sessions.",
      where: "Driving school",
      whatYouNeed: "Attendance",
      tip: "Don’t miss sessions.",
    },
    {
      id: "s6",
      title: "Theory test",
      whatYouDo: "Take the theory test.",
      where: "Driving school",
      whatYouNeed: "Study practice questions",
      tip: "If you fail, you pay a retest fee and try again.",
    },
    {
      id: "s7",
      title: "Driving lessons",
      whatYouDo: "Start hands-on driving lessons after passing theory.",
      where: "Driving school",
      whatYouNeed: "Instructor schedule",
      tip: "Practice safety and signs.",
    },
    {
      id: "s8",
      title: "Final road test",
      whatYouDo: "Take the final driving test.",
      where: "Driving school / test area",
      whatYouNeed: "Completed training",
      tip: "Stay calm and follow rules.",
    },
    {
      id: "s9",
      title: "Medical test and license",
      whatYouDo: "After passing, do the medical test and get the license issued.",
      where: "Clinic / school",
      whatYouNeed: "Medical report",
      tip: "Follow the school’s instructions.",
    },
  ],
  qna: [
    {
      q: "What is the minimum age?",
      a: "It depends on the license type. Most private licenses start at 18.",
    },
    {
      q: "Do I need Absher?",
      a: "Yes. Booking is done through Absher appointments.",
    },
    {
      q: "What is the appointment SMS?",
      a: "It is the confirmation message you show at the school.",
    },
    {
      q: "What are the 3 categories?",
      a: "Beginner, Intermediate, and Advanced.",
    },
    {
      q: "What is the initial assessment?",
      a: "A quick check to see your driving level.",
    },
    {
      q: "When do I pay the package fee?",
      a: "After you pass the initial assessment.",
    },
    {
      q: "What if I fail the theory test?",
      a: "You pay a retest fee (default 85 SAR) and try again.",
    },
    {
      q: "What happens after theory pass?",
      a: "You start hands-on driving lessons.",
    },
    {
      q: "When is the medical test?",
      a: "After you pass the final road test.",
    },
    {
      q: "Can women apply?",
      a: "Yes. Women can apply like men.",
    },
    {
      q: "Can expats apply?",
      a: "Yes, with a valid Iqama.",
    },
    {
      q: "How long does it take?",
      a: "It varies by appointments and school schedule.",
    },
    {
      q: "Can steps or fees differ by city or school?",
      a: "Yes. Always follow your school’s instructions.",
    },
  ],
  mistakes: [
    "Missing the appointment SMS",
    "Going to the wrong school or day",
    "Skipping classes",
    "Not studying for theory",
    "Rushing the final test",
  ],
  disclaimer: "Sequence/fees can vary by driving school/region. Follow your school’s instructions.",
};
