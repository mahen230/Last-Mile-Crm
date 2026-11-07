import React, { useState } from 'react';
import {
  Video,
  FileText,
  HelpCircle,
  Play,
  Pause,
  Download,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  MessageSquare,
  Send,
  RotateCcw,
  Volume2,
  Maximize2,
  Award,
  ChevronRight,
  ShieldCheck,
  Lightbulb,
} from 'lucide-react';
import { LMSExtendedTopic, LMSTopicQuizQuestion } from '../../data/lmsMtsSyllabus';
import { LanguageMode, UI_STRINGS } from '../../data/bilingualLmsData';

interface TopicMultiFormatViewerProps {
  topic: LMSExtendedTopic;
  chapterTitle: string;
  language: LanguageMode;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onRecordQuizAttempt?: (score: number, total: number) => void;
}

type TabMode = 'VIDEO' | 'NOTES' | 'QUIZ';

export default function TopicMultiFormatViewer({
  topic,
  chapterTitle,
  language,
  isCompleted,
  onToggleComplete,
  onRecordQuizAttempt,
}: TopicMultiFormatViewerProps) {
  const [activeTab, setActiveTab] = useState<TabMode>('VIDEO');
  const t = UI_STRINGS[language];

  // --- 1. Video / Live Class State ---
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTimeSecs, setCurrentTimeSecs] = useState<number>(45);
  const totalDurationSecs = 18 * 60 + 30; // 18m 30s
  const [chatMessages, setChatMessages] = useState<
    { sender: string; role: 'student' | 'instructor'; text: string; time: string }[]
  >([
    {
      sender: 'Shri R.K. Meena (Faculty)',
      role: 'instructor',
      text:
        language === 'hi'
          ? 'नमस्ते अभ्यर्थियों! इस विषय के वैधानिक खंड 11 (फ्रैंकिंग) और नियम 55 (पोस्ट बॉक्स) से हर वर्ष कम से कम 2 प्रश्न पूछे जाते हैं।'
          : 'Welcome candidates! Pay close attention to Clause 11 (Franking) and Clause 55 (Post Box); 2+ questions appear every exam cycle.',
      time: '10:02 AM',
    },
    {
      sender: 'Govind Prasad (GDS BPM)',
      role: 'student',
      text:
        language === 'hi'
          ? 'सर, क्या पोस्ट बॉक्स में पार्सल का वितरण हो सकता है?'
          : 'Sir, can ordinary parcels be delivered via Post Box?',
      time: '10:08 AM',
    },
    {
      sender: 'Shri R.K. Meena (Faculty)',
      role: 'instructor',
      text:
        language === 'hi'
          ? 'नहीं! नियम 55 के अनुसार केवल पूर्ण प्रीपेड अपंजीकृत पत्र डाक वस्तुएं ही पोस्ट बॉक्स से वितरित होती हैं। पार्सल खिड़की से दिए जाते हैं।'
          : 'No! Under Clause 55, only fully prepaid unregistered letter mail articles can be delivered via Post Box. Parcels require window delivery.',
      time: '10:10 AM',
    },
  ]);
  const [newChatText, setNewChatText] = useState('');

  // --- 2. Notes & PDF State ---
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // --- 3. Topic Quiz State ---
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);

  // Handle Video Chat Post
  const handlePostChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;
    const studentMsg = {
      sender: 'You (Candidate)',
      role: 'student' as const,
      text: newChatText.trim(),
      time: 'Just now',
    };
    setChatMessages((prev) => [...prev, studentMsg]);
    setNewChatText('');

    // Simulated instructor reply
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'Faculty Assistant (Desk)',
          role: 'instructor',
          text:
            language === 'hi'
              ? 'उत्कृष्ट प्रश्न! आपका उत्तर डाकघर गाइड भाग I के नियम पृष्ठ पर अपडेट कर दिया गया है।'
              : 'Spot-on inquiry! This rule is highlighted in the study notes tab below.',
          time: 'Just now',
        },
      ]);
    }, 1200);
  };

  // Handle Quiz Submission
  const handleQuizSubmit = () => {
    let correctCount = 0;
    topic.topicQuiz.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });
    setIsQuizSubmitted(true);
    if (onRecordQuizAttempt) {
      onRecordQuizAttempt(correctCount, topic.topicQuiz.length);
    }
    // Auto-mark topic completed if passed ≥ 60%
    const pct = topic.topicQuiz.length > 0 ? (correctCount / topic.topicQuiz.length) * 100 : 0;
    if (pct >= 60 && !isCompleted) {
      onToggleComplete();
    }
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setIsQuizSubmitted(false);
  };

  // Copy Study Notes
  const handleCopyStudyNotes = () => {
    const textToCopy = `=== ${topic.title} ===\nRule: ${topic.ruleReference}\n\nKey Points:\n${topic.keyPoints
      .map((kp) => '• ' + kp)
      .join('\n')}\n\nDetailed Clauses:\n${topic.detailedTheory
      .map((sec) => `[${sec.clauseRef}] ${sec.heading}:\n${sec.bullets.map((b) => '  - ' + b).join('\n')}`)
      .join('\n\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Segmented Multi-Format Learning Tabs (Video, Notes, Quiz) */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 pt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('VIDEO')}
            className={`px-3 sm:px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'VIDEO'
                ? 'border-red-700 text-red-700 bg-red-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Video size={16} />
            <span>{t.modeVideo}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('NOTES')}
            className={`px-3 sm:px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'NOTES'
                ? 'border-red-700 text-red-700 bg-red-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText size={16} />
            <span>{t.modeNotes}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('QUIZ')}
            className={`px-3 sm:px-4 py-2.5 rounded-t-xl font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'QUIZ'
                ? 'border-red-700 text-red-700 bg-red-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HelpCircle size={16} />
            <span>{t.modeQuiz}</span>
            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 font-mono text-[10px] rounded-full">
              {topic.topicQuiz.length}
            </span>
          </button>
        </div>

        {/* Completion Toggle */}
        <button
          type="button"
          onClick={onToggleComplete}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
            isCompleted
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 size={15} className={isCompleted ? 'text-emerald-600' : 'text-slate-400'} />
          <span>{isCompleted ? t.completed : t.markCompleted}</span>
        </button>
      </div>

      {/* Tab 1: Video / Live Class Section */}
      {activeTab === 'VIDEO' && (
        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Video Player Canvas (8 cols) */}
            <div className="lg:col-span-8 space-y-3">
              <div className="relative w-full aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex flex-col justify-between p-4 sm:p-6 text-white group">
                {/* Top Overlay Badge */}
                <div className="flex items-center justify-between text-xs z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="font-black text-amber-300 uppercase tracking-wider text-[11px]">
                      {t.liveStreamSimulation}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
                      1080p HD Postal Stream
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-white/10 backdrop-blur-xs text-[10px] font-mono">
                    {topic.ruleReference}
                  </span>
                </div>

                {/* Center Lecture Visual Mockup */}
                <div className="flex flex-col items-center justify-center text-center space-y-3 my-auto z-10 py-4">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-16 h-16 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center shadow-2xl transition transform group-hover:scale-110 cursor-pointer"
                  >
                    {isPlaying ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
                  </button>
                  <div className="max-w-md space-y-1">
                    <h4 className="font-bold text-white text-sm sm:text-base">{topic.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {topic.keyPoints[0] || 'Official postal regulation lecture and case studies'}
                    </p>
                  </div>
                </div>

                {/* Bottom Control Bar */}
                <div className="space-y-2 z-10 bg-slate-950/80 p-2.5 rounded-xl backdrop-blur-xs border border-white/10">
                  {/* Progress Scrubber */}
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden cursor-pointer">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{
                        width: `${(currentTimeSecs / totalDurationSecs) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="hover:text-white cursor-pointer font-bold"
                      >
                        {isPlaying ? 'Pause' : 'Play'}
                      </button>
                      <span className="font-mono text-[11px] text-slate-400">
                        {formatSecs(currentTimeSecs)} / {formatSecs(totalDurationSecs)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{t.speed}:</span>
                      {[1, 1.25, 1.5, 2].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => setPlaybackSpeed(spd)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                            playbackSpeed === spd
                              ? 'bg-red-600 text-white font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lecture Highlights Summary Bar */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500 shrink-0" />
                  <span className="font-bold text-slate-900">High-Yield Video Coverage:</span>
                  <span className="text-slate-600">
                    Clauses cited directly from official Postal Manual Volume V & PO Guide Part I.
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-500 font-bold shrink-0">
                  {topic.pyqBadge || 'PYQ Ready'}
                </span>
              </div>
            </div>

            {/* Live Classroom Q&A & Discussion Stream (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col h-[380px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-red-700" />
                  <span>{t.classroomChat}</span>
                </h4>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 text-xs">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border leading-relaxed ${
                      msg.role === 'instructor'
                        ? 'bg-red-50/70 border-red-200 text-red-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold pb-1">
                      <span className={msg.role === 'instructor' ? 'text-red-700' : 'text-slate-600'}>
                        {msg.sender}
                      </span>
                      <span className="text-slate-400 font-mono">{msg.time}</span>
                    </div>
                    <p>{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handlePostChat} className="pt-2 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={newChatText}
                  onChange={(e) => setNewChatText(e.target.value)}
                  placeholder={t.postQuestion}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600"
                />
                <button
                  type="submit"
                  className="p-2 bg-red-700 hover:bg-red-800 text-white rounded-xl cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Notes & PDF Section */}
      {activeTab === 'NOTES' && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Action Toolbar (Copy, Print, Download) */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-sm text-slate-900">{topic.title}</h3>
              <p className="text-xs text-slate-500">{topic.ruleReference} • {topic.pyqBadge || 'Statutory Notes'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyStudyNotes}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copySuccess ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copySuccess ? 'Copied Notes!' : 'Copy Text'}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer size={14} />
                <span>{t.printNotes}</span>
              </button>
            </div>
          </div>

          {/* Important Notes / Key Highlights Callout Boxes */}
          <div className="bg-gradient-to-r from-amber-50 via-amber-50/70 to-red-50 p-5 rounded-2xl border border-amber-300 space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-700 shrink-0" />
              <h4 className="font-black text-xs uppercase tracking-wider text-amber-950">
                {t.importantHighlights}
              </h4>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-800">
              {topic.keyPoints.map((kp, idx) => (
                <li
                  key={idx}
                  className="bg-white/80 p-3 rounded-xl border border-amber-200/60 flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{kp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Comprehensive Detailed Theory & Statutory Clauses */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-red-700" />
              <span>Clause-by-Clause Statutory Analysis</span>
            </h4>

            <div className="space-y-6">
              {topic.detailedTheory.map((sec, idx) => (
                <div key={idx} className="space-y-2 border-l-2 border-red-700 pl-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900">
                      {sec.heading}
                    </h5>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {sec.clauseRef}
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
                    {sec.bullets.map((b, bi) => (
                      <li key={bi} className="flex items-start gap-2">
                        <span className="text-red-600 font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {sec.pyqHighlight && (
                    <div className="mt-2 bg-red-50 p-2.5 rounded-xl border border-red-200 text-xs text-red-900 font-medium flex items-center gap-2">
                      <Sparkles size={14} className="text-red-700 shrink-0" />
                      <span>{sec.pyqHighlight}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Topic-Wise Quiz */}
      {activeTab === 'QUIZ' && (
        <div className="p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {topic.title} · {t.modeQuiz}
              </h3>
              <p className="text-xs text-slate-500">
                {topic.topicQuiz.length} Official Questions • Target Pass Score: ≥ 60%
              </p>
            </div>

            {isQuizSubmitted && (
              <button
                type="button"
                onClick={handleResetQuiz}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <RotateCcw size={14} />
                <span>{t.resetQuiz}</span>
              </button>
            )}
          </div>

          {/* Questions List */}
          <div className="space-y-5">
            {topic.topicQuiz.map((q, qIndex) => {
              const selectedOpt = userAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = isAnswered && selectedOpt === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-2xl border p-5 space-y-4 transition ${
                    isQuizSubmitted
                      ? isCorrect
                        ? 'border-emerald-300 bg-emerald-50/20'
                        : 'border-red-300 bg-red-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono text-xs font-black flex items-center justify-center shrink-0">
                        {qIndex + 1}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-relaxed">
                        {q.question}
                      </h4>
                    </div>

                    {q.pyqTag && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap shrink-0">
                        {q.pyqTag}
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-2 pl-8">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedOpt === optIdx;
                      let optClass =
                        'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800';

                      if (isQuizSubmitted) {
                        if (optIdx === q.correctIndex) {
                          optClass =
                            'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-400/40';
                        } else if (isSelected) {
                          optClass =
                            'border-red-500 bg-red-50 text-red-950 font-bold ring-2 ring-red-400/40';
                        }
                      } else if (isSelected) {
                        optClass = 'border-red-700 bg-red-50 text-red-950 font-bold';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isQuizSubmitted}
                          onClick={() =>
                            setUserAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                          }
                          className={`w-full p-3 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${optClass}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isQuizSubmitted && optIdx === q.correctIndex && (
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {isQuizSubmitted && (
                    <div className="pl-8 pt-2">
                      <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl text-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                          {t.explanation} ({q.ruleClause || topic.ruleReference}):
                        </span>
                        <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quiz Footer & Submission */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              Answered: <strong className="text-slate-900">{Object.keys(userAnswers).length}</strong> / {topic.topicQuiz.length} questions
            </div>

            {!isQuizSubmitted ? (
              <button
                type="button"
                onClick={handleQuizSubmit}
                disabled={Object.keys(userAnswers).length === 0}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-md transition cursor-pointer"
              >
                {t.submitAnswer}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">
                  {t.score}:{' '}
                  <strong className="text-red-700 font-mono text-sm">
                    {
                      topic.topicQuiz.filter(
                        (q) => userAnswers[q.id] === q.correctIndex
                      ).length
                    }{' '}
                    / {topic.topicQuiz.length}
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  {t.resetQuiz}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
