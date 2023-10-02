import { Sql } from 'postgres';
import { Ticket } from './0-create-table-tickets';
import { PaymentMethod } from './2-insert-payment-methods';

export type Billing = {
  id: number;
  billingTimestamp: string;
  ticketId: Ticket['id'];
  paymentMethodId: PaymentMethod['id'];
};

export async function up(sql: Sql) {
  await sql`
    CREATE TABLE billings (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      billing_timestamp varchar(30) NOT NULL DEFAULT NOW(),
      ticket_id integer NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
      payment_method_id integer NOT NULL REFERENCES payment_methods (id) ON DELETE CASCADE
    )
  `;
}

export async function down(sql: Sql) {
  await sql`
    DROP TABLE billings
  `;
}
