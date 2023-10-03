import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ClientBilling, createBilling } from '../../../database/billings';
import { getPaymentMethodById } from '../../../database/paymentMethods';
import { getTicketById } from '../../../database/tickets';
import { ApiError } from '../tickets/route';

export type BillingsResponseBodyPost = { billing: ClientBilling } | ApiError;

const billingInputSchema = z.object({
  ticketId: z.number(),
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

  const paymentMethod = await getPaymentMethodById(result.data.paymentMethodId);

  if (!paymentMethod) {
    return NextResponse.json(
      {
        error: 'The billing data provided is invalid',
      },
      { status: 400 },
    );
  }

  const billing = await createBilling(
    result.data.ticketId,
    paymentMethod.id,
    result.data.amount,
  );

  if (!billing) {
    if (!(await getTicketById(result.data.ticketId))) {
      return NextResponse.json(
        {
          error: 'The billing data provided is invalid',
        },
        { status: 404 },
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
    billing: { ...billing, paymentMethod: paymentMethod.name },
  });
}
