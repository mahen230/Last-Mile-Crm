import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Download,
  Award,
  Play,
  Printer,
  Check,
  RotateCcw,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileCheck2,
  Layers,
  Filter,
  Bookmark,
} from 'lucide-react';
import {
  operationsService,
  POSTAL_LMS_MODULES,
  FULL_MOCK_TEST_SERIES,
  LMSModule,
  LMSTopicItem,
  LMSQuizAttempt,
  LMSMockTestSet,
} from '../../services/operationsService';
import { useAuth } from '../auth/FirebaseAuthProvider';

type CategoryType = 'GDS_MTS' | 'GDS_POSTMAN' | 'GDS_PA_SA';
type ViewTabType = 'SYLLABUS_COURSE' | 'MOCK_TEST_ENGINES' | 'PYQ_VAULT';

const CATEGORY_META: Record<
  CategoryType,
  {
    code: CategoryType;
    label: string;
    shortTitle: string;
    subtitle: string;
    examPattern: string;
    statutoryBoundaries: string[];
  }
> = {
  GDS_MTS: {
    code: 'GDS_MTS',
    label: 'Course 1: GDS to MTS Examination',
    shortTitle: 'GDS → MTS Exam',
    subtitle: 'PO Guide Part I, Postal Manual Vol V, General Awareness, Ethics & Arithmetic',
    examPattern: 'Paper-I (Part A: 30 Qs / 60 Marks + Part B: 20 Qs / 40 Marks = 100 Marks · 60 Mins) + Paper-II Local Language',
    statutoryBoundaries: [
      'PO Guide Part I (Organization, PO Types, Business Hours, Postage Payment, RMFM Franking, Packing, Prohibited Articles, Post Boxes/Bags Clause 55–56)',
      'Postal Manual Vol V (Definitions: HO, SO, BO, GPO, Account Bag, Cash Bag, Due/Unusual Bag, Beat, Trial Cards M-26a, Mis-sent/Mis-directed)',
      'Paper-I Part B (Indian Geography, Civics, Freedom Struggle, Ethics & Arithmetic: BODMAS, %, Profit/Loss, SI, Average, Time & Work/Distance)',
    ],
  },
  GDS_POSTMAN: {
    code: 'GDS_POSTMAN',
    label: 'Course 2: GDS to Postman / Mail Guard Examination',
    shortTitle: 'GDS → Postman / MG',
    subtitle: 'PO Guide Part I, Postal Manual Vol V, Vol VI Part III, Vol VII, IT Modernization 2.0 & Part B',
    examPattern: 'Paper-I (Part A: 50 Qs / 100 Marks + Part B: 25 Qs / 50 Marks = 150 Marks · 90 Mins) + Paper-II Language + Paper-III DEST (25 Marks)',
    statutoryBoundaries: [
      'PO Guide Part I (Delivery of Regd/Insured/VPP/COD/Parcels, Window Delivery >₹500, Redirection Clauses 67–71, Refusal, Deceased Addressee Clause 87, eMO)',
      'Postal Manual Vol VI Part III (Head Postman & Postman Duties, Knowledge of Beats, Postman Book MS-27, Book of Receipts RP-53, MS-85/86/88)',
      'Postal Manual Vol VII (RMS Sorting & TMO Procedures, Set, Mail Guard Duties, Cage TB, Mail Abstract M-42/M-43, Station & Territorial Bundles, Camp Bags)',
      'IT Modernization 2.0 & Digital Advancement (PMA App, DARPAN 2.0, Finacle CBS, McCamish CIS, SAP CSI/DPMS, IPPB AEPS/CELC/DLC)',
    ],
  },
  GDS_PA_SA: {
    code: 'GDS_PA_SA',
    label: 'Course 3: GDS to Postal Assistant (PA) / Sorting Assistant (SA)',
    shortTitle: 'GDS → PA / SA',
    subtitle: 'POSB CBS Manual, Small Savings Schemes, PLI/RPLI, Philately, Manuals Vol II–VIII & IT 2.0',
    examPattern: 'Paper-I (Part A Departmental 100 Marks + Part B GK/Math/Reasoning) + Paper-II + Paper-III Data Entry',
    statutoryBoundaries: [
      'POSB (CBS) Manual & Finacle Commands (CMRC, CASBAO, CTM, HCAAC, HAFI), National Savings Schemes (SB, RD, TD, MIS, SCSS, PPF, SSA, NSC, KVP)',
      'PLI (1 Feb 1884) & RPLI (24 Mar 1995), Philately (Deen Dayal SPARSH Yojana), Preservation of Records (Vol VI Part I — Nominal Roll ACG-40 Permanent)',
    ],
  },
};

export default function PostalLMSView() {
  const { userProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('GDS_MTS');
  const [activeTab, setActiveTab] = useState<ViewTabType>('SYLLABUS_COURSE');
  const [, setTick] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState<LMSQuizAttempt[]>([]);
  const [printableModule, setPrintableModule] = useState<LMSModule | null>(null);

  // Topic Expansion & Topic-Wise Quiz state
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({
    'MTS-T1': true,
    'PM-T1': true,
  });
  const [activeTopicQuizId, setActiveTopicQuizId] = useState<string | null>(null);
  const [topicQuizAnswers, setTopicQuizAnswers] = useState<Record<string, number>>({});
  const [topicQuizSubmitted, setTopicQuizSubmitted] = useState<Record<string, boolean>>({});

  // Full Mock Test Series Engine State
  const [selectedMockEngine, setSelectedMockEngine] = useState<'GDS_MTS' | 'GDS_POSTMAN' | 'GDS_PA_SA'>('GDS_MTS');
  const [selectedMockTestId, setSelectedMockTestId] = useState<string>('MOCK-MTS-01');
  const [mockSectionFilter, setMockSectionFilter] = useState<string>('ALL');
  const [mockAnswers, setMockAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [mockSubmitted, setMockSubmitted] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(3600);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    setQuizAttempts(operationsService.getQuizAttempts());
    const unsub = operationsService.subscribe(() => {
      setTick((t) => t + 1);
      setQuizAttempts(operationsService.getQuizAttempts());
    });
    return () => unsub();
  }, []);

  const currentMockSet: LMSMockTestSet =
    FULL_MOCK_TEST_SERIES.find((m) => m.id === selectedMockTestId) || FULL_MOCK_TEST_SERIES[0];

  useEffect(() => {
    setTimerSeconds(currentMockSet.durationMinutes * 60);
    setTimerRunning(false);
    setMockAnswers({});
    setMarkedForReview({});
    setMockSubmitted(false);
    setMockSectionFilter('ALL');
  }, [selectedMockTestId]);

  useEffect(() => {
    if (!timerRunning || mockSubmitted) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, mockSubmitted]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const overallProgress = operationsService.getCompletedTopicsCount();
  const categoryProgress = operationsService.getCompletedTopicsCount(selectedCategory);
  const categoryModules = POSTAL_LMS_MODULES.filter((m) => m.categoryId === selectedCategory);
  const engineMockSets = FULL_MOCK_TEST_SERIES.filter((m) => m.examCategory === selectedMockEngine);

  const handleToggleTopicCompleted = (topicId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    operationsService.toggleTopicCompleted(topicId);
  };

  const toggleExpandTopic = (topicId: string) => {
    setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const handleTopicQuizSubmit = (topic: LMSTopicItem) => {
    let correct = 0;
    topic.topicQuiz.forEach((q) => {
      if (topicQuizAnswers[q.id] === q.correctIndex) correct++;
    });
    const pct = topic.topicQuiz.length > 0 ? Math.round((correct / topic.topicQuiz.length) * 100) : 0;
    operationsService.recordQuizAttempt({
      categoryId: selectedCategory,
      categoryName: `${CATEGORY_META[selectedCategory].shortTitle} · Topic Quiz (${topic.title})`,
      score: correct,
      totalQuestions: topic.topicQuiz.length,
      percentage: pct,
      staffName: userProfile?.name || 'Postal Staff',
      testType: 'TOPIC_QUIZ',
      testTitle: topic.title,
    });
    setTopicQuizSubmitted((prev) => ({ ...prev, [topic.id]: true }));
    if (pct >= 60 && !operationsService.isTopicCompleted(topic.id)) {
      operationsService.toggleTopicCompleted(topic.id);
    }
  };

  const handleResetTopicQuiz = (topic: LMSTopicItem) => {
    const nextAns = { ...topicQuizAnswers };
    topic.topicQuiz.forEach((q) => delete nextAns[q.id]);
    setTopicQuizAnswers(nextAns);
    setTopicQuizSubmitted((prev) => ({ ...prev, [topic.id]: false }));
  };

  const handleMockSubmit = () => {
    let correct = 0;
    currentMockSet.questions.forEach((q) => {
      if (mockAnswers[q.id] === q.correctIndex) correct++;
    });
    const pct =
      currentMockSet.questions.length > 0
        ? Math.round((correct / currentMockSet.questions.length) * 100)
        : 0;
    operationsService.recordQuizAttempt({
      categoryId: currentMockSet.examCategory,
      categoryName: `${currentMockSet.testCode} · ${currentMockSet.testTitle}`,
      score: correct * 2,
      totalQuestions: currentMockSet.questions.length * 2,
      percentage: pct,
      staffName: userProfile?.name || 'Postal Staff',
      testType: 'FULL_MOCK_TEST',
      testTitle: currentMockSet.testTitle,
    });
    setTimerRunning(false);
    setMockSubmitted(true);
  };

  const handleDownloadStudyNotes = (mod: LMSModule) => {
    const lines: string[] = [
      '================================================================================',
      'DEPARTMENT OF POSTS - LDCE STATUTORY STUDY NOTES & TOPIC-WISE PYQ BANK',
      '================================================================================',
      `Course Category  : ${CATEGORY_META[mod.categoryId].label}`,
      `Official Boundary: ${mod.officialSyllabusBoundary}`,
      `Paper & Weightage: ${mod.paper} (${mod.marksWeightage})`,
      `Subject Module   : ${mod.subject}`,
      '--------------------------------------------------------------------------------',
      '',
      'HIGH-YIELD PYQ & REVISION SUMMARY:',
      ...mod.studyNotesSummary.map((s, i) => `${i + 1}. ${s}`),
      '',
      'EXHAUSTIVE TOPIC-WISE LEGAL / DEPARTMENTAL RULE NOTES:',
      ...mod.topics.flatMap((t) => [
        `\n================================================================================`,
        `TOPIC: ${t.title} [${t.ruleReference}] ${t.pyqBadge || ''}`,
        `Key Points:`,
        ...t.keyPoints.map((kp) => `  • ${kp}`),
        ...t.detailedTheory.flatMap((sec) => [
          `\n  [${sec.clauseRef}] ${sec.heading}:`,
          ...sec.bullets.map((b) => `    - ${b}`),
          sec.pyqHighlight ? `    * ${sec.pyqHighlight}` : '',
        ]),
        `\n  Topic Practice Quiz (${t.topicQuiz.length} Questions):`,
        ...t.topicQuiz.map(
          (q, qi) =>
            `    Q${qi + 1}. ${q.pyqTag ? q.pyqTag + ' ' : ''}${q.question}\n       Ans: ${q.options[q.correctIndex]} (${q.explanation})`
        ),
      ]),
      '',
      '================================================================================',
      'Generated by India Post Departmental Exam LMS Hub (Kota Division · Rajasthan Circle)',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mod.id}_${mod.subject.replace(/[^a-zA-Z0-9]/g, '_')}_Full_Notes.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filtered questions for Mock Test Engine
  const displayedMockQuestions = currentMockSet.questions.filter((q) => {
    if (mockSectionFilter === 'PART_A') return q.section.startsWith('Part A');
    if (mockSectionFilter === 'PART_B') return q.section.startsWith('Part B');
    if (mockSectionFilter === 'PYQ_ONLY') return Boolean(q.pyqTag);
    return true;
  });

  // Sectional score calculation for Mock Test
  const partAQuestions = currentMockSet.questions.filter((q) => q.section.startsWith('Part A'));
  const partBQuestions = currentMockSet.questions.filter((q) => q.section.startsWith('Part B'));
  const partACorrect = partAQuestions.filter((q) => mockAnswers[q.id] === q.correctIndex).length;
  const partBCorrect = partBQuestions.filter((q) => mockAnswers[q.id] === q.correctIndex).length;
  const totalMockCorrect = partACorrect + partBCorrect;
  const totalMockPct =
    currentMockSet.questions.length > 0
      ? Math.round((totalMockCorrect / currentMockSet.questions.length) * 100)
      : 0;

  // All PYQ questions across Topic Quizzes + Mock Tests for the PYQ Vault
  const allTopicPyqQuestions = POSTAL_LMS_MODULES.filter((m) => m.categoryId === selectedCategory).flatMap(
    (m) =>
      m.topics.flatMap((t) =>
        t.topicQuiz
          .filter((q) => q.pyqTag)
          .map((q) => ({
            ...q,
            sourceType: 'Topic Quiz',
            topicTitle: t.title,
          }))
      )
  );
  const allMockPyqQuestions = FULL_MOCK_TEST_SERIES.filter(
    (s) => s.examCategory === selectedCategory
  ).flatMap((s) =>
    s.questions
      .filter((q) => q.pyqTag)
      .map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
        pyqTag: q.pyqTag,
        ruleClause: q.ruleReference,
        sourceType: s.testCode,
        topicTitle: q.subject,
      }))
  );

  return (
    <div className="space-y-6" id="postal-lms-view">
      {/* Top Hero Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <ShieldCheck size={14} />
            <span>Directorate Official LDCE Syllabus · Zero Question Overlap Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Departmental Exam LMS Hub (GDS to MTS & GDS to Postman / Mail Guard)
          </h1>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Complete rule-by-rule legal study notes, topic-end practice quizzes, Previous Year Exam notations{' '}
            <span className="text-amber-300 font-mono font-semibold">[PYQ 2021–2024]</span>, and 2 dedicated full mock test series engines adhering strictly to PO Guide Part I, Postal Manual Vol V, Vol VI Part III, Vol VII, IT Modernization 2.0 & Paper-I Part B.
          </p>
        </div>

        {/* Overall Syllabus Completion Meter */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 min-w-72 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Overall Syllabus Progress</span>
            <span className="font-mono font-bold text-amber-400 tabular-nums">
              {overallProgress.completed}/{overallProgress.total} Topics ({overallProgress.percentage}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-200"
              style={{ width: `${overallProgress.percentage}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-0.5">
            <span>Recorded Test Attempts: {quizAttempts.length}</span>
            <button
              type="button"
              onClick={() =>
                setActiveTab(activeTab === 'MOCK_TEST_ENGINES' ? 'SYLLABUS_COURSE' : 'MOCK_TEST_ENGINES')
              }
              className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
            >
              {activeTab === 'MOCK_TEST_ENGINES' ? '← Back to Topic Notes' : 'Launch Full Mock Engines →'}
            </button>
          </div>
        </div>
      </div>

      {/* Course Selector Cards (MTS, Postman/MG, PA/SA) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['GDS_MTS', 'GDS_POSTMAN', 'GDS_PA_SA'] as CategoryType[]).map((catKey, index) => {
          const meta = CATEGORY_META[catKey];
          const prog = operationsService.getCompletedTopicsCount(catKey);
          const isSelected = selectedCategory === catKey;

          return (
            <button
              key={catKey}
              type="button"
              onClick={() => {
                setSelectedCategory(catKey);
                setSelectedMockEngine(catKey);
                const firstMock = FULL_MOCK_TEST_SERIES.find((m) => m.examCategory === catKey);
                if (firstMock) setSelectedMockTestId(firstMock.id);
              }}
              className={`p-5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-red-800 text-white border-red-900 shadow-sm'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-red-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className={`font-mono font-bold tabular-nums ${isSelected ? 'text-amber-300' : 'text-red-700'}`}>
                    0{index + 1}. {meta.shortTitle}
                  </span>
                  <span className="font-mono font-bold tabular-nums">{prog.percentage}% Completed</span>
                </div>
                <div className="font-bold text-base leading-snug">{meta.label}</div>
                <p className={`text-xs mt-1.5 leading-relaxed ${isSelected ? 'text-red-100' : 'text-slate-500'}`}>
                  {meta.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-current/10">
                <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${isSelected ? 'bg-amber-400' : 'bg-red-700'}`}
                    style={{ width: `${prog.percentage}%` }}
                  />
                </div>
                <div className={`text-[11px] mt-1.5 font-mono tabular-nums ${isSelected ? 'text-red-100' : 'text-slate-500'}`}>
                  {prog.completed} of {prog.total} Syllabus Topics Mastered
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Mode Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-900">
              {CATEGORY_META[selectedCategory].label}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-red-50 text-red-800 border border-red-200 text-[11px] font-bold">
              {categoryProgress.completed}/{categoryProgress.total} Topics Done
            </span>
          </div>
          <div className="text-xs text-slate-500">{CATEGORY_META[selectedCategory].examPattern}</div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('SYLLABUS_COURSE')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'SYLLABUS_COURSE'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen size={14} />
            <span>1. Topic-Wise Theory & Topic Quizzes</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedMockEngine(selectedCategory);
              const firstMock = FULL_MOCK_TEST_SERIES.find((m) => m.examCategory === selectedCategory);
              if (firstMock) setSelectedMockTestId(firstMock.id);
              setActiveTab('MOCK_TEST_ENGINES');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'MOCK_TEST_ENGINES'
                ? 'bg-red-800 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
            }`}
          >
            <Play size={14} />
            <span>2. Full Mock Test Series Engines (No Overlap)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PYQ_VAULT')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PYQ_VAULT'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles size={14} />
            <span>3. PYQ 2021–2024 Question Bank ({allTopicPyqQuestions.length + allMockPyqQuestions.length})</span>
          </button>
        </div>
      </div>

      {/* Statutory & Legislative Boundaries Box */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Layers size={14} className="text-red-700" />
            <span>Official Directorate Syllabus & Statutory Rule Boundaries ({CATEGORY_META[selectedCategory].shortTitle})</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">100% Rule-Referenced</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {CATEGORY_META[selectedCategory].statutoryBoundaries.map((b, i) => (
            <div
              key={i}
              className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2"
            >
              <span className="font-mono font-bold text-red-700">0{i + 1}.</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: TOPIC-WISE COURSE STRUCTURE, LEGAL THEORY NOTES & TOPIC QUIZZES */}
      {/* ===================================================================== */}
      {activeTab === 'SYLLABUS_COURSE' && (
        <div className="space-y-6">
          {categoryModules.map((mod) => {
            const modCompleted = mod.topics.filter((t) =>
              operationsService.isTopicCompleted(t.id)
            ).length;

            return (
              <div
                key={mod.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-xs"
              >
                {/* Module Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-red-800 text-white text-[11px] font-bold">
                        {mod.paper}
                      </span>
                      <span className="text-xs text-red-800 font-bold">
                        Weightage: {mod.marksWeightage}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        · {modCompleted}/{mod.topics.length} Topics Completed
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">{mod.subject}</h2>
                    <p className="text-xs text-slate-600 leading-relaxed">{mod.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDownloadStudyNotes(mod)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Download Complete Notes (.TXT)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrintableModule(mod)}
                      className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer size={14} />
                      <span>Print Revision Sheet</span>
                    </button>
                  </div>
                </div>

                {/* High-Yield Revision Summary with PYQ Badges */}
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-700" />
                    <span>High-Yield Exam Revision Pointers & Previous Year Exam Rules:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-800 leading-relaxed">
                    {mod.studyNotesSummary.map((note, i) => {
                      const pyqMatch = note.match(/^(\[PYQ [^\]]+\])\s*(.*)$/);
                      return (
                        <li key={i} className="flex items-start gap-2">
                          <span className="font-mono font-bold text-amber-800 shrink-0">{i + 1}.</span>
                          <div>
                            {pyqMatch ? (
                              <>
                                <span className="inline-block px-2 py-0.5 mr-1.5 rounded bg-red-800 text-amber-200 font-mono text-[10px] font-bold">
                                  {pyqMatch[1]}
                                </span>
                                <span>{pyqMatch[2]}</span>
                              </>
                            ) : (
                              <span>{note}</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Topic-Wise Expandable Cards with Exhaustive Theory + Topic Quiz */}
                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>
                      Topic-Wise Study Notes & End-of-Topic Practice Quizzes (Click any topic to expand full notes & quiz):
                    </span>
                  </div>

                  {mod.topics.map((topic) => {
                    const done = operationsService.isTopicCompleted(topic.id);
                    const isExpanded = Boolean(expandedTopics[topic.id]);
                    const isQuizOpen = activeTopicQuizId === topic.id;
                    const isTopicQuizDone = Boolean(topicQuizSubmitted[topic.id]);

                    const topicCorrectCount = topic.topicQuiz.filter(
                      (q) => topicQuizAnswers[q.id] === q.correctIndex
                    ).length;

                    return (
                      <div
                        key={topic.id}
                        className={`rounded-2xl border transition overflow-hidden ${
                          done ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 bg-white'
                        }`}
                      >
                        {/* Topic Header Bar */}
                        <div
                          onClick={() => toggleExpandTopic(topic.id)}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 transition"
                        >
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={(e) => handleToggleTopicCompleted(topic.id, e)}
                              title="Mark Topic as Completed"
                              className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 cursor-pointer ${
                                done
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white border border-slate-300 text-transparent hover:border-red-500'
                              }`}
                            >
                              <Check size={13} />
                            </button>
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`text-sm font-bold ${
                                    done ? 'text-emerald-950' : 'text-slate-900'
                                  }`}
                                >
                                  {topic.title}
                                </span>
                                {topic.pyqBadge && (
                                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[10px] font-bold">
                                    {topic.pyqBadge}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-red-800 font-semibold">
                                Statutory Reference: {topic.ruleReference}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedTopics((prev) => ({ ...prev, [topic.id]: true }));
                                setActiveTopicQuizId(isQuizOpen ? null : topic.id);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                              <FileCheck2 size={13} />
                              <span>Topic Quiz ({topic.topicQuiz.length} Qs)</span>
                            </button>
                            <div className="p-1.5 text-slate-500">
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Topic Body: Key Points + Detailed Clause Theory + Topic Quiz */}
                        {isExpanded && (
                          <div className="px-4 pb-5 pt-2 border-t border-slate-200/80 space-y-4 bg-white">
                            {/* Core Key Points */}
                            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-1.5">
                              <div className="text-xs font-bold text-slate-900">
                                Core Statutory Rules & Memory Pointers:
                              </div>
                              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 leading-relaxed">
                                {topic.keyPoints.map((kp, idx) => (
                                  <li key={idx}>{kp}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Detailed Theory Sections */}
                            {topic.detailedTheory && topic.detailedTheory.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {topic.detailedTheory.map((sec, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 flex flex-col justify-between"
                                  >
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-slate-900">
                                          {sec.heading}
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold shrink-0">
                                          {sec.clauseRef}
                                        </span>
                                      </div>
                                      <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside leading-relaxed">
                                        {sec.bullets.map((b, bIdx) => (
                                          <li key={bIdx}>{b}</li>
                                        ))}
                                      </ul>
                                    </div>

                                    {sec.pyqHighlight && (
                                      <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-[11px] text-amber-950 font-medium leading-relaxed">
                                        <strong className="text-red-800 font-mono mr-1">★ PYQ INSIGHT:</strong>
                                        {sec.pyqHighlight}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Dedicated End-of-Topic Practice Quiz */}
                            <div className="rounded-xl border-2 border-red-900/15 bg-red-50/30 p-4 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <div className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                                    <FileCheck2 size={14} />
                                    <span>
                                      End-of-Topic Practice Quiz: {topic.title} ({topic.topicQuiz.length} Questions)
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600">
                                    Test your understanding of this specific topic with official PYQ-tagged questions.
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  {isTopicQuizDone && (
                                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-mono text-xs font-bold">
                                      Score: {topicCorrectCount}/{topic.topicQuiz.length}
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveTopicQuizId(isQuizOpen ? null : topic.id)
                                    }
                                    className="px-3 py-1.5 rounded-lg bg-red-800 hover:bg-red-900 text-white text-xs font-bold cursor-pointer"
                                  >
                                    {isQuizOpen ? 'Hide Topic Quiz' : 'Attempt Topic Quiz →'}
                                  </button>
                                </div>
                              </div>

                              {isQuizOpen && (
                                <div className="space-y-4 pt-2 border-t border-red-200">
                                  {topic.topicQuiz.map((q, qIdx) => {
                                    const userChoice = topicQuizAnswers[q.id];
                                    return (
                                      <div
                                        key={q.id}
                                        className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2.5"
                                      >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <span className="text-[11px] font-mono font-bold text-slate-500">
                                            Topic Q{qIdx + 1} · {q.ruleClause || topic.ruleReference}
                                          </span>
                                          {q.pyqTag && (
                                            <span className="px-2 py-0.5 rounded bg-red-800 text-amber-200 font-mono text-[10px] font-bold">
                                              {q.pyqTag}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs font-bold text-slate-900">
                                          {q.question}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {q.options.map((opt, optIdx) => {
                                            const isChosen = userChoice === optIdx;
                                            const isCorrect = q.correctIndex === optIdx;
                                            let optStyle =
                                              'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-400';
                                            if (isTopicQuizDone) {
                                              if (isCorrect) {
                                                optStyle =
                                                  'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                                              } else if (isChosen && !isCorrect) {
                                                optStyle = 'bg-red-100 border-red-400 text-red-950';
                                              }
                                            } else if (isChosen) {
                                              optStyle = 'bg-red-800 border-red-900 text-white font-bold';
                                            }

                                            return (
                                              <button
                                                key={optIdx}
                                                type="button"
                                                disabled={isTopicQuizDone}
                                                onClick={() =>
                                                  setTopicQuizAnswers((prev) => ({
                                                    ...prev,
                                                    [q.id]: optIdx,
                                                  }))
                                                }
                                                className={`p-2.5 rounded-lg border text-left text-xs transition cursor-pointer flex items-center justify-between ${optStyle}`}
                                              >
                                                <span>
                                                  <strong className="font-mono mr-1.5">
                                                    {String.fromCharCode(65 + optIdx)}.
                                                  </strong>
                                                  {opt}
                                                </span>
                                                {isTopicQuizDone && isCorrect && (
                                                  <CheckCircle2
                                                    size={14}
                                                    className="text-emerald-700 shrink-0"
                                                  />
                                                )}
                                              </button>
                                            );
                                          })}
                                        </div>
                                        {isTopicQuizDone && (
                                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                                            <strong className="text-slate-900">Rule Explanation: </strong>
                                            {q.explanation}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}

                                  <div className="flex items-center justify-between pt-1">
                                    {!isTopicQuizDone ? (
                                      <button
                                        type="button"
                                        onClick={() => handleTopicQuizSubmit(topic)}
                                        className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                                      >
                                        Submit Topic Quiz & Verify Rules
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleResetTopicQuiz(topic)}
                                        className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                                      >
                                        <RotateCcw size={12} />
                                        <span>Retry Topic Quiz</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: 2 DISTINCT FULL MOCK TEST SERIES ENGINES (ZERO OVERLAP)        */}
      {/* ===================================================================== */}
      {activeTab === 'MOCK_TEST_ENGINES' && (
        <div className="space-y-6">
          {/* Selector for the 2 Distinct Full Mock Test Engines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => {
                setSelectedMockEngine('GDS_MTS');
                setSelectedMockTestId('MOCK-MTS-01');
              }}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition ${
                selectedMockEngine === 'GDS_MTS'
                  ? 'border-red-800 bg-red-50/40'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-red-800 text-white font-mono text-[11px] font-bold">
                  MOCK ENGINE 01 · GDS TO MTS
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  Zero Question Overlap Verified
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-2">
                GDS to MTS Full Mock Test Series Engine (60 Mins)
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Paper-I Part A (PO Guide Part I + Postal Manual Vol V) & Part B (Indian Geography, Civics, Ethics & Arithmetic). Includes 2 independent Full Mock Test Sets.
              </p>
            </div>

            <div
              onClick={() => {
                setSelectedMockEngine('GDS_POSTMAN');
                setSelectedMockTestId('MOCK-PM-01');
              }}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition ${
                selectedMockEngine === 'GDS_POSTMAN'
                  ? 'border-red-800 bg-red-50/40'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-slate-900 text-amber-300 font-mono text-[11px] font-bold">
                  MOCK ENGINE 02 · GDS TO POSTMAN / MAIL GUARD
                </span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  Zero Question Overlap Verified
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-2">
                GDS to Postman / Mail Guard Full Mock Test Engine (90 Mins)
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Paper-I Part A (PO Guide I, Vol V, Vol VI Part III Postman Duties, Vol VII RMS/TMO & IT Modernization 2.0) & Part B (GK, Ethics & Arithmetic). Includes 2 Full Mock Sets.
              </p>
            </div>
          </div>

          {/* Mock Test Paper Switcher + Live Countdown Timer Bar */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono text-amber-400 font-bold">
                  {currentMockSet.engineTitle} · Code: {currentMockSet.testCode}
                </div>
                <h2 className="text-lg font-bold">{currentMockSet.testTitle}</h2>
                <p className="text-xs text-slate-300">{currentMockSet.officialBlueprintNote}</p>
              </div>

              {/* Live Exam Timer Controls */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl shrink-0">
                <Clock size={18} className="text-amber-400" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">
                    Remaining Time
                  </div>
                  <div className="text-lg font-mono font-black text-amber-400 tabular-nums">
                    {formatTimer(timerSeconds)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  {timerRunning ? 'Pause Timer' : 'Start Timer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMockAnswers({});
                    setMarkedForReview({});
                    setMockSubmitted(false);
                    setTimerSeconds(currentMockSet.durationMinutes * 60);
                    setTimerRunning(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Test Paper Set Selector & Section Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold mr-1">Select Paper Set:</span>
                {engineMockSets.map((set) => (
                  <button
                    key={set.id}
                    type="button"
                    onClick={() => setSelectedMockTestId(set.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                      selectedMockTestId === set.id
                        ? 'bg-red-700 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {set.testCode} ({set.questions.length} Qs · {set.totalMarks} Marks)
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Filter size={13} className="text-amber-400 mr-1" />
                {[
                  { id: 'ALL', label: `All (${currentMockSet.questions.length})` },
                  { id: 'PART_A', label: `Part A: Departmental (${partAQuestions.length})` },
                  { id: 'PART_B', label: `Part B: GK & Math (${partBQuestions.length})` },
                  {
                    id: 'PYQ_ONLY',
                    label: `PYQ Tagged (${currentMockSet.questions.filter((q) => q.pyqTag).length})`,
                  },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setMockSectionFilter(f.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                      mockSectionFilter === f.id
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Post-Submission Sectional Scorecard */}
          {mockSubmitted && (
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase text-emerald-800">
                    Official LDCE Mock Test Evaluation Report
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    Total Score: {totalMockCorrect * 2} / {currentMockSet.questions.length * 2} Marks ({totalMockPct}%)
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Qualifying Benchmark: {currentMockSet.qualifyingCriteria} · Verdict:{' '}
                    <strong className={totalMockPct >= 40 ? 'text-emerald-700' : 'text-red-700'}>
                      {totalMockPct >= 40 ? 'QUALIFIED (Merit Eligible)' : 'NEEDS REVISION (< 40%)'}
                    </strong>
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <div className="text-[11px] text-slate-500">Part A (Dept)</div>
                    <div className="text-sm font-mono font-bold text-slate-900">
                      {partACorrect * 2}/{partAQuestions.length * 2}M
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <div className="text-[11px] text-slate-500">Part B (GK/Math)</div>
                    <div className="text-sm font-mono font-bold text-slate-900">
                      {partBCorrect * 2}/{partBQuestions.length * 2}M
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <div className="text-[11px] text-slate-500">Accuracy</div>
                    <div className="text-sm font-mono font-bold text-emerald-700">
                      {totalMockPct}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Question Palette Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-slate-800">
                Question Palette ({Object.keys(mockAnswers).length} of {currentMockSet.questions.length} Answered)
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-800 inline-block" /> Answered
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Marked for Review
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200 inline-block" /> Unanswered
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentMockSet.questions.map((q, idx) => {
                const isAns = mockAnswers[q.id] !== undefined;
                const isRev = Boolean(markedForReview[q.id]);
                let badgeCls = 'bg-slate-100 text-slate-700 border-slate-300';
                if (mockSubmitted) {
                  badgeCls =
                    mockAnswers[q.id] === q.correctIndex
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-red-600 text-white border-red-700';
                } else if (isRev) {
                  badgeCls = 'bg-amber-500 text-slate-950 border-amber-600 font-bold';
                } else if (isAns) {
                  badgeCls = 'bg-red-800 text-white border-red-900 font-bold';
                }
                return (
                  <a
                    key={q.id}
                    href={`#mock-q-${q.id}`}
                    className={`w-7 h-7 rounded-lg border text-[11px] font-mono flex items-center justify-center ${badgeCls}`}
                  >
                    {idx + 1}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Mock Test Questions List */}
          <div className="space-y-4">
            {displayedMockQuestions.map((q) => {
              const qNumber = currentMockSet.questions.findIndex((item) => item.id === q.id) + 1;
              const userChoice = mockAnswers[q.id];
              const isRev = Boolean(markedForReview[q.id]);

              return (
                <div
                  key={q.id}
                  id={`mock-q-${q.id}`}
                  className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-bold">
                        Q.{qNumber}
                      </span>
                      <span className="text-xs font-bold text-red-800">{q.section}</span>
                      <span className="text-xs text-slate-500">· {q.subject}</span>
                      <span className="text-[11px] font-mono text-slate-500">({q.marks} Marks)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {q.pyqTag && (
                        <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[11px] font-bold">
                          {q.pyqTag}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setMarkedForReview((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                        }
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                          isRev
                            ? 'bg-amber-500 text-slate-950 border-amber-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Bookmark size={12} />
                        <span>{isRev ? 'Marked' : 'Review'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-sm font-bold text-slate-900 leading-snug">{q.question}</div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = userChoice === optIdx;
                      const isCorrect = q.correctIndex === optIdx;

                      let btnStyle = 'bg-slate-50 border-slate-300 text-slate-800 hover:border-slate-400';
                      if (mockSubmitted) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                        } else if (isChosen && !isCorrect) {
                          btnStyle = 'bg-red-100 border-red-400 text-red-950';
                        }
                      } else if (isChosen) {
                        btnStyle = 'bg-red-800 border-red-900 text-white font-bold';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={mockSubmitted}
                          onClick={() =>
                            setMockAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                          }
                          className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer flex items-center justify-between ${btnStyle}`}
                        >
                          <span>
                            <strong className="font-mono mr-2">
                              {String.fromCharCode(65 + optIdx)}.
                            </strong>
                            {opt}
                          </span>
                          {mockSubmitted && isCorrect && (
                            <CheckCircle2 size={15} className="text-emerald-700 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {mockSubmitted && (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
                      <div className="font-mono text-[11px] font-bold text-red-800">
                        Statutory Rule Reference: {q.ruleReference}
                      </div>
                      <div>
                        <strong className="text-slate-900">Official Explanation: </strong>
                        {q.explanation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Full Mock Test Footer */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              Answered: <strong className="text-slate-900">{Object.keys(mockAnswers).length}</strong> /{' '}
              {currentMockSet.questions.length} Questions · Zero Negative Marking
            </div>
            {!mockSubmitted ? (
              <button
                type="button"
                onClick={handleMockSubmit}
                className="px-6 py-3 bg-red-800 hover:bg-red-900 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
              >
                Submit Full Mock Test ({currentMockSet.testCode}) & Generate Scorecard
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMockAnswers({});
                  setMarkedForReview({});
                  setMockSubmitted(false);
                  setTimerSeconds(currentMockSet.durationMinutes * 60);
                }}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Re-Attempt {currentMockSet.testCode}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: PREVIOUS YEAR EXAM (PYQ 2021-2024) MASTER VAULT                 */}
      {/* ===================================================================== */}
      {activeTab === 'PYQ_VAULT' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Previous Year Exam Question Bank (PYQ 2021–2024) · {CATEGORY_META[selectedCategory].shortTitle}
              </h2>
              <p className="text-xs text-slate-500">
                Curated repository of tagged questions from 2021, 2022, 2023, and 2024 Department of Posts LDCE papers with verified rule explanations.
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 font-mono text-xs font-bold self-start">
              {allTopicPyqQuestions.length + allMockPyqQuestions.length} Verified PYQs
            </span>
          </div>

          <div className="space-y-3">
            {[...allTopicPyqQuestions, ...allMockPyqQuestions].map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    PYQ #{idx + 1} · {item.topicTitle} ({item.ruleClause})
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                      {item.sourceType}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-red-800 text-amber-200 font-mono text-[11px] font-bold">
                      {item.pyqTag}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-900">{item.question}</div>
                <div className="text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
                  <strong>Correct Answer: </strong>
                  {item.options[item.correctIndex]}
                </div>
                <div className="text-xs text-slate-600">
                  <strong className="text-slate-800">Departmental Rule Explanation: </strong>
                  {item.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mock Quiz & Topic Quiz Score Tracker Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Departmental Exam Score Tracker & Attempt Ledger
            </h3>
            <p className="text-xs text-slate-500">
              Logs both Topic-Wise Quiz completions and Full Mock Test Series attempts across MTS, Postman/MG, and PA/SA.
            </p>
          </div>
          <Award size={20} className="text-amber-600" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="py-2.5 px-3 font-semibold">Attempt ID</th>
                <th className="py-2.5 px-3 font-semibold">Exam / Test Title</th>
                <th className="py-2.5 px-3 font-semibold">Candidate / Staff</th>
                <th className="py-2.5 px-3 font-semibold text-right">Score</th>
                <th className="py-2.5 px-3 font-semibold text-right">Accuracy %</th>
                <th className="py-2.5 px-3 font-semibold text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {quizAttempts.map((att) => (
                <tr key={att.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 tabular-nums">
                    {att.id}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{att.categoryName}</td>
                  <td className="py-2.5 px-3 text-slate-700">{att.staffName}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {att.score} / {att.totalQuestions}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums">
                    {att.percentage}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500 tabular-nums">
                    {att.completedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Study Notes Modal */}
      {printableModule && (
        <div className="fixed inset-0 bg-slate-950/75 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 border border-slate-300 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Printable LDCE Statutory Revision Sheet
                </h3>
                <p className="text-xs text-slate-500">{printableModule.subject}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintableModule(null)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="border-2 border-slate-900 p-6 space-y-4 text-slate-900 text-xs">
              <div className="border-b-2 border-slate-900 pb-3">
                <div className="font-bold text-red-800">
                  INDIA POST DEPARTMENTAL LDCE STUDY MATERIAL · {CATEGORY_META[printableModule.categoryId].label}
                </div>
                <h2 className="text-lg font-black mt-0.5">{printableModule.subject}</h2>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  {printableModule.paper} · Marks Weightage: {printableModule.marksWeightage}
                </div>
              </div>

              <div>
                <div className="font-bold text-sm mb-2">1. Core Rules & PYQ Exam Summary</div>
                <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
                  {printableModule.studyNotesSummary.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-bold text-sm mb-2">2. Topic-Wise Statutory Clause Breakdown</div>
                <div className="space-y-3">
                  {printableModule.topics.map((t, idx) => (
                    <div key={t.id} className="border border-slate-300 p-3.5 rounded space-y-1.5">
                      <div className="font-bold">
                        {idx + 1}. {t.title} ({t.ruleReference}) {t.pyqBadge || ''}
                      </div>
                      <div className="text-slate-700">{t.keyPoints.join(' · ')}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
