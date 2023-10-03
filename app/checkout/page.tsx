import { getPaymentMethods } from '../../database/paymentMethods';
import { getServerTime } from '../../database/tickets';
import CheckoutPageClient from './CheckoutPageClient';

export default async function CheckoutPage() {
  const serverTime = await getServerTime();
  const supportedPaymentMethods = await getPaymentMethods();

  if (!serverTime) {
    throw new Error('Postgres database server Time Is Not Defined');
  }

  return (
    <CheckoutPageClient
      serverTime={serverTime.now}
      supportedPaymentMethods={supportedPaymentMethods}
    />
  );
}
