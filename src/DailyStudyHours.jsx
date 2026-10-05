import { useMemo, useState } from 'react';
import { CalendarDays, Check, Clock3, GraduationCap, Pencil, Sparkles, X } from 'lucide-react';
import {
  EXAM_DATE,
  STUDY_START_DATE,
  formatStudyDate,
  formatStudyDuration,
  getLastStudyDate,
  getStudyDates,
  getStudyMilliseconds
} from './studyHours.js';

const STUDY_DATES = getStudyDates();
const MINUTE = 60000;
const HOURS_IN_MILLISECOND = 3600000;

const formatStudyHours = (milliseconds) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })
    .format(Math.round((milliseconds / HOURS_IN_MILLISECOND) * 10) / 10);

const StatCard = ({ label, value, detail, icon: Icon, accent = 'text-[#FDA4AF]' }) => (
  <div className="rounded-2xl border border-[#2a222b] bg-[#151118]/90 p-4 sm:p-5">
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold text-[#94A3B8]">{label}</span>
      <span className={`rounded-xl bg-white/[0.04] p-2 ${accent}`}>
        <Icon className="h-4 w-4" />
      </span>
    </div>
    <p className="mt-3 text-2xl font-extrabold tracking-tight text-white">{value}</p>
    {detail && <p className="mt-1 text-xs text-[#64748B]">{detail}</p>}
  </div>
);

function StudyDurationEditor({ dateKey, currentMilliseconds, onSave, onCancel }) {
  const [editMode, setEditMode] = useState('set');
  const [hours, setHours] = useState(String(Math.floor(currentMilliseconds / 3600000)));
  const [minutes, setMinutes] = useState(String(Math.floor(currentMilliseconds / MINUTE) % 60));
  const enteredMinutes = Number(minutes);
  const enteredHours = Number(hours);
  const valid = hours !== ''
    && minutes !== ''
    && Number.isInteger(enteredHours)
    && enteredHours >= 0
    && enteredHours <= 999
    && Number.isInteger(enteredMinutes)
    && enteredMinutes >= 0
    && enteredMinutes <= 59;

  const save = (event) => {
    event.preventDefault();
    if (!valid) return;
    const enteredMilliseconds = (enteredHours * 60 + enteredMinutes) * MINUTE;
    const nextMilliseconds = editMode === 'set'
      ? enteredMilliseconds
      : editMode === 'add'
        ? currentMilliseconds + enteredMilliseconds
        : Math.max(0, currentMilliseconds - enteredMilliseconds);
    onSave(dateKey, nextMilliseconds);
  };

  return (
    <form
      onSubmit={save}
      className="mt-4 rounded-2xl border border-[#FB7185]/20 bg-[#100d12] p-4"
      aria-label={`Edit study time for ${formatStudyDate(dateKey, { month: 'long', day: 'numeric' })}`}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {[
          ['set', 'Set total'],
          ['add', 'Add time'],
          ['subtract', 'Subtract time']
        ].map(([mode, label]) => (
          <button
            type="button"
            key={mode}
            onClick={() => {
              setEditMode(mode);
              if (mode !== 'set') {
                setHours('0');
                setMinutes('0');
              }
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
              editMode === mode
                ? 'bg-[#FB7185]/15 text-[#FDA4AF]'
                : 'bg-white/[0.03] text-[#94A3B8] hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs font-medium text-[#94A3B8]">
          Hours
          <input
            type="number"
            min="0"
            max="999"
            step="1"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[#302733] bg-[#151118] px-3 py-2.5 text-sm text-white outline-none focus:border-[#FB7185]"
          />
        </label>
        <label className="text-xs font-medium text-[#94A3B8]">
          Minutes
          <input
            type="number"
            min="0"
            max="59"
            step="1"
            value={minutes}
            onChange={(event) => setMinutes(event.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[#302733] bg-[#151118] px-3 py-2.5 text-sm text-white outline-none focus:border-[#FB7185]"
          />
        </label>
      </div>

      {!valid && <p className="mt-2 text-xs text-[#FDA4AF]">Enter whole hours and minutes from 0 to 59.</p>}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#94A3B8] hover:bg-white/[0.04] hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={!valid}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#FB7185] px-3.5 py-2 text-xs font-bold text-[#170f13] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
          Save time
        </button>
      </div>
    </form>
  );
}

export default function DailyStudyHours({
  studyData,
  onSetStudyDuration,
  dailyGoalMinutes,
  onSetDailyGoalMinutes,
  studyGoalHours,
  onSetStudyGoalHours,
  todayKey
}) {
  const [editingDate, setEditingDate] = useState(null);
  const [goalInputState, setGoalInputState] = useState({
    goal: studyGoalHours,
    value: String(studyGoalHours)
  });
  const studyGoalInput = goalInputState.goal === studyGoalHours
    ? goalInputState.value
    : String(studyGoalHours);

  const lastStudyDate = getLastStudyDate();
  const trackingDatesElapsed = todayKey < STUDY_DATES[0]
    ? 0
    : STUDY_DATES.filter((dateKey) => dateKey <= todayKey).length;

  const totals = useMemo(() => {
    const dayTotals = STUDY_DATES.map((dateKey) => ({
      dateKey,
      milliseconds: getStudyMilliseconds(studyData[dateKey])
    }));
    const totalMilliseconds = dayTotals.reduce((total, day) => total + day.milliseconds, 0);
    const daysStudied = dayTotals.filter((day) => day.milliseconds > 0).length;
    const bestDay = dayTotals.reduce(
      (best, day) => day.milliseconds > best.milliseconds ? day : best,
      { dateKey: null, milliseconds: 0 }
    );
    return {
      totalMilliseconds,
      daysStudied,
      bestDay,
      averageMilliseconds: trackingDatesElapsed > 0
        ? totalMilliseconds / trackingDatesElapsed
        : 0
    };
  }, [studyData, trackingDatesElapsed]);

  const daysUntilExam = Math.max(
    0,
    Math.ceil(
      (Date.parse(`${EXAM_DATE}T00:00:00Z`) - Date.parse(`${todayKey}T00:00:00Z`)) / 86400000
    )
  );
  const goalMilliseconds = dailyGoalMinutes * MINUTE;
  const completedStudyHours = totals.totalMilliseconds / HOURS_IN_MILLISECOND;
  const overallProgress = completedStudyHours / studyGoalHours;
  const overallPercentage = Math.round(overallProgress * 100);
  const progressRingCount = Math.min(Math.max(1, Math.ceil(overallProgress)), 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#FB7185]">Your admission countdown</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Daily Study Hours</h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-[#94A3B8]">
            <CalendarDays className="h-4 w-4 text-[#FDA4AF]" />
            {formatStudyDate(STUDY_START_DATE, { month: 'long', day: 'numeric' })} — {formatStudyDate(lastStudyDate, { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <label className="w-full rounded-2xl border border-[#2a222b] bg-[#151118]/90 p-3.5 sm:w-56">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
            Daily goal <span className="normal-case tracking-normal text-[#64748B]">(optional)</span>
          </span>
          <span className="mt-1.5 flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={dailyGoalMinutes ? dailyGoalMinutes / 60 : ''}
              onChange={(event) => {
                const hours = Number(event.target.value);
                onSetDailyGoalMinutes(
                  event.target.value === '' || !Number.isFinite(hours) ? 0 : Math.max(0, Math.min(1440, Math.round(hours * 60)))
                );
              }}
              placeholder="Set hours"
              className="w-full bg-transparent text-lg font-bold text-white outline-none placeholder:text-[#64748B]"
              aria-label="Daily study goal in hours"
            />
            <span className="text-xs text-[#64748B]">hours</span>
          </span>
        </label>
      </div>

      <section className="grid grid-cols-1 items-center gap-5 rounded-3xl border border-[#FB7185]/20 bg-gradient-to-br from-[#1b141c] via-[#151118] to-[#171117] p-5 shadow-xl shadow-black/20 sm:grid-cols-[1fr_auto] sm:gap-8 sm:p-7">
        <div className="order-2 sm:order-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FB7185]">Overall study progress</p>
          <h3 className="mt-2 text-xl font-extrabold text-white sm:text-2xl">Your hours, adding up</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[#94A3B8]">
            Timer sessions and manually adjusted study time both count toward this goal.
          </p>
          <label className="mt-5 block w-full max-w-xs rounded-2xl border border-[#302733] bg-[#100d12]/80 p-3.5">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Overall study-hour goal
            </span>
            <span className="mt-1.5 flex items-center gap-2">
              <input
                type="number"
                min="0.1"
                step="any"
                value={studyGoalInput}
                onChange={(event) => {
                  const value = event.target.value;
                  setGoalInputState({ goal: studyGoalHours, value });
                  const hours = Number(value);
                  if (value !== '' && Number.isFinite(hours) && hours > 0) {
                    onSetStudyGoalHours(hours);
                  }
                }}
                onBlur={() => setGoalInputState({ goal: studyGoalHours, value: String(studyGoalHours) })}
                className="w-full bg-transparent text-lg font-bold text-white outline-none placeholder:text-[#64748B]"
                aria-label="Overall study-hour goal"
              />
              <span className="text-xs text-[#64748B]">hours</span>
            </span>
          </label>
        </div>

        <div
          className="relative order-1 mx-auto h-48 w-48 sm:order-2 sm:mx-0 sm:h-52 sm:w-52"
          role="img"
          aria-label={`${overallPercentage}% of study-hour goal completed: ${formatStudyHours(totals.totalMilliseconds)} of ${formatStudyHours(studyGoalHours * HOURS_IN_MILLISECOND)} hours`}
        >
          <svg className="h-full w-full -rotate-90 overflow-visible" viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <linearGradient id="study-progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FB7185" />
                <stop offset="100%" stopColor="#FDBA74" />
              </linearGradient>
            </defs>
            {Array.from({ length: progressRingCount }, (_, index) => {
              const radius = 84 - index * 12;
              const circumference = 2 * Math.PI * radius;
              const ringProgress = Math.min(1, Math.max(0, overallProgress - index));
              return (
                <g key={index}>
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="#302733"
                    strokeWidth="8"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="none"
                    stroke="url(#study-progress-gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - ringProgress)}
                    className="transition-[stroke-dashoffset] duration-700 ease-out"
                  />
                </g>
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold tracking-tight text-white sm:text-[2.65rem]">
              {overallPercentage}%
            </span>
            <span className="mt-1 max-w-[8.5rem] text-xs font-semibold leading-snug text-[#FDA4AF]">
              {formatStudyHours(totals.totalMilliseconds)} / {formatStudyHours(studyGoalHours * HOURS_IN_MILLISECOND)} hours
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total study time"
          value={formatStudyDuration(totals.totalMilliseconds)}
          detail={`${totals.daysStudied} days with study time`}
          icon={Clock3}
        />
        <StatCard
          label="Average per day"
          value={formatStudyDuration(totals.averageMilliseconds)}
          detail={`Across ${trackingDatesElapsed} elapsed tracking ${trackingDatesElapsed === 1 ? 'day' : 'days'}`}
          icon={Sparkles}
          accent="text-[#FDBA74]"
        />
        <StatCard
          label="Best study day"
          value={formatStudyDuration(totals.bestDay.milliseconds)}
          detail={totals.bestDay.dateKey
            ? formatStudyDate(totals.bestDay.dateKey, { month: 'short', day: 'numeric' })
            : 'Your first session is waiting'}
          icon={CalendarDays}
          accent="text-[#A78BFA]"
        />
        <StatCard
          label="Days until exam"
          value={String(daysUntilExam)}
          detail={`${trackingDatesElapsed} of ${STUDY_DATES.length} study days elapsed`}
          icon={GraduationCap}
          accent="text-[#34D399]"
        />
      </div>

      <section className="rounded-3xl border border-[#2a222b] bg-[#151118]/90 p-4 sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Your study timeline</h3>
            <p className="mt-1 text-xs text-[#64748B]">Select any day to set, add, or subtract study time.</p>
          </div>
          <span className="text-xs font-semibold text-[#64748B]">
            {formatStudyDate(STUDY_DATES[0], { month: 'short', day: 'numeric' })} – {formatStudyDate(lastStudyDate, { month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="space-y-2">
          {STUDY_DATES.map((dateKey, index) => {
            const milliseconds = getStudyMilliseconds(studyData[dateKey]);
            const progress = goalMilliseconds > 0
              ? Math.min(100, (milliseconds / goalMilliseconds) * 100)
              : 0;
            const date = new Date(`${dateKey}T12:00:00`);
            const isToday = dateKey === todayKey;

            return (
              <article
                key={dateKey}
                className={`rounded-2xl border p-3 transition-colors sm:p-4 ${
                  isToday
                    ? 'border-[#FB7185]/30 bg-[#FB7185]/[0.045]'
                    : 'border-[#302733] bg-[#100d12]/60 hover:border-[#524250]'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${
                      isToday ? 'bg-[#FB7185]/15 text-[#FDA4AF]' : 'bg-white/[0.04] text-[#94A3B8]'
                    }`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-white">
                        {formatStudyDate(dateKey, { month: 'long', day: 'numeric' })}
                        {isToday && <span className="ml-2 rounded-full bg-[#FB7185]/15 px-2 py-0.5 text-[10px] font-bold text-[#FDA4AF]">TODAY</span>}
                      </p>
                      <p className="text-xs text-[#64748B]">
                        {date.toLocaleDateString('en-US', { weekday: 'long' })}
                        {studyData[dateKey]?.manuallyEdited && <span className="ml-2 text-[#A78BFA]">· manually adjusted</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-1 items-center justify-between gap-4 sm:justify-end">
                    <div className="min-w-32 flex-1 sm:max-w-48">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-mono text-sm font-bold text-[#F8FAFC]">
                          {formatStudyDuration(milliseconds)}
                        </span>
                        {goalMilliseconds > 0 && (
                          <span className="text-[10px] text-[#64748B]">
                            {formatStudyDuration(milliseconds)} / {formatStudyDuration(goalMilliseconds)}
                          </span>
                        )}
                      </div>
                      {goalMilliseconds > 0 && (
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#302733]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#FB7185] to-[#FDBA74] transition-[width]"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingDate(editingDate === dateKey ? null : dateKey)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#302733] px-3 py-2 text-xs font-semibold text-[#94A3B8] transition hover:border-[#FB7185]/30 hover:text-[#FDA4AF]"
                      aria-expanded={editingDate === dateKey}
                      aria-label={`Edit ${formatStudyDate(dateKey, { month: 'long', day: 'numeric' })} study time`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  </div>
                </div>

                {editingDate === dateKey && (
                  <StudyDurationEditor
                    dateKey={dateKey}
                    currentMilliseconds={milliseconds}
                    onCancel={() => setEditingDate(null)}
                    onSave={(key, duration) => {
                      onSetStudyDuration(key, duration);
                      setEditingDate(null);
                    }}
                  />
                )}
              </article>
            );
          })}

          <article className="overflow-hidden rounded-2xl border border-[#FDBA74]/30 bg-gradient-to-r from-[#FB7185]/[0.13] via-[#7c3b4a]/[0.12] to-[#FDBA74]/[0.1] p-4 sm:p-5">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FDBA74]/15 text-[#FDBA74]">
                <GraduationCap className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FDBA74]">Final milestone</p>
                <h4 className="mt-1 text-base font-extrabold text-white sm:text-lg">
                  {formatStudyDate(EXAM_DATE, { month: 'long', day: 'numeric', year: 'numeric' })}
                </h4>
                <p className="mt-1 font-semibold text-[#FDA4AF]">Exam: University of Dhaka</p>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
