export const STUDY_START_DATE = '2026-10-06';
export const EXAM_DATE = '2026-12-12';

const toDate = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getLastStudyDate = () => {
  const lastDate = toDate(EXAM_DATE);
  lastDate.setDate(lastDate.getDate() - 1);
  return toDateKey(lastDate);
};

export const isStudyDate = (dateKey) =>
  dateKey >= STUDY_START_DATE && dateKey < EXAM_DATE;

export const getStudyDates = () => {
  const dates = [];
  const date = toDate(STUDY_START_DATE);
  const endDate = toDate(getLastStudyDate());

  while (date <= endDate) {
    dates.push(toDateKey(date));
    date.setDate(date.getDate() + 1);
  }

  return dates;
};

export const formatStudyDate = (dateKey, options = {}) =>
  toDate(dateKey).toLocaleDateString('en-US', options);

export const formatStudyDuration = (milliseconds) => {
  const totalMinutes = Math.floor(Math.max(0, milliseconds) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
};

export const getStudyMilliseconds = (entry) => {
  if (!entry) return 0;
  if (Number.isFinite(entry.studyMilliseconds)) return Math.max(0, entry.studyMilliseconds);
  if (Number.isFinite(entry.studyMinutes)) return Math.max(0, entry.studyMinutes) * 60000;
  return 0;
};

export const addStudySegments = (studyData, segments) => {
  const nextData = { ...studyData };
  const additions = new Map();

  segments.forEach(({ start, end }) => {
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return;

    let cursor = start;
    while (cursor < end) {
      const cursorDate = new Date(cursor);
      const nextDay = new Date(
        cursorDate.getFullYear(),
        cursorDate.getMonth(),
        cursorDate.getDate() + 1
      ).getTime();
      const segmentEnd = Math.min(end, nextDay);
      const dateKey = toDateKey(cursorDate);

      if (isStudyDate(dateKey)) {
        additions.set(dateKey, (additions.get(dateKey) || 0) + segmentEnd - cursor);
      }
      cursor = segmentEnd;
    }
  });

  additions.forEach((milliseconds, dateKey) => {
    const previous = nextData[dateKey];
    nextData[dateKey] = {
      studyMilliseconds: getStudyMilliseconds(previous) + milliseconds,
      manuallyEdited: Boolean(previous?.manuallyEdited)
    };
  });

  return nextData;
};
