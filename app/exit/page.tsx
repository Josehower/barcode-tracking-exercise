import { getPaymentMethods } from '../../database/paymentMethods';
import { getServerTime } from '../../database/tickets';
import ExitPageClient from './ExitPageClient';

export default async function CheckoutPage() {
  const serverTime = await getServerTime();

  if (!serverTime) {
    throw new Error('Postgres database server Time Is Not Defined');
  }

  return <ExitPageClient serverTime={serverTime.now} />;
}
