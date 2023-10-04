export const timeFormatString = 'YYYY/MM/DD HH24:MI:SS:MS';

export function msToFullHours(milliseconds: number) {
  return Math.floor(milliseconds / 1000 / 60 / 60);
}
