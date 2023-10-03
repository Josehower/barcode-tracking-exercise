import { Sql } from 'postgres';

export type Ticket = {
  id: number;
  barcodeId: string;
  checkinTimestamp: string;
  checkoutTimestamp?: string;
};

export async function up(sql: Sql) {
  await sql`
    CREATE TABLE tickets (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      barcode_id varchar(16) NOT NULL unique,
      checkin_timestamp timestamptz NOT NULL DEFAULT NOW(),
      checkout_timestamp timestamptz
    )
  `;
}

export async function down(sql: Sql) {
  await sql`
    DROP TABLE tickets
  `;
}