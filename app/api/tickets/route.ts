import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { createTicket, getTickets } from '../../../database/tickets';
import { Ticket } from '../../../migrations/create-table-tickets';

type ApiError = {
  error: string;
};

export type TicketResponseBodyPost = { ticket: Ticket } | ApiError;

export async function POST(): Promise<NextResponse<TicketResponseBodyPost>> {
  const ticket = await createTicket(
    String(parseInt(crypto.randomBytes(8).toString('hex'), 16)).substring(
      0,
      16,
    ),
  );

  if (!ticket && (await getTickets()).length >= 60) {
    return NextResponse.json(
      {
        error: 'Error no more tickets available',
      },
      { status: 403 },
    );
  } else if (!ticket) {
    return NextResponse.json(
      {
        error: 'Server error creating the new ticket',
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ticket,
  });
}
