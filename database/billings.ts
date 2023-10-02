import { cache } from 'react';
import { Ticket } from '../migrations/0-create-table-tickets';
import { PaymentMethod } from '../migrations/2-insert-payment-methods';
import { Billing } from '../migrations/3-create-table-billings';
import { timeFormatString } from '../util/time';
import { sql } from './connect';

export type ClientBilling = Omit<Billing, 'paymentMethod'> & {
  paymentMethod: PaymentMethod['name'];
};

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
          id,
          TO_CHAR(billing_timestamp, ${timeFormatString}) as billing_timestamp,
          ticket_id,
          payment_method_id,
          amount
    `;

      return billing;
    } catch {
      return undefined;
    }
  },
);
