import { TicketWithBillings } from '../database/tickets';
import { msToFullHours } from './time';

export function calculatePrice(
  ticket: TicketWithBillings,
  endingTimestamp: string,
) {
  const { baseHours, basePrice, extraHourPrice } = {
    baseHours: 3,
    basePrice: 30,
    extraHourPrice: 3,
  };

  const startingTimeMs = +new Date(ticket.checkinTimestamp);
  const endingTimeMs = +new Date(endingTimestamp);

  const serviceHours = msToFullHours(endingTimeMs - startingTimeMs);
  const extraHours = serviceHours > baseHours ? serviceHours - baseHours : 0;

  const totalPrice = basePrice + extraHours * extraHourPrice;

  return ticket.billingHistory.reduce((previous, current) => {
    return previous - current.amount;
  }, totalPrice);
}
