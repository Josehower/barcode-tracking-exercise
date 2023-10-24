'use client';
import {
  Alert,
  Box,
  Button,
  InputLabel,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import BarcodeCanvas from '../../components/BarcodeCanvas';
import { TicketWithBillings } from '../../database/tickets';
import { TicketIdResponseBodyGet } from '../api/tickets/[barcodeId]/route';

type Props = { serverTime: string };

export default function ExitPageClient(props: Props) {
  const [barcodeIdInput, setBarCodeIdInput] = useState('');

  const [ticket, setTicket] = useState<TicketWithBillings>();
  const [error, setError] = useState<string>();

  const serverDateInMs = +new Date(props.serverTime);
  const [mostRecentBilling] = ticket ? ticket.billingHistory.slice(-1) : [];

  const isLastBillingStillValid =
    !!mostRecentBilling &&
    serverDateInMs <
      +new Date(mostRecentBilling.billingTimestamp) + 1000 * 60 * 15;

  async function searchTicketHandler(barcodeId: string) {
    if (!barcodeId) {
      setError('Plase provide a valid barcode-id');
      return;
    }

    const response = await fetch(`/api/tickets/${barcodeId}`);
    const data = (await response.json()) as TicketIdResponseBodyGet;

    if ('error' in data) {
      setError(data.error);
      return;
    }

    setTicket(data.ticket);
    setError('');
  }

  return (
    <Box display="flex" flexDirection="column" gap="1rem" sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyItems="center"
        alignItems="center"
        alignSelf="left"
        gap="1rem"
      >
        <InputLabel id="payment-method-label" sx={{ color: 'primary.main' }}>
          Barcode Id:
        </InputLabel>
        <TextField
          placeholder="barcode-Id"
          value={barcodeIdInput}
          onChange={(event) => setBarCodeIdInput(event.currentTarget.value)}
        />
        <Button
          variant="contained"
          sx={{ color: 'text.secondary' }}
          onClick={() => searchTicketHandler(barcodeIdInput)}
        >
          Search Ticket
        </Button>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}

      {ticket && (
        <Box
          sx={{
            width: '90vw',
          }}
          display="flex"
          flexDirection="column"
          gap="3rem"
          alignItems="center"
        >
          <BarcodeCanvas barcodeId={ticket?.barcodeId} />
          <Typography>
            {!mostRecentBilling
              ? 'Please Issue A Payment - Door Is Closed'
              : isLastBillingStillValid
              ? 'Ticket Accepet Thank you for your visit - Door Is Open'
              : 'Your last Bill has expired - Door Is Closed'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
