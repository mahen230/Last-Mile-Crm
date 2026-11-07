import React from 'react';
import {
  GraduationCap,
  Award,
  Globe,
  Clock,
  BookOpen,
  CheckCircle2,
  UserCheck,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import {
  BILINGUAL_COURSES,
  BilingualCourseInfo,
  LanguageMode,
  UI_STRINGS,
} from '../../data/bilingualLmsData';

interface CourseHeaderHeroProps {
  selectedCourseId: string;
  onSelectCourse: (courseId: 'GDS_MTS' | 'GDS_POSTMAN' | 'GDS_PA_SA') => void;
  language: LanguageMode;
  onToggleLanguage: (lang: LanguageMode) => void;
  completedTopicsCount: number;
  totalTopicsCount: number;
  averageQuizScore: number;
}

export default function CourseHeaderHero({
  selectedCourseId,
  onSelectCourse,
  language,
  onToggleLanguage,
  completedTopicsCount,
  totalTopicsCount,
  averageQuizScore,
}: CourseHeaderHeroProps) {
  const course: BilingualCourseInfo =
    BILINGUAL_COURSES[selectedCourseId] || BILINGUAL_COURSES.GDS_MTS;
  const t = UI_STRINGS[language];

  const progressPercentage =
    totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden border border-slate-800">
      {/* Decorative Postal Stamp Watermark Background */}
      <div className="absolute right-0 top-0 bottom-0 w-96 pointer-events-none opacity-5 flex items-center justify-center overflow-hidden">
        <GraduationCap size={420} className="text-white transform translate-x-20 -rotate-12" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Top Control Bar: Course Selector & Single-Mode Language Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          {/* Course Switcher */}
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold hidden sm:inline">
              {t.activeCourse}:
            </span>
            <div className="relative">
              <select
                value={selectedCourseId}
                onChange={(e) =>
                  onSelectCourse(e.target.value as 'GDS_MTS' | 'GDS_POSTMAN' | 'GDS_PA_SA')
                }
                className="appearance-none bg-slate-800/90 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm pl-3 pr-8 py-2 rounded-xl border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer shadow-md"
              >
                <option value="GDS_MTS">Course 1: GDS → MTS (Paper I & II)</option>
                <option value="GDS_POSTMAN">Course 2: GDS → Postman / Mail Guard</option>
                <option value="GDS_PA_SA">Course 3: GDS → Postal Assistant (PA / SA)</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
            <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
              {course.categoryBadge[language]}
            </span>
          </div>

          {/* Clean Single-Mode Language Switcher (English | हिंदी) */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Globe size={15} className="text-slate-400" />
            <span className="text-xs text-slate-400 font-medium mr-1">{t.switchLang}:</span>
            <div className="inline-flex rounded-xl bg-slate-850 p-1 border border-slate-700 shadow-inner">
              <button
                type="button"
                onClick={() => onToggleLanguage('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-red-700 text-white shadow-sm ring-1 ring-red-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onToggleLanguage('hi')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'hi'
                    ? 'bg-red-700 text-white shadow-sm ring-1 ring-red-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>
        </div>

        {/* Hero Title & Description */}
        <div className="space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-red-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t.enrolledBadge}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">{t.batchInfo}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
            {course.title[language]}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            {course.subtitle[language]}
          </p>
        </div>

        {/* Instructor Profile & Progress Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 items-center">
          {/* Instructor Card (7 cols) */}
          <div className="md:col-span-7 flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-xs">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white font-black text-base shadow-lg shrink-0">
              {course.instructor.avatarText}
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  Lead Instructor
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <span className="text-[11px] text-slate-400 truncate">
                  {course.instructor.experience[language]}
                </span>
              </div>
              <h3 className="text-base font-bold text-white truncate">
                {course.instructor.name[language]}
              </h3>
              <p className="text-xs text-slate-300 truncate">
                {course.instructor.designation[language]}
              </p>
            </div>
          </div>

          {/* Progress Bar & Stats (5 cols) */}
          <div className="md:col-span-5 bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>{t.overallProgress}</span>
              </span>
              <span className="font-mono font-black text-white text-sm">
                {progressPercentage}%
              </span>
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>
                {completedTopicsCount} / {totalTopicsCount} {t.completedTopics}
              </span>
              <span>
                Avg. Score: <strong className="text-amber-300 font-mono">{averageQuizScore}%</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
