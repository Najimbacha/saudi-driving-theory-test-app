import { PACKAGE_FEE_SAR, THEORY_RETEST_FEE_SAR } from "./fees";

export const licenseGuideEn = {
  direction: "ltr",
  title: "How to Apply for a Driving License in Saudi Arabia",
  homeSubtitle: "Simple steps for expats and residents",
  cta: "Start guide",
  labels: {
    whatYouDo: "What you do",
    where: "Where",
    whatYouNeed: "What you need",
  },
  sectionTitles: {
    checklist: "What you need",
    steps: "Step-by-step",
    categories: "Training level",
    fees: "Fees",
    qna: "Quick questions",
    mistakes: "Important advice",
  },
  feeLabels: {
    packageFee: "Training package",
    theoryRetest: "Theory retest",
  },
  needsChecklist: [
    "Absher account",
    "Valid Iqama or Saudi ID",
    "Printed appointment slip",
    "Payment method",
    "Appointment confirmation",
    "Medical report (after final test)",
  ],
  categories: [
    {
      key: "beginner",
      title: "Beginner",
      shortDesc: "New driver. Full training package.",
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
  categoryNote: "The steps are the same. Training length depends on your assessment.",
  fees: {
    packageFee: PACKAGE_FEE_SAR,
    theoryRetestFee: THEORY_RETEST_FEE_SAR,
    feeNote: "Fees vary by school and skill level. Beginners usually pay more.",
  },
  steps: [
    {
      id: "s1",
      title: "Booking an appointment (Absher)",
      whatYouDo:
        "Log in to Absher and go to: Appointments → Traffic → Proceed to Service → Book New Appointment. Choose your training level, region, and school, then pick a date and time.",
      where: "Absher",
      whatYouNeed: "Absher account and valid ID",
      tip: "Booking is mandatory. Save or print the confirmation.",
    },
    {
      id: "s2",
      title: "Initial assessment & payment",
      whatYouDo:
        "Arrive at the driving school on time. They check your Iqama and do a short driving assessment to decide your level. Pay the required training package.",
      where: "Driving school",
      whatYouNeed: "Printed appointment slip and valid Iqama/ID",
      tip: "Skilled drivers usually pay less; beginners pay more.",
    },
    {
      id: "s3",
      title: "Simulator test",
      whatYouDo:
        "Attend the simulator session to practice rules and situations. It is mainly for learning and usually has no pass/fail result.",
      where: "Driving school",
      whatYouNeed: "Attendance",
      tip: "Use this to get comfortable with traffic rules.",
    },
    {
      id: "s4",
      title: "Computer (theoretical) test",
      whatYouDo:
        "Take the timed multiple-choice test about traffic signs, road rules, and safety. You must finish within the allowed time. You can change the language per question.",
      where: "Driving school",
      whatYouNeed: "Study signs, speed limits, violations, and priority rules",
      tip: "Focus on signs and speed limits when studying.",
    },
    {
      id: "s5",
      title: "Practical training classes",
      whatYouDo:
        "Complete the training days assigned to you. Classes include lane discipline, turning, parking, and reverse parking.",
      where: "Driving school",
      whatYouNeed: "On-time attendance",
      tip: "Being late may count as absence and cause delays.",
    },
    {
      id: "s6",
      title: "Final test & getting the license",
      whatYouDo:
        "After training, pass the final practical test. Do the medical test at an approved center or traffic building. Once the report is updated, the license can be printed.",
      where: "Driving school / approved medical center",
      whatYouNeed: "Completed training and medical report",
      tip: "Do the medical test yourself. It is cheaper than paying a middleman.",
    },
  ],
  qna: [
    {
      q: "Is Absher booking required?",
      a: "Yes. The appointment must be booked through Absher.",
    },
    {
      q: "Can expats apply?",
      a: "Yes, with a valid Iqama.",
    },
    {
      q: "Is the simulator a pass/fail test?",
      a: "Usually no. It is mainly for practice and learning.",
    },
    {
      q: "Is the theory test timed?",
      a: "Yes. You must answer all questions within the allowed time.",
    },
    {
      q: "Can the test language be changed?",
      a: "Yes. You can change the language per question.",
    },
  ],
  mistakes: [
    "Do not pay agents or fixers.",
    "Get the license legally through tests and training.",
    "Avoid paying anyone to arrange a medical test.",
    "Passing properly keeps you safe and avoids future problems.",
  ],
  disclaimer:
    "The process is straightforward. Thousands of people complete it successfully. Preparation and honesty are the key to success.",
};
