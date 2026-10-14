import { useCallback, useEffect, useState } from 'react';
import { Clock3, Pause, Play, RotateCcw, SkipForward, Timer } from 'lucide-react';
import { playChimeSound } from './audio.js';
import {
  EXAM_DATE,
  STUDY_START_DATE,
  formatStudyDate,
  formatStudyDuration,
  getLastStudyDate,
  getStudyMilliseconds
} from './studyHours.js';
import useStudyTimer from './useStudyTimer.js';

const TimerModeButton = ({ active, disabled, onClick, children }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
      active
        ? 'bg-[#D4AF72] text-[#0B0B0F] shadow-lg shadow-[#D4AF72]/20'
        : 'text-[#A6A3A0] hover:bg-[#20202A] hover:text-[#F5F0E8]'
    }`}
  >
    {children}
  </button>
);

export default function StudyTimer({
  canTrackToday,
  todayKey,
  settings,
  onStudyDataChange,
  onRegisterManualEdit,
  onRegisterReset,
  onRegisterDataRestore
}) {
  const onPomodoroComplete = useCallback(() => {
    if (settings.soundEnabled) playChimeSound();
  }, [settings.soundEnabled]);
  const studyClock = useStudyTimer(settings, onPomodoroComplete);
  const [selectedSubject, setSelectedSubject] = useState('Physics');
  useEffect(() => onStudyDataChange(studyClock.studyData), [onStudyDataChange, studyClock.studyData]);
  useEffect(() => onRegisterManualEdit(studyClock.setStudyDuration), [onRegisterManualEdit, studyClock.setStudyDuration]);
  useEffect(() => onRegisterReset(studyClock.clearStudyData), [onRegisterReset, studyClock.clearStudyData]);
  useEffect(() => onRegisterDataRestore(studyClock.replaceStudyData), [onRegisterDataRestore, studyClock.replaceStudyData]);

  const { timer, elapsedMs, remainingMs, formattedStopwatch } = studyClock;
  const isNormal = timer.mode === 'normal';
  const totalDuration = (
    timer.phase === 'focus' ? settings.focusTime
      : timer.phase === 'shortBreak' ? settings.shortBreakTime
        : settings.longBreakTime
  ) * 60000;
  const phaseLabel = timer.phase === 'focus'
    ? 'FOCUS'
    : timer.phase === 'shortBreak' ? 'SHORT BREAK' : 'LONG BREAK';
  const todayTotal = getStudyMilliseconds(studyClock.studyData[todayKey]);
  const isModeLocked = timer.running || !canTrackToday;
  const progress = totalDuration > 0 ? Math.max(0, Math.min(1, remainingMs / totalDuration)) : 0;
  const ringColor = timer.phase === 'focus'
    ? '#D4AF72'
    : timer.phase === 'shortBreak' ? '#75B798' : '#A98543';

  if (!canTrackToday) {
    const isExamDay = todayKey === EXAM_DATE;
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF72]">
            {isExamDay ? 'Admission countdown' : 'Study tracking dates'}
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#F5F0E8]">Study timer</h2>
        </div>
        <div className="rounded-3xl border border-[#A98543]/30 bg-gradient-to-r from-[#D4AF72]/[0.13] via-[#20202A]/[0.12] to-[#A98543]/[0.1] p-6 sm:p-8">
          {isExamDay ? (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#A98543]">
                {formatStudyDate(EXAM_DATE, { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
              <h3 className="mt-2 text-xl font-extrabold text-[#F5F0E8]">Exam: University of Dhaka</h3>
              <p className="mt-2 text-sm text-[#D4AF72]">Study timers are unavailable on exam day.</p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-[#F5F0E8]">
                Study tracking runs {formatStudyDate(STUDY_START_DATE, { month: 'long', day: 'numeric' })} through {formatStudyDate(getLastStudyDate(), { month: 'long', day: 'numeric', year: 'numeric' })}.
              </p>
              <p className="mt-2 text-sm text-[#D4AF72]">Study timers are unavailable outside the tracking dates.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF72]">Make today count</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#F5F0E8]">Study timer</h2>
          <p className="mt-2 text-sm text-[#A6A3A0]">Time from finished study sessions is added to your daily log.</p>
        </div>
        <div className="rounded-2xl border border-[#D4AF72]/20 bg-[#D4AF72]/[0.06] px-4 py-3">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#A6A3A0]">
            {formatStudyDate(todayKey, { month: 'long', day: 'numeric' })} total
          </span>
          <span className="mt-1 block font-mono text-xl font-bold text-[#D4AF72]">
            {formatStudyDuration(todayTotal)}
          </span>
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-[#303039] bg-[#15151C]/90 p-5 shadow-2xl shadow-black/20 sm:p-8">
        <div className="mb-8 flex gap-2 rounded-2xl border border-[#303039] bg-[#0B0B0F] p-1.5">
          <TimerModeButton
            active={isNormal}
            disabled={isModeLocked}
            onClick={() => studyClock.setMode('normal')}
          >
            Normal timer
          </TimerModeButton>
          <TimerModeButton
            active={!isNormal}
            disabled={isModeLocked}
            onClick={() => studyClock.setMode('pomodoro')}
          >
            Pomodoro
          </TimerModeButton>
        </div>
        <p className="-mt-5 mb-6 text-center text-[11px] text-[#A6A3A0]">
          Switching timer modes resets the current timer.
        </p>

        {isNormal ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4AF72]/10 text-[#D4AF72]">
              <Clock3 className="h-8 w-8" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF72]">
              {timer.running ? 'STUDY SESSION IN PROGRESS' : 'STOPWATCH'}
            </p>
            <p className="mt-4 font-mono text-5xl font-extrabold tracking-tight text-[#F5F0E8] sm:text-7xl" aria-live="off">
              {formattedStopwatch}
            </p>
            <p className="mt-3 text-sm text-[#A6A3A0]">
              {timer.running ? 'Pause any time; stop to save this session.' : 'Your time is only added when you stop.'}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {!timer.running ? (
                <button
                  type="button"
                  disabled={!canTrackToday}
                  onClick={studyClock.start}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF72] px-6 py-3 font-bold text-[#0B0B0F] shadow-lg shadow-[#D4AF72]/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Play className="h-4 w-4 fill-current" />
                  {elapsedMs > 0 || timer.normalSegments.length > 0 ? 'Resume' : 'Start'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={studyClock.pause}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF72] px-6 py-3 font-bold text-[#0B0B0F] shadow-lg shadow-[#D4AF72]/20 transition hover:brightness-110"
                >
                  <Pause className="h-4 w-4 fill-current" />
                  Pause
                </button>
              )}
              <button
                type="button"
                disabled={!canTrackToday || (elapsedMs === 0 && timer.normalSegments.length === 0)}
                onClick={studyClock.stop}
                className="rounded-xl border border-[#D4AF72]/30 bg-[#D4AF72]/10 px-5 py-3 font-bold text-[#D4AF72] transition hover:bg-[#D4AF72]/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Stop & save
              </button>
              <button
                type="button"
                disabled={!canTrackToday}
                onClick={studyClock.reset}
                className="inline-flex items-center gap-2 rounded-xl border border-[#303039] px-4 py-3 font-semibold text-[#A6A3A0] transition hover:border-[#D4AF72]/30 hover:text-[#F5F0E8] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6">
              <span className="mb-2 block text-xs text-[#A6A3A0]">Focusing on</span>
              <div className="flex flex-wrap justify-center gap-2">
                {['Physics', 'Chemistry', 'Higher Mathematics'].map((subject) => (
                  <button
                    type="button"
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                      selectedSubject === subject
                        ? 'border-[#D4AF72] bg-[#20202A] text-[#F5F0E8]'
                        : 'border-[#303039] text-[#A6A3A0] hover:text-[#A6A3A0]'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {[
                ['focus', `Focus · ${settings.focusTime}m`],
                ['shortBreak', `Short break · ${settings.shortBreakTime}m`],
                ['longBreak', `Long break · ${settings.longBreakTime}m`]
              ].map(([phase, label]) => (
                <button
                  type="button"
                  key={phase}
                  disabled={!canTrackToday || timer.running}
                  onClick={() => studyClock.setPhase(phase)}
                  className={`rounded-full border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    timer.phase === phase
                      ? 'border-[#D4AF72]/40 bg-[#D4AF72]/10 text-[#D4AF72]'
                      : 'border-[#303039] text-[#A6A3A0] hover:border-[#A98543]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div
              className="relative mx-auto my-4 flex h-64 w-64 items-center justify-center rounded-full sm:h-72 sm:w-72"
              role="timer"
              aria-label={`${phaseLabel.toLowerCase()} timer`}
            >
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#303039" strokeWidth="5" />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke={ringColor}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={276.46}
                  strokeDashoffset={276.46 * (1 - progress)}
                  className="transition-[stroke-dashoffset] duration-500"
                />
              </svg>
              <div>
                <p className="font-mono text-5xl font-extrabold tracking-tight text-[#F5F0E8] sm:text-6xl">
                  {String(Math.floor(remainingMs / 60000)).padStart(2, '0')}:
                  {String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0')}
                </p>
                <p className="mt-3 text-xs font-extrabold tracking-[0.25em]" style={{ color: ringColor }}>
                  {phaseLabel}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-[#A6A3A0]">
              Focus time is saved when a focus period completes. Breaks never count as study time.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {!timer.running ? (
                <button
                  type="button"
                  disabled={!canTrackToday}
                  onClick={studyClock.start}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF72] px-6 py-3 font-bold text-[#0B0B0F] shadow-lg shadow-[#D4AF72]/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Play className="h-4 w-4 fill-current" />
                  {remainingMs < totalDuration ? 'Resume' : 'Start'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={studyClock.pause}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#D4AF72] px-6 py-3 font-bold text-[#0B0B0F] shadow-lg shadow-[#D4AF72]/20 transition hover:brightness-110"
                >
                  <Pause className="h-4 w-4 fill-current" />
                  Pause
                </button>
              )}
              <button
                type="button"
                disabled={!canTrackToday}
                onClick={studyClock.skip}
                className="inline-flex items-center gap-2 rounded-xl border border-[#303039] px-5 py-3 font-semibold text-[#A6A3A0] transition hover:border-[#D4AF72]/30 hover:text-[#F5F0E8] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <SkipForward className="h-4 w-4" />
                Skip
              </button>
              <button
                type="button"
                disabled={!canTrackToday}
                onClick={studyClock.reset}
                className="inline-flex items-center gap-2 rounded-xl border border-[#303039] px-4 py-3 font-semibold text-[#A6A3A0] transition hover:border-[#D4AF72]/30 hover:text-[#F5F0E8] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
            <p className="mt-5 inline-flex items-center gap-2 text-xs text-[#A6A3A0]">
              <Timer className="h-3.5 w-3.5" />
              Focus sessions completed: <strong className="text-[#F5F0E8]">{timer.sessionsCompleted}</strong>
              <span>·</span>
              Long break every {settings.longBreakInterval} focus sessions
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
