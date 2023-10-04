import { Sql } from 'postgres';

export async function up(sql: Sql) {
  await sql`
    CREATE TABLE payment_methods (
      id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      name varchar(10) NOT NULL
    )
  `;
}

export async function down(sql: Sql) {
  await sql`
    DROP TABLE payment_methods
  `;
}
