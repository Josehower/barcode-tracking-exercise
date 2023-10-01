'use client';

import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from '@mui/material';
import jsBarcode from 'jsbarcode';
import { useEffect, useRef, useState } from 'react';
import { Ticket } from '../migrations/create-table-tickets';
import { TicketResponseBodyPost } from './api/route';

type Props = { tickets: Ticket[] };

export default function HomePageClient(props: Props) {
  const [tickets, setTickets] = useState(props.tickets);
  const [error, setError] = useState<string>();
  const canvasRef = useRef(null);
  const mainTicket = tickets[0];
  const mainTicketDate = mainTicket && new Date(mainTicket.checkinTimestamp);

  async function newTicketHandler() {
    const response = await fetch('/api', {
      method: 'POST',
    });
    const data = (await response.json()) as TicketResponseBodyPost;

    if ('error' in data) {
      setError(data.error);
      return;
    }

    setTickets([data.ticket, ...tickets]);
  }

  function activateTicket(id: number) {
    const ticketIndex = tickets.findIndex((ticket) => ticket.id == id);
    ticketIndex !== -1 && tickets.unshift(tickets.splice(ticketIndex, 1)[0]!);

    setTickets([...tickets]);
  }

  useEffect(() => {
    tickets[0] && jsBarcode(canvasRef.current, tickets[0].barcodeId);
  }, [tickets]);

  return (
    <>
      <Container sx={{ overflow: 'scroll' }} component="aside">
        {[...tickets]
          .sort(
            (a, b) =>
              +Date.parse(a.checkinTimestamp) - +Date.parse(b.checkinTimestamp),
          )
          .map((ticket) => {
            const ticketDate = new Date(ticket.checkinTimestamp);
            return (
              <Paper elevation={1} square={true}>
                <Button
                  key={`sidebar-ticket-${ticket.id}`}
                  sx={{ color: 'text.primary', width: '20vw' }}
                  onClick={() => activateTicket(ticket.id)}
                >
                  {ticket.barcodeId} | {ticketDate.getHours()}:
                  {ticketDate.getMinutes()}
                </Button>
              </Paper>
            );
          })}
      </Container>
      <main>
        <Box
          sx={{ width: '70vw' }}
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          gap="10px"
        >
          <Box
            sx={{
              p: 10,
              border: '1px solid grey',
              width: '50vw',
            }}
            display="flex"
            justifyContent="center"
          >
            <canvas ref={canvasRef} />
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ width: '50vw', height: '50px' }}
          >
            <Button
              variant="contained"
              sx={{ color: 'text.secondary' }}
              onClick={() => newTicketHandler()}
            >
              New Ticket
            </Button>
            {mainTicket && (
              <Box display="flex" justifyContent="center">
                <Typography>
                  Start Time: {mainTicketDate!.getHours()}:
                  {mainTicketDate!.getMinutes()}
                </Typography>
              </Box>
            )}
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </main>
    </>
  );
}
