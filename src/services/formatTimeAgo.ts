type TimeUnitTuple = [string, string, string];

// Pluralization helper
const getPluralForm = (value: number, units: TimeUnitTuple) => {
  const [one, few, many] = units;
  if (value % 10 === 1 && value % 100 !== 11) return one;
  if (
    value % 10 >= 2 &&
    value % 10 <= 4 &&
    (value % 100 < 10 || value % 100 >= 20)
  )
    return few;
  return many;
};

// Time units for English
const timeUnits = {
  seconds: ["second", "seconds", "seconds"] as TimeUnitTuple,
  minutes: ["minute", "minutes", "minutes"] as TimeUnitTuple,
  hours: ["hour", "hours", "hours"] as TimeUnitTuple,
  days: ["day", "days", "days"] as TimeUnitTuple,
  weeks: ["week", "weeks", "weeks"] as TimeUnitTuple,
  months: ["month", "months", "months"] as TimeUnitTuple,
  years: ["year", "years", "years"] as TimeUnitTuple,
};

// Format time difference in human-readable form
const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const commentDate = new Date(dateString);
  const diffInSeconds = Math.floor(
    (now.getTime() - commentDate.getTime()) / 1000
  );

  if (diffInSeconds < 10) return "just now";
  if (diffInSeconds < 60)
    return `${diffInSeconds} ${getPluralForm(
      diffInSeconds,
      timeUnits.seconds
    )} ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${getPluralForm(
      diffInMinutes,
      timeUnits.minutes
    )} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${getPluralForm(diffInHours, timeUnits.hours)} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${getPluralForm(diffInDays, timeUnits.days)} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${getPluralForm(diffInWeeks, timeUnits.weeks)} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${getPluralForm(
      diffInMonths,
      timeUnits.months
    )} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${getPluralForm(diffInYears, timeUnits.years)} ago`;
};

export default formatTimeAgo;
