import { useCallback, useEffect, useRef, useState } from 'react';
import {
  addStudySegments,
  getStudyMilliseconds,
  isStudyDate,
  toDateKey
} from './studyHours.js';

const STORAGE_KEY = 'hsc_pcm_study_hours_state';
const DEFAULT_SETTINGS = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4
};

const createTimer = (settings = DEFAULT_SETTINGS) => ({
  mode: 'pomodoro',
  phase: 'focus',
  running: false,
  startedAt: null,
  elapsedMs: 0,
  remainingMs: settings.focusTime * 60000,
  normalSegments: [],
  focusSegments: [],
  sessionsCompleted: 0
});

const normalizeStudyData = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
  return Object.fromEntries(
    Object.entries(data)
      .filter(([dateKey]) => isStudyDate(dateKey))
      .map(([dateKey, entry]) => [
        dateKey,
        {
          studyMilliseconds: getStudyMilliseconds(entry),
          manuallyEdited: Boolean(entry?.manuallyEdited)
        }
      ])
  );
};

const loadState = (settings) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { studyData: {}, timer: createTimer(settings) };

    const parsed = JSON.parse(saved);
    const studyData = normalizeStudyData(parsed.studyData);
    const savedTimer = parsed.timer && typeof parsed.timer === 'object' ? parsed.timer : {};
    const timer = { ...createTimer(settings), ...savedTimer };

    if (!['normal', 'pomodoro'].includes(timer.mode)) timer.mode = 'pomodoro';
    if (!['focus', 'shortBreak', 'longBreak'].includes(timer.phase)) timer.phase = 'focus';
    if (!Array.isArray(timer.normalSegments)) timer.normalSegments = [];
    if (!Array.isArray(timer.focusSegments)) timer.focusSegments = [];
    if (!Number.isFinite(timer.elapsedMs) || timer.elapsedMs < 0) timer.elapsedMs = 0;
    if (!Number.isFinite(timer.remainingMs) || timer.remainingMs < 0) {
      timer.remainingMs = settings.focusTime * 60000;
    }
    if (!Number.isFinite(timer.startedAt)) timer.startedAt = null;
    timer.running = Boolean(timer.running && timer.startedAt);

    return { studyData, timer };
  } catch (error) {
    console.error('Could not load study timer data:', error);
    return { studyData: {}, timer: createTimer(settings) };
  }
};

const phaseDuration = (phase, settings) => {
  if (phase === 'shortBreak') return settings.shortBreakTime * 60000;
  if (phase === 'longBreak') return settings.longBreakTime * 60000;
  return settings.focusTime * 60000;
};

const formatStopwatch = (milliseconds) => {
  const seconds = Math.floor(Math.max(0, milliseconds) / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return [hours, minutes, remainingSeconds]
    .map((part) => String(part).padStart(2, '0'))
    .join(':');
};

const appendSegment = (segments, start, end) =>
  end > start ? [...segments, { start, end }] : segments;

export default function useStudyTimer(settings = DEFAULT_SETTINGS, onPomodoroComplete = null) {
  const [state, setState] = useState(() => loadState(settings));
  const stateRef = useRef(state);
  const [now, setNow] = useState(0);
  const completedPhaseRef = useRef(null);

  const updateState = useCallback((updater) => {
    const nextState = typeof updater === 'function' ? updater(stateRef.current) : updater;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(interval);
  }, []);

  const timer = state.timer;

  useEffect(() => {
    if (!now || !timer.running || timer.mode !== 'pomodoro' || !timer.startedAt) return;
    const remainingMs = timer.remainingMs - (now - timer.startedAt);
    if (remainingMs > 0) return;

    const completionId = `${timer.phase}:${timer.startedAt}`;
    if (completedPhaseRef.current === completionId) return;
    completedPhaseRef.current = completionId;

    const completedAt = timer.startedAt + timer.remainingMs;
    updateState((current) => {
      const currentTimer = current.timer;
      if (
        !currentTimer.running ||
        currentTimer.mode !== 'pomodoro' ||
        currentTimer.startedAt !== timer.startedAt ||
        currentTimer.phase !== timer.phase
      ) return current;

      if (currentTimer.phase === 'focus') {
        const sessionsCompleted = currentTimer.sessionsCompleted + 1;
        const nextPhase = sessionsCompleted % Math.max(1, settings.longBreakInterval) === 0
          ? 'longBreak'
          : 'shortBreak';
        const focusSegments = appendSegment(
          currentTimer.focusSegments,
          currentTimer.startedAt,
          completedAt
        );
        onPomodoroComplete?.();

        return {
          studyData: addStudySegments(current.studyData, focusSegments),
          timer: {
            ...currentTimer,
            phase: nextPhase,
            startedAt: Math.max(completedAt, now),
            remainingMs: phaseDuration(nextPhase, settings),
            focusSegments: [],
            sessionsCompleted
          }
        };
      }

      return {
        ...current,
        timer: {
          ...currentTimer,
          phase: 'focus',
          startedAt: Math.max(completedAt, now),
          remainingMs: phaseDuration('focus', settings)
        }
      };
    });
  }, [now, onPomodoroComplete, settings, timer.mode, timer.phase, timer.remainingMs, timer.running, timer.startedAt, updateState]);

  useEffect(() => {
    if (!now || !timer.running || !timer.startedAt) return;
    const todayKey = toDateKey(new Date(now));
    if (isStudyDate(todayKey)) return;

    const midnight = new Date(
      new Date(now).getFullYear(),
      new Date(now).getMonth(),
      new Date(now).getDate()
    ).getTime();
    const cutoff = Math.max(timer.startedAt, midnight);

    updateState((current) => {
      const currentTimer = current.timer;
      if (!currentTimer.running || currentTimer.startedAt !== timer.startedAt) return current;

      if (currentTimer.mode === 'normal') {
        const normalSegments = appendSegment(
          currentTimer.normalSegments,
          currentTimer.startedAt,
          cutoff
        );
        return {
          studyData: addStudySegments(current.studyData, normalSegments),
          timer: {
            ...currentTimer,
            running: false,
            startedAt: null,
            elapsedMs: 0,
            normalSegments: []
          }
        };
      }

      const elapsedMs = Math.min(currentTimer.remainingMs, cutoff - currentTimer.startedAt);
      const focusSegments = currentTimer.phase === 'focus'
        ? appendSegment(
          currentTimer.focusSegments,
          currentTimer.startedAt,
          currentTimer.startedAt + elapsedMs
        )
        : currentTimer.focusSegments;

      return {
        ...current,
        timer: {
          ...currentTimer,
          running: false,
          startedAt: null,
          remainingMs: Math.max(0, currentTimer.remainingMs - elapsedMs),
          focusSegments
        }
      };
    });
  }, [now, timer.mode, timer.running, timer.startedAt, updateState]);

  const setMode = useCallback((mode) => {
    if (!['normal', 'pomodoro'].includes(mode)) return;
    updateState((current) => {
      if (current.timer.running) return current;
      const timer = createTimer(settings);
      timer.mode = mode;
      timer.sessionsCompleted = current.timer.sessionsCompleted;
      return { ...current, timer };
    });
  }, [settings, updateState]);

  const start = useCallback(() => {
    if (!isStudyDate(toDateKey(new Date()))) return;
    updateState((current) => ({
      ...current,
      timer: { ...current.timer, running: true, startedAt: Date.now() }
    }));
  }, [updateState]);

  const pause = useCallback(() => {
    const pausedAt = Date.now();
    updateState((current) => {
      const currentTimer = current.timer;
      if (!currentTimer.running || !currentTimer.startedAt) return current;
      const elapsedMs = Math.max(0, pausedAt - currentTimer.startedAt);

      if (currentTimer.mode === 'normal') {
        return {
          ...current,
          timer: {
            ...currentTimer,
            running: false,
            startedAt: null,
            elapsedMs: currentTimer.elapsedMs + elapsedMs,
            normalSegments: appendSegment(
              currentTimer.normalSegments,
              currentTimer.startedAt,
              pausedAt
            )
          }
        };
      }

      return {
        ...current,
        timer: {
          ...currentTimer,
          running: false,
          startedAt: null,
          remainingMs: Math.max(0, currentTimer.remainingMs - elapsedMs),
          focusSegments: currentTimer.phase === 'focus'
            ? appendSegment(currentTimer.focusSegments, currentTimer.startedAt, pausedAt)
            : currentTimer.focusSegments
        }
      };
    });
  }, [updateState]);

  const stop = useCallback(() => {
    const stoppedAt = Date.now();
    updateState((current) => {
      const currentTimer = current.timer;
      if (currentTimer.mode !== 'normal') return current;
      const segments = currentTimer.running && currentTimer.startedAt
        ? appendSegment(currentTimer.normalSegments, currentTimer.startedAt, stoppedAt)
        : currentTimer.normalSegments;
      const nextTimer = {
        ...currentTimer,
        running: false,
        startedAt: null,
        elapsedMs: 0,
        normalSegments: []
      };

      return {
        studyData: addStudySegments(current.studyData, segments),
        timer: nextTimer
      };
    });
  }, [updateState]);

  const reset = useCallback(() => {
    updateState((current) => {
      const nextTimer = createTimer(settings);
      nextTimer.mode = current.timer.mode;
      return { ...current, timer: nextTimer };
    });
  }, [settings, updateState]);

  const setPhase = useCallback((phase) => {
    if (!['focus', 'shortBreak', 'longBreak'].includes(phase)) return;
    updateState((current) => {
      if (current.timer.running || current.timer.mode !== 'pomodoro') return current;
      return {
        ...current,
        timer: {
          ...current.timer,
          phase,
          startedAt: null,
          remainingMs: phaseDuration(phase, settings),
          focusSegments: []
        }
      };
    });
  }, [settings, updateState]);

  const skip = useCallback(() => {
    updateState((current) => {
      const currentTimer = current.timer;
      if (currentTimer.mode !== 'pomodoro') return current;
      const phase = currentTimer.phase === 'focus' ? 'shortBreak' : 'focus';
      return {
        ...current,
        timer: {
          ...currentTimer,
          phase,
          running: false,
          startedAt: null,
          remainingMs: phaseDuration(phase, settings),
          focusSegments: []
        }
      };
    });
  }, [settings, updateState]);

  const setStudyDuration = useCallback((dateKey, milliseconds) => {
    if (!isStudyDate(dateKey) || !Number.isFinite(milliseconds)) return;
    updateState((current) => ({
      ...current,
      studyData: {
        ...current.studyData,
        [dateKey]: {
          studyMilliseconds: Math.max(0, milliseconds),
          manuallyEdited: true
        }
      }
    }));
  }, [updateState]);

  const replaceStudyData = useCallback((studyData) => {
    updateState((current) => ({
      ...current,
      studyData: normalizeStudyData(studyData)
    }));
  }, [updateState]);

  const clearStudyData = useCallback(() => {
    updateState({
      studyData: {},
      timer: createTimer(settings)
    });
  }, [settings, updateState]);

  const elapsedMs = timer.elapsedMs + (
    timer.mode === 'normal' && timer.running && timer.startedAt
      ? Math.max(0, now - timer.startedAt)
      : 0
  );
  const remainingMs = now && timer.mode === 'pomodoro' && timer.running && timer.startedAt
    ? Math.max(0, timer.remainingMs - (now - timer.startedAt))
    : timer.remainingMs;

  return {
    studyData: state.studyData,
    timer,
    now,
    elapsedMs,
    remainingMs,
    formattedStopwatch: formatStopwatch(elapsedMs),
    setMode,
    start,
    pause,
    stop,
    reset,
    setPhase,
    skip,
    setStudyDuration,
    replaceStudyData,
    clearStudyData
  };
}
