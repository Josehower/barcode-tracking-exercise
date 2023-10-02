import { cache } from 'react';
import { PaymentMethod } from '../migrations/2-insert-payment-methods';
import { sql } from './connect';

export const getPaymentMethods = cache(async () => {
  const paymentMethods = await sql<PaymentMethod[]>`
    SELECT * FROM payment_methods
 `;

  return paymentMethods;
});

export const getPaymentMethodById = cache(
  async (paymentMethodId: PaymentMethod['id']) => {
    const [paymentMethod] = await sql<PaymentMethod[]>`
    SELECT
      *
    FROM
      payment_methods
    WHERE
      id = ${paymentMethodId}
 `;

    return paymentMethod;
  },
);
