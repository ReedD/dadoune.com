import dayjs from 'dayjs';

export const ordinal = (d: number) => {
  if (d > 3 && d < 21) return 'th';
  switch (d % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

export default (d: string) => {
  const date = dayjs(d);
  return date.format(`MMM D[${ordinal(date.date())}] YYYY`);
};
