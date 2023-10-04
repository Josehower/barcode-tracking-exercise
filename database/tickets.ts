import { cache } from 'react';
import { Ticket } from '../migrations/0-create-table-tickets';
import { timeFormatString } from '../util/time';
import { ClientBilling } from './billings';
import { sql } from './connect';

export type TicketWithBillings = Ticket & {
  billingHistory: ClientBilling[];
};

export const getTickets = cache(async () => {
  const tickets = await sql<Ticket[]>`
    SELECT
      *,
      TO_CHAR(checkin_timestamp, ${timeFormatString}) as checkin_timestamp,
      TO_CHAR(checkout_timestamp, ${timeFormatString}) as checkout_timestamp
    FROM tickets
 `;

  return tickets;
});

export const getTicketByBarcodeId = cache(
  async (barcodeId: Ticket['barcodeId']) => {
    const [ticket] = await sql<Ticket[]>`
    SELECT
      *,
      TO_CHAR(checkin_timestamp, ${timeFormatString}) as checkin_timestamp,
      TO_CHAR(checkout_timestamp, ${timeFormatString}) as checkout_timestamp
    FROM
      tickets
    WHERE
      barcode_id = ${barcodeId}
 `;

    return ticket;
  },
);

export const createTicket = cache(async (barcodeId: Ticket['barcodeId']) => {
  if (barcodeId.length !== 16) return undefined;

  const [ticket] = await sql<Ticket[]>`
    INSERT INTO tickets
      (barcode_id)
    SELECT * FROM
      (SELECT ${barcodeId}) as new_barcode
    WHERE
      (SELECT count(*) FROM tickets) < 60
    RETURNING
      *,
      TO_CHAR(checkin_timestamp, ${timeFormatString}) as checkin_timestamp
`;

  return ticket;
});

export const getTicketWithBillingHistoryByBarcodeId = cache(
  async (barcodeId: string): Promise<TicketWithBillings | undefined> => {
    const [ticket] = await sql<Ticket[]>`
      SELECT
        *,
        TO_CHAR(checkin_timestamp, ${timeFormatString}) as checkin_timestamp,
        TO_CHAR(checkout_timestamp, ${timeFormatString}) as checkout_timestamp
      FROM
        tickets
      WHERE
        barcode_id = ${barcodeId}
    `;

    if (!ticket) return;

    const billings = await sql<ClientBilling[]>`
      SELECT
        b.*,
        TO_CHAR(b.billing_timestamp, ${timeFormatString}) as billing_timestamp,
        p.name as payment_method
      FROM
        billings as b,
        payment_methods as p
      WHERE
        b.ticket_barcode_id = ${ticket.barcodeId}
      AND
        b.payment_method_id = p.id
      ORDER BY
        b.billing_timestamp ASC;
    `;

    return { ...ticket, billingHistory: billings };
  },
);

export async function getServerTime() {
  const [serverTime] = await sql<{ now: string }[]>`
    SELECT
      TO_CHAR(NOW(), ${timeFormatString}) as now;
  `;

  return serverTime;
}
