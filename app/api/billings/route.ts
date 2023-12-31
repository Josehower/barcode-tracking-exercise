import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  ClientBilling,
  createBilling,
  getRecentBillingsCountByTicketId,
} from '../../../database/billings';
import { getPaymentMethodById } from '../../../database/paymentMethods';
import { getTicketByBarcodeId } from '../../../database/tickets';
import { ApiError } from '../tickets/route';

export type BillingsResponseBodyPost = { bill: ClientBilling } | ApiError;

const billingInputSchema = z.object({
  ticketBarcodeId: z.string(),
  paymentMethodId: z.number(),
  amount: z.number(),
});

export async function POST(
  request: NextRequest,
): Promise<NextResponse<BillingsResponseBodyPost>> {
  const body = await request.json();

  const result = billingInputSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'The billing data provided is invalid',
      },
      { status: 400 },
    );
  }

  if (
    (await getRecentBillingsCountByTicketId(result.data.ticketBarcodeId)) !== 0
  ) {
    return NextResponse.json(
      {
        error: 'Last bill is still valid',
      },
      { status: 403 },
    );
  }

  const paymentMethod = await getPaymentMethodById(result.data.paymentMethodId);

  if (!paymentMethod) {
    return NextResponse.json(
      {
        error: 'The billing data provided is invalid',
      },
      { status: 400 },
    );
  }

  const bill = await createBilling(
    result.data.ticketBarcodeId,
    paymentMethod.id,
    result.data.amount,
  );

  if (!bill) {
    if (!(await getTicketByBarcodeId(result.data.ticketBarcodeId))) {
      return NextResponse.json(
        {
          error: 'The billing data provided is invalid',
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: 'Error creating the new billing',
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    bill: { ...bill, paymentMethod: paymentMethod.name },
  });
}
