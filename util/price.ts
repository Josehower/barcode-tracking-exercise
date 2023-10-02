import { TicketWithBillings } from '../database/tickets';

export function calculatePrice(ticket: TicketWithBillings, serverTime: string) {
  const startingTimeMs = +new Date(ticket.checkinTimestamp);
  const serverTimeMs = +new Date(serverTime);

  const serviceHours = new Date(serverTimeMs - startingTimeMs).getHours();

  const preliminaryPrice = (serviceHours - 3) * 3 + 30;
  const totalPrice = preliminaryPrice < 30 ? 30 : preliminaryPrice;

  return ticket.billings.reduce((previous, current) => {
    return previous - current.amount;
  }, totalPrice);
}
