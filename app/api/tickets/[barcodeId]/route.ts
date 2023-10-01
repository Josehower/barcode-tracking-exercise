import { NextRequest, NextResponse } from 'next/server';
import { getTicketByBarcodeId } from '../../../../database/tickets';
import { Ticket } from '../../../../migrations/create-table-tickets';

type ApiError = {
  error: string;
};

export type TicketIdResponseBodyPost = { ticket: Ticket } | ApiError;

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Record<string, string | string[]>;
  },
): Promise<NextResponse<TicketIdResponseBodyPost>> {
  const barcodeId = params.barcodeId as string;

  if (!barcodeId) {
    return NextResponse.json(
      {
        error: 'Ticket must be provided',
      },
      { status: 400 },
    );
  }

  const ticket = await getTicketByBarcodeId(barcodeId);

  if (!ticket) {
    return NextResponse.json(
      {
        error: 'Ticket not found',
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ticket,
  });
}
