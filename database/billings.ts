import { cache } from 'react';
import { Ticket } from '../migrations/0-create-table-tickets';
import { PaymentMethod } from '../migrations/2-insert-payment-methods';
import { Billing } from '../migrations/3-create-table-billings';
import { sql } from './connect';

export type ClientBilling = Omit<Billing, 'paymentMethod'> & {
  paymentMethod: PaymentMethod['name'];
};

export const createBilling = cache(
  async (ticketId: Ticket['id'], paymentMetodId: PaymentMethod['id']) => {
    try {
      const [billing] = await sql<Billing[]>`
        INSERT INTO billings
          (ticket_id, payment_method_id)
        VALUES
          (${ticketId}, ${paymentMetodId})
        RETURNING
          id,
          TO_CHAR(billing_timestamp, 'YYYY/MM/DD HH24:MM:SS') as billing_timestamp,
          ticket_id,
          payment_method_id
    `;

      return billing;
    } catch {
      return undefined;
    }
  },
);
