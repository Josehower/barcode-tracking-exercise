import { getTickets } from '../database/tickets';
import HomePageClient from './HomePageClient';

export default async function HomePage() {
  const tickets = await getTickets();

  return <HomePageClient tickets={tickets} />;
}
