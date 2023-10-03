export const timeFormatString = 'YYYY/MM/DD HH24:MI:SS';

export function msToFullHours(milliseconds: number) {
  return Math.floor(milliseconds / 1000 / 60 / 60);
}
