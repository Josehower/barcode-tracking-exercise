export function calculatePrice(serviceHours: number) {
  if (serviceHours <= 3) {
    return 30;
  }

  return (serviceHours - 3) * 3 + 30;
}
