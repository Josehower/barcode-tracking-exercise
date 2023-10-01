import { NextRequest, NextResponse } from 'next/server';
import {
  checkoutTicketByBarcodeId,
  getTicketByBarcodeId,
} from '../../../../database/tickets';
import { Ticket } from '../../../../migrations/create-table-tickets';

type ApiError = {
  error: string;
};

export type TicketIdResponseBodyGet = { ticket: Ticket } | ApiError;
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

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Record<string, string | string[]>;
  },
): Promise<NextResponse<TicketIdResponseBodyPut>> {
  const { searchParams } = new URL(request.url);
  const barcodeId = params.barcodeId as string;
  const paymentMethod = searchParams.get('method');

  if (!barcodeId || !paymentMethod) {
    return NextResponse.json(
      {
        error: 'Ticket and payment methopd must be provided',
      },
      { status: 400 },
    );
  }

  // TODO: Update type validation using zod and receiving the method from request body
  if (
    !(
      paymentMethod === 'DEBIT' ||
      paymentMethod === 'CREDIT' ||
      paymentMethod === 'CASH'
    )
  ) {
    return NextResponse.json(
      {
        error: 'Invalid Payment Method',
      },
      { status: 400 },
    );
  }

  const payedTicket = await checkoutTicketByBarcodeId(barcodeId, paymentMethod);

  if (!payedTicket) {
    const ticket = await getTicketByBarcodeId(barcodeId);

    if (ticket && !ticket.billingTimestamp) {
      return NextResponse.json(
        {
          error: 'Ticket was already payed',
        },
        { status: 400 },
      );
    } else if (!ticket) {
      return NextResponse.json(
        {
          error: 'Ticket not found',
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        error: 'Server Error',
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ticket: payedTicket,
  });
}
