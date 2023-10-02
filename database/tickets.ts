import { cache } from 'react';
import { Ticket } from '../migrations/0-create-table-tickets';
import { ClientBilling } from './billings';
import { sql } from './connect';

export type TicketWithBillings = Ticket & {
  billings: ClientBilling[];
};

export const getTickets = cache(async () => {
  const tickets = await sql<Ticket[]>`
    SELECT * FROM tickets
 `;

  return tickets;
});

export const getTicketById = cache(async (ticketId: Ticket['id']) => {
  const [ticket] = await sql<Ticket[]>`
    SELECT
      *
    FROM
      tickets
    WHERE
      id = ${ticketId}
 `;

  return ticket;
});

export const createTicket = cache(async (barcodeId: Ticket['barcodeId']) => {
  if (barcodeId.length !== 16) return undefined;

  const [ticket] = await sql<Ticket[]>`
  INSERT INTO tickets
    (barcode_id)
  SELECT * FROM
    (SELECT ${barcodeId}) as new_barcode
  WHERE
    (SELECT count(*) FROM tickets) < 60
  RETURNING *
`;

  return ticket;
});

export const getTicketWithBillingsByBarcodeId = cache(
  async (barcodeId: string): Promise<TicketWithBillings | undefined> => {
    const [ticket] = await sql<Ticket[]>`
    SELECT
      *
    FROM
      tickets
    WHERE
      barcode_id = ${barcodeId}
  `;

    if (!ticket) return;

    const billings = await sql<ClientBilling[]>`
    SELECT
      b.id,
      b.billing_timestamp,
      b.ticket_id,
      p.name as payment_method
    FROM
      billings as b,
      payment_methods as p
    WHERE
      b.ticket_id = ${ticket.id}
    AND
    b.payment_method_id = p.id
    `;

    console.log(billings);

    return { ...ticket, billings: billings };
  },
);

export async function getServerTime() {
  const [serverTime] = await sql<{ now: string }[]>` SELECT NOW()::timestamp`;

  return serverTime;
}
