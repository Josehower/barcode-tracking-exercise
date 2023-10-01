import { cache } from 'react';
import { Ticket } from '../migrations/create-table-tickets';
import { sql } from './connect';

export const getTickets = cache(async () => {
  const tickets = await sql<Ticket[]>`
    SELECT * FROM tickets
 `;

  return tickets;
});

export const createTicket = cache(async (barcodeId: string) => {
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
