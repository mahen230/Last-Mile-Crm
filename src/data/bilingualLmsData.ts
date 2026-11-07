export type LanguageMode = 'en' | 'hi';

export interface CourseExamPattern {
  paperTitle: string;
  totalMarks: number;
  totalQuestions: number;
  durationMinutes: number;
  negativeMarking: string;
  qualifyingCriteria: {
    category: string;
    percentage: string;
    marksRequired: string;
  }[];
  patternSummary: string;
  statutoryRules: string[];
}

export interface BilingualCourseInfo {
  id: 'GDS_MTS' | 'GDS_POSTMAN' | 'GDS_PA_SA';
  code: string;
  title: { en: string; hi: string };
  subtitle: { en: string; hi: string };
  categoryBadge: { en: string; hi: string };
  instructor: {
    name: { en: string; hi: string };
    designation: { en: string; hi: string };
    experience: { en: string; hi: string };
    avatarText: string;
  };
  examInfo: {
    en: CourseExamPattern;
    hi: CourseExamPattern;
  };
  highlights: { en: string[]; hi: string[] };
}

export const BILINGUAL_COURSES: Record<string, BilingualCourseInfo> = {
  GDS_MTS: {
    id: 'GDS_MTS',
    code: 'COURSE-MTS-2026',
    title: {
      en: 'GDS to Multi-Tasking Staff (MTS) Comprehensive Master Course',
      hi: 'जीडीएस से मल्टी-टास्किंग स्टाफ (एमटीएस) संपूर्ण मास्टर कोर्स',
    },
    subtitle: {
      en: 'Statutory Post Office Guide Part I, Postal Manual Volume V, General Knowledge, Ethics & Arithmetic',
      hi: 'वैधानिक डाकघर गाइड भाग I, डाक नियमावली खंड V, सामान्य ज्ञान, नैतिकता एवं अंकगणित',
    },
    categoryBadge: {
      en: 'LDCE Promotional Exam',
      hi: 'विभागीय पदोन्नति परीक्षा',
    },
    instructor: {
      name: {
        en: 'Shri R. K. Meena, ASP (Retd.)',
        hi: 'श्री आर. के. मीणा, एएसपी (सेवानिवृत्त)',
      },
      designation: {
        en: 'Former Senior Instructor, Postal Training Centre (PTC)',
        hi: 'पूर्व वरिष्ठ प्रशिक्षक, डाक प्रशिक्षण केंद्र (पीटीसी)',
      },
      experience: {
        en: '28+ Years in Postal Operations & LDCE Exam Training',
        hi: 'डाक परिचालन एवं विभागीय परीक्षा प्रशिक्षण में 28+ वर्ष',
      },
      avatarText: 'RKM',
    },
    examInfo: {
      en: {
        paperTitle: 'Paper-I: Basic Postal Knowledge, General Awareness & Reasoning / Arithmetic',
        totalMarks: 100,
        totalQuestions: 50,
        durationMinutes: 60,
        negativeMarking: 'Zero Negative Marking (Nil)',
        qualifyingCriteria: [
          { category: 'Unreserved (UR)', percentage: '40%', marksRequired: '40 / 100' },
          { category: 'OBC / EWS', percentage: '37%', marksRequired: '37 / 100' },
          { category: 'SC / ST / PwD', percentage: '33%', marksRequired: '33 / 100' },
        ],
        patternSummary:
          'Part A (30 Questions / 60 Marks): Post Office Guide Part I (23 Qs) + Postal Manual Vol V (7 Qs). Part B (20 Questions / 40 Marks): General Awareness & Ethics (10 Qs) + Basic Arithmetic (10 Qs).',
        statutoryRules: [
          'Post Office Guide Part I (Clauses 1 to 57 - Types of POs, Franking, Prohibited Articles, Post Box/Bag)',
          'Postal Manual Vol V (Clauses 1 to 57 - Statutory Definitions: HO, SO, BO, Due Mail, Trial Cards M-26a)',
          'Paper-II: Local Language Translation & Essay (Qualifying in nature - 50 Marks, 60 Mins)',
        ],
      },
      hi: {
        paperTitle: 'प्रश्न-पत्र I: बुनियादी डाक ज्ञान, सामान्य जागरूकता एवं तर्कशक्ति / अंकगणित',
        totalMarks: 100,
        totalQuestions: 50,
        durationMinutes: 60,
        negativeMarking: 'शून्य नकारात्मक अंकन (कोई निगेटिव मार्किंग नहीं)',
        qualifyingCriteria: [
          { category: 'अनारक्षित (UR)', percentage: '40%', marksRequired: '40 / 100' },
          { category: 'ओबीसी / ईडब्ल्यूएस', percentage: '37%', marksRequired: '37 / 100' },
          { category: 'एससी / एसटी / दिव्यांग', percentage: '33%', marksRequired: '33 / 100' },
        ],
        patternSummary:
          'भाग क (30 प्रश्न / 60 अंक): डाकघर गाइड भाग I (23 प्रश्न) + डाक नियमावली खंड V (7 प्रश्न)। भाग ख (20 प्रश्न / 40 अंक): सामान्य जागरूकता एवं नैतिकता (10 प्रश्न) + बुनियादी अंकगणित (10 प्रश्न)।',
        statutoryRules: [
          'डाकघर गाइड भाग I (नियम 1 से 57 - डाकघरों के प्रकार, फ्रैंकिंग मशीन, प्रतिबंधित वस्तुएं, पोस्ट बॉक्स/बैग)',
          'डाक नियमावली खंड V (नियम 1 से 57 - वैधानिक परिभाषाएं: प्रधान, उप एवं शाखा डाकघर, ड्यू मेल, ट्रायल कार्ड)',
          'प्रश्न-पत्र II: स्थानीय भाषा अनुवाद एवं निबंध (केवल अर्हक प्रकृति - 50 अंक, 60 मिनट)',
        ],
      },
    },
    highlights: {
      en: [
        'Complete Directorate statutory syllabus aligned with latest Postal Manual editions',
        '30 High-Yield Video & Live Class lectures with simulated instructor notes',
        'Full downloadable PDF study notes with formula cheat sheets and clause citations',
        'Topic-wise interactive quizzes + 3 full-length timed mock practice sets',
      ],
      hi: [
        'नवीनतम डाक नियमावली संस्करणों के अनुरूप महानिदेशालय का संपूर्ण वैधानिक पाठ्यक्रम',
        'प्रशिक्षक व्याख्यान एवं नोट्स के साथ 30 उच्च-अंकदायी वीडियो एवं लाइव कक्षाएं',
        'फॉर्मूला शीट और नियम संदर्भों सहित संपूर्ण डाउनलोड करने योग्य पीडीएफ अध्ययन नोट्स',
        'विषयवार इंटरैक्टिव प्रश्नोत्तरी + 3 पूर्ण-लंबाई वाली समयबद्ध मॉक अभ्यास परीक्षाएं',
      ],
    },
  },
  GDS_POSTMAN: {
    id: 'GDS_POSTMAN',
    code: 'COURSE-PM-2026',
    title: {
      en: 'GDS to Postman & Mail Guard Master Certification',
      hi: 'जीडीएस से डाकिया एवं मेल गार्ड मास्टर प्रमाणन कोर्स',
    },
    subtitle: {
      en: 'Delivery Operations, Postal Manual Vol VI Part III, Vol VII (RMS), IT Modernization 2.0 & PMA App',
      hi: 'वितरण कार्यप्रणाली, डाक नियमावली खंड VI भाग III, खंड VII (आरएमएस), आईटी आधुनिकीकरण 2.0 एवं पीएमए ऐप',
    },
    categoryBadge: {
      en: 'Field Operational Cadre',
      hi: 'फील्ड परिचालन संवर्ग',
    },
    instructor: {
      name: {
        en: 'Inspector M. L. Verma',
        hi: 'निरीक्षक एम. एल. वर्मा',
      },
      designation: {
        en: 'Inspector of Posts, East Sub-Division',
        hi: 'डाक निरीक्षक, पूर्व उप-संभाग',
      },
      experience: {
        en: '22+ Years in Delivery Administration & Beat Supervision',
        hi: 'वितरण प्रशासन एवं बीट पर्यवेक्षण में 22+ वर्ष',
      },
      avatarText: 'MLV',
    },
    examInfo: {
      en: {
        paperTitle: 'Paper-I: Delivery Statutory Manuals, RMS & Modern Tech + DEST Skill',
        totalMarks: 150,
        totalQuestions: 75,
        durationMinutes: 90,
        negativeMarking: 'Zero Negative Marking (Nil)',
        qualifyingCriteria: [
          { category: 'Unreserved (UR)', percentage: '40%', marksRequired: '60 / 150' },
          { category: 'OBC / EWS', percentage: '37%', marksRequired: '55.5 / 150' },
          { category: 'SC / ST / PwD', percentage: '33%', marksRequired: '49.5 / 150' },
        ],
        patternSummary:
          'Part A (50 Questions / 100 Marks): PO Guide Part I delivery norms, Postal Manual Vol VI Part III (Postman duties MS-27/RP-53), Vol VII (RMS sets/TB). Part B (25 Questions / 50 Marks): GK, Reasoning & Arithmetic. + DEST 25 Marks (Paper-III).',
        statutoryRules: [
          'Post Office Guide Part I (Delivery, Redirection Clauses 67-71, Refusal vs Unclaimed, Window Delivery)',
          'Postal Manual Vol VI Part III (Duties of Postman, Beat Knowledge, Postman Book MS-27, Undelivered Articles)',
          'Postal Manual Vol VII (RMS Sorting Rules, Transit Mail Office, Mail Abstract M-42/M-43)',
          'IT 2.0: PMA App Delivery, DARPAN Biometrics, Speed Post Barcode Scan, eMO Handover',
        ],
      },
      hi: {
        paperTitle: 'प्रश्न-पत्र I: वितरण नियमावली, आरएमएस एवं आधुनिक तकनीक + डीईएसटी कौशल',
        totalMarks: 150,
        totalQuestions: 75,
        durationMinutes: 90,
        negativeMarking: 'शून्य नकारात्मक अंकन (कोई निगेटिव मार्किंग नहीं)',
        qualifyingCriteria: [
          { category: 'अनारक्षित (UR)', percentage: '40%', marksRequired: '60 / 150' },
          { category: 'ओबीसी / ईडब्ल्यूएस', percentage: '37%', marksRequired: '55.5 / 150' },
          { category: 'एससी / एसटी / दिव्यांग', percentage: '33%', marksRequired: '49.5 / 150' },
        ],
        patternSummary:
          'भाग क (50 प्रश्न / 100 अंक): डाकघर गाइड भाग I वितरण नियम, डाक नियमावली खंड VI भाग III (डाकिया कर्तव्य एमएस-27/आरपी-53), खंड VII (आरएमएस सेट/टीबी)। भाग ख (25 प्रश्न / 50 अंक): सामान्य ज्ञान, तर्कशक्ति एवं गणित। + डीईएसटी 25 अंक (प्रश्न-पत्र III)।',
        statutoryRules: [
          'डाकघर गाइड भाग I (वितरण नियम, पुनर्निर्देशन नियम 67-71, अस्वीकृत बनाम अवितरित, खिड़की वितरण)',
          'डाक नियमावली खंड VI भाग III (डाकिया के कर्तव्य, बीट ज्ञान, डाकिया बही एमएस-27, अवितरित वस्तुएं)',
          'डाक नियमावली खंड VII (आरएमएस छंटाई नियम, पारवहन डाक कार्यालय, मेल एब्सट्रैक्ट एम-42/एम-43)',
          'आईटी आधुनिकीकरण 2.0: पीएमए ऐप वितरण, दर्पण बायोमेट्रिक, स्पीड पोस्ट बारकोड स्कैन, ई-एमओ',
        ],
      },
    },
    highlights: {
      en: [
        'Complete coverage of delivery forms MS-27, RP-53, MS-85 and postal account reconciliations',
        'Simulated field delivery live classes covering beat routing and doorstep biometric authentication',
        'Interactive mock tests with full timer, color-coded question palette, and instant score analysis',
        'Official PYQ vault featuring solved questions from 2021 to 2025 examination cycles',
      ],
      hi: [
        'वितरण प्रपत्रों एमएस-27, आरपी-53, एमएस-85 एवं डाक खाता मिलान का संपूर्ण कवरेज',
        'बीट रूटिंग एवं बायोमेट्रिक प्रमाणीकरण को कवर करने वाली लाइव कक्षाएं',
        'टाइमर, रंग-संकेतक प्रश्न पैलेट एवं त्वरित अंक विश्लेषण के साथ मॉक टेस्ट',
        '2021 से 2025 तक की परीक्षाओं के हल किए गए प्रश्न-पत्रों का आधिकारिक संग्रह',
      ],
    },
  },
  GDS_PA_SA: {
    id: 'GDS_PA_SA',
    code: 'COURSE-PA-2026',
    title: {
      en: 'GDS to Postal Assistant (PA) & Sorting Assistant (SA) Elite Course',
      hi: 'जीडीएस से डाक सहायक (पीए) एवं छंटाई सहायक (एसए) एलीट कोर्स',
    },
    subtitle: {
      en: 'POSB CBS Finacle Operations, National Savings Schemes, PLI/RPLI Rules, Philately & Manual Vol II-VIII',
      hi: 'पीओएसबी सीबीएस फिनाकल संचालन, राष्ट्रीय बचत योजनाएं, पीएलआई/आरपीएलआई नियम, फिलेटली एवं नियमावली खंड II-VIII',
    },
    categoryBadge: {
      en: 'Clerical & Supervisory Cadre',
      hi: 'लिपिकीय एवं पर्यवेक्षी संवर्ग',
    },
    instructor: {
      name: {
        en: 'Dr. Suresh Chandra, Ex-Senior Postmaster',
        hi: 'डॉ. सुरेश चंद्र, पूर्व वरिष्ठ पोस्टमास्टर',
      },
      designation: {
        en: 'National Faculty for CBS & Postal Life Insurance Training',
        hi: 'सीबीएस एवं डाक जीवन बीमा प्रशिक्षण के राष्ट्रीय संकाय',
      },
      experience: {
        en: '30+ Years in Finacle Banking, Sub-Accounts & Counter Management',
        hi: 'फिनाकल बैंकिंग, उप-लेखा एवं काउंटर प्रबंधन में 30+ वर्ष',
      },
      avatarText: 'SC',
    },
    examInfo: {
      en: {
        paperTitle: 'Paper-I: Advanced Banking, Insurance, Philately, Manuals Vol II-VIII & Aptitude',
        totalMarks: 100,
        totalQuestions: 100,
        durationMinutes: 120,
        negativeMarking: 'Zero Negative Marking (Nil)',
        qualifyingCriteria: [
          { category: 'Unreserved (UR)', percentage: '40%', marksRequired: '40 / 100' },
          { category: 'OBC / EWS', percentage: '37%', marksRequired: '37 / 100' },
          { category: 'SC / ST / PwD', percentage: '33%', marksRequired: '33 / 100' },
        ],
        patternSummary:
          'Paper-I Part A (50 Questions): POSB CBS Manual (Finacle menus CMRC, CASBAO, CTM), NSS Schemes (SB, RD, TD, MIS, SCSS, PPF, SSA, NSC, KVP), PLI/RPLI (Suraksha, Santosh, Suvidha, Sumangal, Yugal Suraksha), Preservation of Records. Part B (50 Questions): GK, Reasoning, Arithmetic & English.',
        statutoryRules: [
          'POSB CBS Finacle Core Commands (CTM, CASBAO, HCAAC, HAFI, CMRC customer inquiry)',
          'Small Savings Act & Interest Computations (SSA 8.2%, SCSS 8.2%, MIS 7.4%, PPF 7.1%, KVP 7.5%)',
          'Postal Life Insurance (Established 1 Feb 1884) & Rural PLI (24 March 1995 recommendations of Malhotra Committee)',
          'Preservation of Records: Nominal Roll ACG-40 (Permanent), Sub-Office Account (3 Years), Error Book (3 Years)',
        ],
      },
      hi: {
        paperTitle: 'प्रश्न-पत्र I: उन्नत बैंकिंग, बीमा, फिलेटली, नियमावली खंड II-VIII एवं अभिरुचि',
        totalMarks: 100,
        totalQuestions: 100,
        durationMinutes: 120,
        negativeMarking: 'शून्य नकारात्मक अंकन (कोई निगेटिव मार्किंग नहीं)',
        qualifyingCriteria: [
          { category: 'अनारक्षित (UR)', percentage: '40%', marksRequired: '40 / 100' },
          { category: 'ओबीसी / ईडब्ल्यूएस', percentage: '37%', marksRequired: '37 / 100' },
          { category: 'एससी / एसटी / दिव्यांग', percentage: '33%', marksRequired: '33 / 100' },
        ],
        patternSummary:
          'प्रश्न-पत्र I भाग क (50 प्रश्न): पीओएसबी सीबीएस नियमावली (फिनाकल मेनू CMRC, CASBAO, CTM), राष्ट्रीय बचत योजनाएं (एसबी, आरडी, टीडी, एमआईएस, एससीएसएस, पीपीएफ, एसएसए, एनएससी, केवीपी), पीएलआई/आरपीएलआई, अभिलेख संरक्षण। भाग ख (50 प्रश्न): सामान्य ज्ञान, तर्कशक्ति, गणित एवं अंग्रेजी।',
        statutoryRules: [
          'पीओएसबी सीबीएस फिनाकल कमांड्स (CTM, CASBAO, HCAAC, HAFI, CMRC ग्राहक पूछताछ)',
          'लघु बचत अधिनियम एवं ब्याज गणना (एसएसए 8.2%, एससीएसएस 8.2%, एमआईएस 7.4%, पीपीएफ 7.1%)',
          'डाक जीवन बीमा (स्थापना 1 फरवरी 1884) एवं ग्रामीण डाक जीवन बीमा (24 मार्च 1995)',
          'अभिलेखों का संरक्षण: नॉमिनल रोल एसीजी-40 (स्थायी), उप-डाकघर लेखा (3 वर्ष), त्रुटि पुस्तिका (3 वर्ष)',
        ],
      },
    },
    highlights: {
      en: [
        'Finacle 10.x live screen walkthroughs for account opening, deposits, loan sanctions & claims',
        'Comprehensive PLI/RPLI actuarial table analysis and bonus calculation formula notes',
        'Complete coverage of Postal Manual Volume II (Appeals, Conduct Rules & Leave Rules)',
        'Three full-length Directorate standard mock test papers with simulated candidate ranking',
      ],
      hi: [
        'खाता खोलने, जमा, ऋण स्वीकृति एवं दावों के लिए फिनाकल 10.x लाइव स्क्रीन गाइड',
        'व्यापक पीएलआई/आरपीएलआई बोनस गणना सूत्र नोट्स एवं टेबल विश्लेषण',
        'डाक नियमावली खंड II (अपील, आचरण नियम एवं अवकाश नियम) का संपूर्ण कवरेज',
        'उम्मीदवार रैंकिंग के साथ तीन पूर्ण-लंबाई वाले महानिदेशालय मानक मॉक टेस्ट पेपर्स',
      ],
    },
  },
};

// UI Localization dictionary
export const UI_STRINGS: Record<LanguageMode, Record<string, string>> = {
  en: {
    academyTitle: 'India Post Departmental LDCE Academy',
    academySubtitle: 'Promotional Examination Training & Digital Learning Management System',
    switchLang: 'Language',
    activeCourse: 'Active Course',
    enrolledBadge: 'Official Candidate Enrolled',
    batchInfo: 'Batch 2026-27 · Rajasthan Circle',
    overallProgress: 'Course Progress',
    completedTopics: 'Completed Topics',
    examSummaryTab: 'Course & Syllabus',
    practiceSetsTab: 'Exam Practice Sets (3 Mocks)',
    pyqVaultTab: 'PYQ Question Bank',
    studentDashboard: 'Student Academy Dashboard',
    examInfoHeading: 'Statutory Exam Blueprint & Qualifying Thresholds',
    totalMarks: 'Total Marks',
    duration: 'Duration',
    negativeMarking: 'Negative Marking',
    qualifyingThresholds: 'Qualifying Cut-off Thresholds',
    curriculumSections: 'Curriculum & Chapter Modules',
    expandAll: 'Expand All',
    collapseAll: 'Collapse All',
    modeVideo: 'Video & Live Class',
    modeNotes: 'Notes & Formula PDF',
    modeQuiz: 'Topic Practice Quiz',
    startTopicQuiz: 'Start Practice Quiz',
    markCompleted: 'Mark Topic Completed',
    completed: 'Completed',
    pyqTag: 'Official PYQ Reference',
    statutoryRule: 'Rule Reference',
    importantHighlights: 'Statutory Notes & Key Highlights',
    keyFormulas: 'Key Formulas & Tariff Table',
    downloadNotesPdf: 'Download Printable Notes (PDF)',
    printNotes: 'Print Study Notes',
    liveStreamSimulation: 'Interactive Live Class Lecture',
    videoPlaying: 'Live Class Simulation Active',
    speed: 'Playback Speed',
    classroomChat: 'Live Classroom Discussion & Q&A',
    postQuestion: 'Ask Instructor a Question',
    submitAnswer: 'Submit Topic Quiz',
    resetQuiz: 'Reset & Reattempt',
    score: 'Your Score',
    passed: 'Passed',
    needsReview: 'Review Required (Target ≥ 60%)',
    explanation: 'Statutory Explanation & Rule Citation',
    practiceSetsHeading: 'Full-Length Timed Exam Practice Sets',
    practiceSetsDesc: 'Simulated computer-based mock examinations mirroring exact Directorate questions, official marking schemes, and strict time limits.',
    startMockTest: 'Start Mock Exam',
    resumeMockTest: 'Resume Mock Exam',
    retakeMockTest: 'Retake Mock Test',
    timeLeft: 'Time Remaining',
    questionPalette: 'Question Palette',
    answered: 'Answered',
    markedReview: 'Marked for Review',
    notVisited: 'Not Visited',
    clearResponse: 'Clear Response',
    prevQuestion: 'Previous',
    nextQuestion: 'Next',
    finishMock: 'Submit Full Mock Exam',
    mockScorecard: 'Official Mock Test Performance Scorecard',
    totalScore: 'Total Marks Scored',
    accuracy: 'Accuracy',
    timeTaken: 'Time Taken',
    passStatus: 'Result Status',
    questionReview: 'Question-by-Question Review & Analysis',
    closeScorecard: 'Back to Academy Dashboard',
    mockSet1Title: 'Mock Paper #1 — Directorate Official Paper-I Pattern',
    mockSet2Title: 'Mock Paper #2 — High-Yield Speed Test (Clause Mastery)',
    mockSet3Title: 'Mock Paper #3 — All-India Postal Circle Grand Mock',
  },
  hi: {
    academyTitle: 'भारतीय डाक विभागीय एलडीसीई अकादमी',
    academySubtitle: 'पदोन्नति परीक्षा प्रशिक्षण एवं डिजिटल अधिगम प्रबंधन प्रणाली',
    switchLang: 'भाषा',
    activeCourse: 'सक्रिय पाठ्यक्रम',
    enrolledBadge: 'पंजीकृत आधिकारिक अभ्यर्थी',
    batchInfo: 'सत्र 2026-27 · राजस्थान परिमंडल',
    overallProgress: 'पाठ्यक्रम प्रगति',
    completedTopics: 'पूर्ण किए गए विषय',
    examSummaryTab: 'पाठ्यक्रम एवं सिलेबस',
    practiceSetsTab: 'परीक्षा अभ्यास सेट्स (3 मॉक)',
    pyqVaultTab: 'विगत वर्ष प्रश्न बैंक (PYQ)',
    studentDashboard: 'अभ्यर्थी अकादमी डैशबोर्ड',
    examInfoHeading: 'वैधानिक परीक्षा ब्लूप्रिंट एवं अर्हक अंक सीमा',
    totalMarks: 'कुल अंक',
    duration: 'समय सीमा',
    negativeMarking: 'नकारात्मक अंकन',
    qualifyingThresholds: 'श्रेणीवार अर्हक कट-ऑफ',
    curriculumSections: 'पाठ्यक्रम एवं अध्याय मॉड्यूल',
    expandAll: 'सभी खोलें',
    collapseAll: 'सभी समेटें',
    modeVideo: 'वीडियो एवं लाइव कक्षा',
    modeNotes: 'नोट्स एवं फॉर्मूला पीडीएफ',
    modeQuiz: 'विषयवार अभ्यास क्विज़',
    startTopicQuiz: 'अभ्यास क्विज़ प्रारंभ करें',
    markCompleted: 'विषय को पूर्ण चिह्नित करें',
    completed: 'पूर्ण',
    pyqTag: 'विभागीय परीक्षा संदर्भ',
    statutoryRule: 'नियम संदर्भ',
    importantHighlights: 'वैधानिक नोट्स एवं मुख्य बिंदु',
    keyFormulas: 'मुख्य सूत्र एवं टैरिफ तालिका',
    downloadNotesPdf: 'मुद्रण योग्य नोट्स डाउनलोड करें (PDF)',
    printNotes: 'अध्ययन नोट्स प्रिंट करें',
    liveStreamSimulation: 'इंटरैक्टिव लाइव कक्षा व्याख्यान',
    videoPlaying: 'लाइव कक्षा प्रसारण सक्रिय',
    speed: 'गति',
    classroomChat: 'कक्षा परिचर्चा एवं प्रश्नोत्तर',
    postQuestion: 'प्रशिक्षक से प्रश्न पूछें',
    submitAnswer: 'क्विज़ सबमिट करें',
    resetQuiz: 'रीसेट कर पुनः प्रयास करें',
    score: 'आपका प्राप्तांक',
    passed: 'उत्तीर्ण',
    needsReview: 'पुनरावलोकन आवश्यक (लक्ष्य ≥ 60%)',
    explanation: 'वैधानिक व्याख्या एवं नियम संदर्भ',
    practiceSetsHeading: 'पूर्ण-लंबाई समयबद्ध परीक्षा अभ्यास सेट्स',
    practiceSetsDesc: 'महानिदेशालय के वास्तविक प्रश्न-पत्रों, अंकन पद्धति एवं समय सीमाओं के अनुरूप तैयार की गई कंप्यूटर आधारित सिमुलेटेड मॉक परीक्षाएं।',
    startMockTest: 'मॉक परीक्षा प्रारंभ करें',
    resumeMockTest: 'मॉक परीक्षा जारी रखें',
    retakeMockTest: 'पुनः टेस्ट दें',
    timeLeft: 'शेष समय',
    questionPalette: 'प्रश्न पैलेट',
    answered: 'उत्तर दिया',
    markedReview: 'समीक्षा हेतु चिह्नित',
    notVisited: 'नहीं देखा',
    clearResponse: 'उत्तर हटाएं',
    prevQuestion: 'पिछला प्रश्न',
    nextQuestion: 'अगला प्रश्न',
    finishMock: 'मॉक परीक्षा सबमिट करें',
    mockScorecard: 'आधिकारिक मॉक टेस्ट प्रदर्शन स्कोरकार्ड',
    totalScore: 'कुल प्राप्तांक',
    accuracy: 'सटीकता (Accuracy)',
    timeTaken: 'लिया गया समय',
    passStatus: 'परिणाम स्थिति',
    questionReview: 'प्रश्नानुसार विस्तृत समीक्षा एवं विश्लेषण',
    closeScorecard: 'अकादमी डैशबोर्ड पर वापस जाएं',
    mockSet1Title: 'मॉक पेपर #1 — महानिदेशालय आधिकारिक प्रश्न-पत्र I पैटर्न',
    mockSet2Title: 'मॉक पेपर #2 — उच्च-अंकदायी स्पीड टेस्ट (नियम कंठस्थीकरण)',
    mockSet3Title: 'मॉक पेपर #3 — अखिल भारतीय डाक परिमंडल ग्रैंड मॉक',
  },
};
