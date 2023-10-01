import { Sql } from 'postgres';

export type Ticket = {
  id: number;
  barcodeId: string;
  checkinTimestamp: string;
  billingTimestamp?: string;
  paymentMethod?: 'CREDIT' | 'DEBIT' | 'CASH';
};

export async function up(sql: Sql) {
  await sql`
    CREATE TABLE tickets (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      barcode_id varchar(16) NOT NULL unique,
      checkin_timestamp varchar(30) NOT NULL DEFAULT NOW(),
      billing_timestamp varchar(30),
      -- TODO: improve this creating a new table payment_methods for Data Normalization
      payment_method varchar(10)
    )
  `;
}

export async function down(sql: Sql) {
  await sql`
    DROP TABLE tickets
  `;
}
