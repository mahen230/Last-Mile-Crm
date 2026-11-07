import React from 'react';
import {
  FileText,
  Clock,
  Award,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Scale,
} from 'lucide-react';
import {
  BILINGUAL_COURSES,
  BilingualCourseInfo,
  LanguageMode,
  UI_STRINGS,
} from '../../data/bilingualLmsData';

interface ExamInfoCardProps {
  courseId: string;
  language: LanguageMode;
}

export default function ExamInfoCard({ courseId, language }: ExamInfoCardProps) {
  const course: BilingualCourseInfo =
    BILINGUAL_COURSES[courseId] || BILINGUAL_COURSES.GDS_MTS;
  const exam = course.examInfo[language];
  const t = UI_STRINGS[language];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 uppercase tracking-wider">
            <Scale size={15} />
            <span>Directorate Statutory Notification</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {t.examInfoHeading}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-red-50 text-red-800 border border-red-200 rounded-full text-xs font-black">
            Official Blueprint
          </span>
        </div>
      </div>

      {/* 4 Core Exam Metric Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Marks */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            {t.totalMarks}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-slate-900">
              {exam.totalMarks}
            </span>
            <span className="text-xs text-slate-500 font-bold">Marks</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            {exam.totalQuestions} Questions total
          </span>
        </div>

        {/* Duration */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            {t.duration}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-slate-900">
              {exam.durationMinutes}
            </span>
            <span className="text-xs text-slate-500 font-bold">Minutes</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            {Math.floor(exam.durationMinutes / 60)}h {exam.durationMinutes % 60 ? `${exam.durationMinutes % 60}m` : ''} Exam window
          </span>
        </div>

        {/* Negative Marking */}
        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
            {t.negativeMarking}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-emerald-900">
              NIL (Zero)
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 block">
            No deduction for incorrect choices
          </span>
        </div>

        {/* Qualifying Criteria Summary */}
        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
            Min. Qualifying (UR)
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-amber-900">
              {exam.qualifyingCriteria[0]?.percentage || '40%'}
            </span>
          </div>
          <span className="text-[11px] text-amber-800 block">
            {exam.qualifyingCriteria[0]?.marksRequired || '40 Marks'}
          </span>
        </div>
      </div>

      {/* Pattern Summary Text */}
      <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl space-y-2 border border-slate-800">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
          {exam.paperTitle}
        </div>
        <p className="text-sm leading-relaxed text-slate-300">
          {exam.patternSummary}
        </p>
      </div>

      {/* Qualifying Thresholds Table & Statutory Rules */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
        {/* Category Cutoffs (5 cols) */}
        <div className="md:col-span-5 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-red-700" />
            <span>{t.qualifyingThresholds}</span>
          </h3>

          <div className="space-y-2">
            {exam.qualifyingCriteria.map((crit, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              >
                <span className="font-bold text-slate-800">{crit.category}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {crit.percentage}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    ({crit.marksRequired})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statutory Rule Boundaries (7 cols) */}
        <div className="md:col-span-7 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <FileText size={14} className="text-red-700" />
            <span>Statutory Manual References & Boundaries</span>
          </h3>

          <div className="space-y-2">
            {exam.statutoryRules.map((rule, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-700 leading-relaxed"
              >
                <CheckCircle2 size={15} className="text-red-700 shrink-0 mt-0.5" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
