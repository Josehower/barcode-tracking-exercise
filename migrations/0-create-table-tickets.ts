import { Sql } from 'postgres';

export type Ticket = {
  barcodeId: string;
  checkinTimestamp: string;
  checkoutTimestamp?: string;
};

export async function up(sql: Sql) {
  await sql`
    CREATE TABLE tickets (
      barcode_id varchar(16) PRIMARY KEY NOT NULL unique,
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
