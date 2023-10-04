import { Sql } from 'postgres';

export type PaymentMethod = {
  id: number;
  name: 'CREDIT' | 'DEBIT' | 'CASH';
};

export const paymentMethods = [
  { name: 'CREDIT' },
  { name: 'DEBIT' },
  { name: 'CASH' },
];

export async function up(sql: Sql) {
  for (const paymentMethod of paymentMethods) {
    await sql`
    INSERT INTO payment_methods
      (name)
    VALUES
      (${paymentMethod.name})
  `;
  }
}

export async function down(sql: Sql) {
  await sql`
      DELETE FROM payment_methods
  `;
}
