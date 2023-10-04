import { getPaymentMethods } from '../../database/paymentMethods';
import { getServerTime } from '../../database/tickets';
import ExitPageClient from './ExitPageClient';

export default async function CheckoutPage() {
  const serverTime = await getServerTime();
  const supportedPaymentMethods = await getPaymentMethods();

  if (!serverTime) {
    throw new Error('Postgres database server Time Is Not Defined');
  }

  return (
    <ExitPageClient
      serverTime={serverTime.now}
      supportedPaymentMethods={supportedPaymentMethods}
    />
  );
}
