import { cache } from 'react';
import { Ticket } from '../migrations/0-create-table-tickets';
import { PaymentMethod } from '../migrations/2-insert-payment-methods';
import { Billing } from '../migrations/3-create-table-billings';
import { timeFormatString } from '../util/time';
import { sql } from './connect';

export type ClientBilling = Omit<Billing, 'paymentMethod'> & {
  paymentMethod: PaymentMethod['name'];
};

export const getRecentBillingsCountByTicketId = cache(
  async (ticketId: Ticket['id']) => {
    const [{ count }] = await sql<[{ count: number }]>`
  SELECT
    count(*)::int
  FROM
    billings
  WHERE
    (billing_timestamp > (NOW() - INTERVAL '15 minutes'))
  AND
    ticket_id = ${ticketId};
`;

    return count;
  },
);

export const createBilling = cache(
  async (
    ticketId: Ticket['id'],
    paymentMetodId: PaymentMethod['id'],
    amount: Billing['amount'],
  ) => {
    try {
      const [billing] = await sql<Billing[]>`
        INSERT INTO billings
          (ticket_id, payment_method_id, amount)
        VALUES
          (${ticketId}, ${paymentMetodId}, ${amount})
        RETURNING
          *,
          TO_CHAR(billing_timestamp, ${timeFormatString}) as billing_timestamp
      `;

      return billing;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  },
);
