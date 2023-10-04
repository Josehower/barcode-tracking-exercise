import { NextRequest, NextResponse } from 'next/server';
import {
  getTicketWithBillingHistoryByBarcodeId,
  TicketWithBillings,
} from '../../../../database/tickets';
import { Ticket } from '../../../../migrations/0-create-table-tickets';
import { ApiError } from '../route';

export type TicketIdResponseBodyGet = { ticket: TicketWithBillings } | ApiError;
export type TicketIdResponseBodyPut = { ticket: Ticket } | ApiError;

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Record<string, string | string[]>;
  },
): Promise<NextResponse<TicketIdResponseBodyGet>> {
  const barcodeId = params.barcodeId as string;

  if (!barcodeId) {
    return NextResponse.json(
      {
        error: 'Ticket must be provided',
      },
      { status: 400 },
    );
  }

  const ticketWithBillings = await getTicketWithBillingHistoryByBarcodeId(
    barcodeId,
  );

  if (!ticketWithBillings) {
    return NextResponse.json(
      {
        error: 'Ticket not found',
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ticket: ticketWithBillings,
  });
}
