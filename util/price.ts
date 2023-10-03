import { TicketWithBillings } from '../database/tickets';
import { msToFullHours } from './time';

export function calculatePrice(ticket: TicketWithBillings, serverTime: string) {
  const startingTimeMs = +new Date(ticket.checkinTimestamp);
  const serverTimeMs = +new Date(serverTime);

  const serviceHours = msToFullHours(serverTimeMs - startingTimeMs);

  const preliminaryPrice = (serviceHours - 3) * 3 + 30;
  const totalPrice = preliminaryPrice < 30 ? 30 : preliminaryPrice;

  return ticket.billingHistory.reduce((previous, current) => {
    return previous - current.amount;
  }, totalPrice);
}
