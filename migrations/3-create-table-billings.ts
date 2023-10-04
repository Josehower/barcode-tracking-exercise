import { Sql } from 'postgres';
import { Ticket } from './0-create-table-tickets';
import { PaymentMethod } from './2-insert-payment-methods';

export type Billing = {
  id: number;
  billingTimestamp: string;
  ticketId: Ticket['barcodeId'];
  paymentMethodId: PaymentMethod['id'];
  amount: number;
};

export async function up(sql: Sql) {
  await sql`
    CREATE TABLE billings (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      billing_timestamp timestamptz NOT NULL DEFAULT NOW(),
      ticket_barcode_id varchar(16) NOT NULL REFERENCES tickets (barcode_id) ON DELETE CASCADE,
      payment_method_id integer NOT NULL REFERENCES payment_methods (id) ON DELETE CASCADE,
      amount integer NOT NULL
    )
  `;
}

export async function down(sql: Sql) {
  await sql`
    DROP TABLE billings
  `;
}
