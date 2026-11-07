import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Award,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Printer,
  Download,
  Filter,
  GraduationCap,
  Play,
  RotateCcw,
  Check,
  FileText,
  UserCheck,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import {
  operationsService,
  POSTAL_LMS_MODULES,
  FULL_MOCK_TEST_SERIES,
  LMSModule,
  LMSTopicItem,
  LMSQuizAttempt,
} from '../../services/operationsService';
import { useAuth } from '../auth/FirebaseAuthProvider';
import CourseHeaderHero from '../academy/CourseHeaderHero';
import ExamInfoCard from '../academy/ExamInfoCard';
import TopicMultiFormatViewer from '../academy/TopicMultiFormatViewer';
import ExamPracticeSetRunner from '../academy/ExamPracticeSetRunner';
import {
  LanguageMode,
  UI_STRINGS,
  BILINGUAL_COURSES,
} from '../../data/bilingualLmsData';

type MainViewTab =
  | 'COURSE_LEARNING'
  | 'EXAM_PRACTICE_SETS'
  | 'ACADEMY_DASHBOARD'
  | 'PYQ_VAULT';

export default function PostalLMSView() {
  const { userProfile } = useAuth();

  // Active Course & Language Mode (Single Active Language Mode: English or Hindi)
  const [selectedCourseId, setSelectedCourseId] = useState<
    'GDS_MTS' | 'GDS_POSTMAN' | 'GDS_PA_SA'
  >('GDS_MTS');
  const [language, setLanguage] = useState<LanguageMode>('en');
  const [activeTab, setActiveTab] = useState<MainViewTab>('COURSE_LEARNING');

  // Chapter Accordions
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'MOD-MTS-01': true,
    'MOD-PM-01': true,
  });

  // Topic Accordions
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({
    'MTS-T1': true,
    'PM-T1': true,
  });

  const [, setTick] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState<LMSQuizAttempt[]>([]);
  const [printableModule, setPrintableModule] = useState<LMSModule | null>(null);

  const t = UI_STRINGS[language];

  useEffect(() => {
    setQuizAttempts(operationsService.getQuizAttempts());
    const unsub = operationsService.subscribe(() => {
      setTick((t) => t + 1);
      setQuizAttempts(operationsService.getQuizAttempts());
    });
    return () => unsub();
  }, []);

  // Filter modules for the active course
  const courseModules = POSTAL_LMS_MODULES.filter(
    (m) => m.categoryId === selectedCourseId
  );

  // Topics counts & stats
  const totalTopicsInCourse = courseModules.reduce(
    (acc, m) => acc + m.topics.length,
    0
  );
  const completedTopicsCount = courseModules.reduce((acc, m) => {
    return (
      acc +
      m.topics.filter((top) => operationsService.isTopicCompleted(top.id)).length
    );
  }, 0);

  // Compute average score across attempts for this course
  const courseAttempts = quizAttempts.filter(
    (a) => a.categoryId === selectedCourseId
  );
  const averageQuizScore =
    courseAttempts.length > 0
      ? Math.round(
          courseAttempts.reduce((acc, a) => acc + a.percentage, 0) /
            courseAttempts.length
        )
      : 84;

  const toggleModuleAccordion = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const toggleTopicAccordion = (topicId: string) => {
    setExpandedTopics((prev) => ({ ...prev, [topicId]: !prev[topicId] }));
  };

  const handleExpandAll = () => {
    const allModMap: Record<string, boolean> = {};
    const allTopMap: Record<string, boolean> = {};
    courseModules.forEach((m) => {
      allModMap[m.id] = true;
      m.topics.forEach((top) => {
        allTopMap[top.id] = true;
      });
    });
    setExpandedModules(allModMap);
    setExpandedTopics(allTopMap);
  };

  const handleCollapseAll = () => {
    setExpandedModules({});
    setExpandedTopics({});
  };

  // Record a quiz attempt from topic or mock
  const handleRecordQuizAttempt = (
    topicTitle: string,
    score: number,
    total: number
  ) => {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    operationsService.recordQuizAttempt({
      categoryId: selectedCourseId,
      categoryName: `${BILINGUAL_COURSES[selectedCourseId].categoryBadge[language]} · ${topicTitle}`,
      score,
      totalQuestions: total,
      percentage: pct,
      staffName: userProfile?.name || 'Postal Candidate',
      testType: 'TOPIC_QUIZ',
      testTitle: topicTitle,
    });
  };

  const handleRecordMockScore = (
    testId: string,
    testTitle: string,
    score: number,
    totalMarks: number,
    percentage: number
  ) => {
    operationsService.recordQuizAttempt({
      categoryId: selectedCourseId,
      categoryName: `${testId} · ${testTitle}`,
      score,
      totalQuestions: totalMarks,
      percentage,
      staffName: userProfile?.name || 'Postal Candidate',
      testType: 'FULL_MOCK_TEST',
      testTitle,
    });
  };

  // Aggregate PYQs from all topics and mock tests
  const allTopicPyqs = courseModules.flatMap((m) =>
    m.topics.flatMap((t) =>
      t.topicQuiz
        .filter((q) => q.pyqTag)
        .map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          pyqTag: q.pyqTag,
          ruleClause: q.ruleClause || t.ruleReference,
          topicTitle: t.title,
        }))
    )
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8" id="postal-academy-view-root">
      {/* 1. Sleek Course Header & Entry Hero (with Single-Mode Language Toggle) */}
      <CourseHeaderHero
        selectedCourseId={selectedCourseId}
        onSelectCourse={(newId) => setSelectedCourseId(newId)}
        language={language}
        onToggleLanguage={(newLang) => setLanguage(newLang)}
        completedTopicsCount={completedTopicsCount}
        totalTopicsCount={totalTopicsInCourse}
        averageQuizScore={averageQuizScore}
      />

      {/* 2. Primary Academy Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Tab 1: Course Learning View */}
          <button
            type="button"
            onClick={() => setActiveTab('COURSE_LEARNING')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'COURSE_LEARNING'
                ? 'bg-red-700 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen size={16} />
            <span>{t.examSummaryTab}</span>
          </button>

          {/* Tab 2: Exam Practice Sets (3 Mocks) */}
          <button
            type="button"
            onClick={() => setActiveTab('EXAM_PRACTICE_SETS')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'EXAM_PRACTICE_SETS'
                ? 'bg-red-700 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Play size={16} />
            <span>{t.practiceSetsTab}</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
              3 Mocks
            </span>
          </button>

          {/* Tab 3: Academy Dashboard & Analytics */}
          <button
            type="button"
            onClick={() => setActiveTab('ACADEMY_DASHBOARD')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'ACADEMY_DASHBOARD'
                ? 'bg-red-700 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 size={16} />
            <span>{t.studentDashboard}</span>
          </button>

          {/* Tab 4: PYQ Vault */}
          <button
            type="button"
            onClick={() => setActiveTab('PYQ_VAULT')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'PYQ_VAULT'
                ? 'bg-red-700 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles size={16} />
            <span>{t.pyqVaultTab}</span>
            <span className="font-mono text-xs text-slate-500 font-bold">
              ({allTopicPyqs.length})
            </span>
          </button>
        </div>

        {/* Course Code Reference */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-600">
          <ShieldCheck size={14} className="text-red-700" />
          <span>{BILINGUAL_COURSES[selectedCourseId].code}</span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* VIEW 1: COURSE DETAIL & LEARNING VIEW (PREMIUM ACADEMY STYLE)        */}
      {/* ===================================================================== */}
      {activeTab === 'COURSE_LEARNING' && (
        <div className="space-y-8">
          {/* A. Dedicated Exam Information Section */}
          <ExamInfoCard courseId={selectedCourseId} language={language} />

          {/* B. Structured Section Divider & Accordion Chapters */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Layers className="text-red-700" size={22} />
                  <span>{t.curriculumSections}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Modular chapter breakdown with video lectures, statutory notes, formula callouts, and end-of-topic quizzes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs cursor-pointer"
                >
                  {t.expandAll}
                </button>
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs cursor-pointer"
                >
                  {t.collapseAll}
                </button>
              </div>
            </div>

            {/* Chapter Accordion List */}
            <div className="space-y-6">
              {courseModules.map((mod, modIdx) => {
                const isModOpen = Boolean(expandedModules[mod.id]);
                const completedInMod = mod.topics.filter((t) =>
                  operationsService.isTopicCompleted(t.id)
                ).length;
                const modProgressPct =
                  mod.topics.length > 0
                    ? Math.round((completedInMod / mod.topics.length) * 100)
                    : 0;

                return (
                  <div
                    key={mod.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition"
                  >
                    {/* Chapter Header */}
                    <div
                      onClick={() => toggleModuleAccordion(mod.id)}
                      className="p-5 sm:p-6 bg-gradient-to-r from-slate-50 via-white to-slate-50 hover:bg-slate-100/50 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-mono text-[11px] font-bold">
                            Chapter 0{modIdx + 1}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-red-50 text-red-800 border border-red-200 text-[11px] font-bold">
                            {mod.paper}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {mod.marksWeightage}
                          </span>
                        </div>

                        <h4 className="text-base sm:text-lg font-black text-slate-900">
                          {mod.subject}
                        </h4>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {mod.description}
                        </p>
                      </div>

                      {/* Chapter Progress & Accordion Caret */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-900 font-mono">
                            {completedInMod} / {mod.topics.length} Topics
                          </div>
                          <span className="text-[11px] font-bold text-emerald-600">
                            {modProgressPct}% Mastered
                          </span>
                        </div>

                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                          {isModOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>
                    </div>

                    {/* Chapter Body (When Expanded) */}
                    {isModOpen && (
                      <div className="p-5 sm:p-6 space-y-6">
                        {/* High-Yield Pointers Banner */}
                        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                              <Sparkles size={14} className="text-amber-600" />
                              <span>Statutory Revision Summary & Directorate PYQ Pointers</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setPrintableModule(mod)}
                              className="text-xs font-bold text-amber-900 underline hover:text-amber-950 cursor-pointer"
                            >
                              Print Chapter Sheet
                            </button>
                          </div>

                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-800 leading-relaxed pt-1">
                            {mod.studyNotesSummary.slice(0, 4).map((pt, pIdx) => (
                              <li key={pIdx} className="flex items-start gap-2 bg-white/70 p-2.5 rounded-xl border border-amber-200/50">
                                <span className="font-bold text-amber-700 shrink-0 font-mono">{pIdx + 1}.</span>
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Topics List with Multi-Format Tabs */}
                        <div className="space-y-4">
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Chapter Topics ({mod.topics.length})
                          </div>

                          {mod.topics.map((topic, topIdx) => {
                            const isTopicOpen = Boolean(expandedTopics[topic.id]);
                            const isCompleted = operationsService.isTopicCompleted(topic.id);

                            return (
                              <div
                                key={topic.id}
                                className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs"
                              >
                                {/* Topic Accordion Header */}
                                <div
                                  onClick={() => toggleTopicAccordion(topic.id)}
                                  className="p-4 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer flex items-center justify-between gap-3 border-b border-slate-100"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                        isCompleted
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-slate-200 text-slate-700 font-mono'
                                      }`}
                                    >
                                      {isCompleted ? <Check size={14} /> : topIdx + 1}
                                    </div>
                                    <div className="truncate">
                                      <h5 className="font-bold text-sm text-slate-900 truncate">
                                        {topic.title}
                                      </h5>
                                      <span className="text-[11px] text-slate-500 font-mono">
                                        {topic.ruleReference}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    {topic.pyqBadge && (
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 hidden sm:inline">
                                        {topic.pyqBadge}
                                      </span>
                                    )}

                                    <div className="text-slate-400">
                                      {isTopicOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                  </div>
                                </div>

                                {/* Topic Multi-Format Learning Tabs (Video, Notes, Quiz) */}
                                {isTopicOpen && (
                                  <div className="p-4 sm:p-5">
                                    <TopicMultiFormatViewer
                                      topic={topic}
                                      chapterTitle={mod.subject}
                                      language={language}
                                      isCompleted={isCompleted}
                                      onToggleComplete={() =>
                                        operationsService.toggleTopicCompleted(topic.id)
                                      }
                                      onRecordQuizAttempt={(score, total) =>
                                        handleRecordQuizAttempt(topic.title, score, total)
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: FULL-LENGTH EXAM PRACTICE SETS (3 MOCKS WITH TIMER & PALETTE) */}
      {/* ===================================================================== */}
      {activeTab === 'EXAM_PRACTICE_SETS' && (
        <ExamPracticeSetRunner
          language={language}
          onRecordMockScore={handleRecordMockScore}
        />
      )}

      {/* ===================================================================== */}
      {/* VIEW 3: STUDENT ACADEMY DASHBOARD & ANALYTICS                        */}
      {/* ===================================================================== */}
      {activeTab === 'ACADEMY_DASHBOARD' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-700">
                  Performance & Learning Analytics
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {t.studentDashboard}
                </h3>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
                Batch 2026-27 Active
              </span>
            </div>

            {/* 4 Stat Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">
                  Syllabus Mastered
                </span>
                <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                  {completedTopicsCount} <span className="text-xs text-slate-400">/ {totalTopicsInCourse}</span>
                </div>
                <span className="text-xs text-emerald-600 font-bold">
                  {Math.round((completedTopicsCount / Math.max(totalTopicsInCourse, 1)) * 100)}% Coverage
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">
                  Total Test Attempts
                </span>
                <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                  {quizAttempts.length}
                </div>
                <span className="text-xs text-slate-500 font-bold">Topic & Mock Tests</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">
                  Average Quiz Accuracy
                </span>
                <div className="text-2xl font-black font-mono text-amber-600 mt-1">
                  {averageQuizScore}%
                </div>
                <span className="text-xs text-emerald-600 font-bold">Above Cutoff (40%)</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">
                  Exam Readiness
                </span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  High
                </div>
                <span className="text-xs text-slate-500 font-bold">Targeting Merit List</span>
              </div>
            </div>

            {/* Test Attempt History Table */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Award size={16} className="text-amber-600" />
                  <span>Recent Quiz & Full Mock Test Attempts</span>
                </h4>
                <span className="text-xs text-slate-500 font-mono">
                  {quizAttempts.length} Records
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <th className="py-3 px-4 font-semibold">Test ID</th>
                      <th className="py-3 px-4 font-semibold">Exam Title / Topic</th>
                      <th className="py-3 px-4 font-semibold">Type</th>
                      <th className="py-3 px-4 font-semibold text-right">Score</th>
                      <th className="py-3 px-4 font-semibold text-right">Accuracy %</th>
                      <th className="py-3 px-4 font-semibold text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quizAttempts.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {att.id}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {att.categoryName}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              att.testType === 'FULL_MOCK_TEST'
                                ? 'bg-red-100 text-red-900 border border-red-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {att.testType === 'FULL_MOCK_TEST' ? 'Full Mock' : 'Topic Quiz'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {att.score} / {att.totalQuestions}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-emerald-700">
                          {att.percentage}%
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-400">
                          {att.completedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 4: PYQ VAULT (VERIFIED PREVIOUS YEARS' EXAM QUESTIONS)          */}
      {/* ===================================================================== */}
      {activeTab === 'PYQ_VAULT' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-red-700">
                Official Examination Repository
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                Previous Years' Question (PYQ) Vault
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tagged and verified question bank from recent Department of Posts promotion examinations with statutory rule citations.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold self-start sm:self-auto">
              {allTopicPyqs.length} Verified PYQs
            </span>
          </div>

          <div className="space-y-4">
            {allTopicPyqs.map((item, idx) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    Question #{idx + 1} · {item.topicTitle}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                      {item.ruleClause}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-red-700 text-white font-mono text-[10px] font-black">
                      {item.pyqTag}
                    </span>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-slate-900">{item.question}</h4>

                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-950 font-medium">
                  <strong>Official Correct Answer: </strong>
                  {item.options[item.correctIndex]}
                </div>

                <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                  <strong className="text-slate-900">Statutory Explanation: </strong>
                  {item.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Printable Revision Sheet Modal */}
      {printableModule && (
        <div className="fixed inset-0 bg-slate-950/75 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 border border-slate-300 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
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
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer size={14} />
                  <span>Print Document</span>
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
                  INDIA POST DEPARTMENTAL LDCE STUDY MATERIAL · {printableModule.paper}
                </div>
                <h2 className="text-lg font-black mt-0.5">{printableModule.subject}</h2>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Marks Weightage: {printableModule.marksWeightage}
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
                <div className="font-bold text-sm mb-2">2. Topic-Wise Statutory Breakdown</div>
                <div className="space-y-3">
                  {printableModule.topics.map((t, idx) => (
                    <div key={t.id} className="border border-slate-300 p-3.5 rounded space-y-1.5">
                      <div className="font-bold">
                        {idx + 1}. {t.title} ({t.ruleReference})
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
