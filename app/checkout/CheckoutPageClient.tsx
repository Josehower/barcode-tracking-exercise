'use client';
import {
  Alert,
  Box,
  Button,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import BarcodeCanvas from '../../components/BarcodeCanvas';
import { Ticket } from '../../migrations/create-table-tickets';
import { calculatePrice } from '../../util/price';
import { TicketIdResponseBodyPost } from '../api/tickets/[barcodeId]/route';

type Props = { serverTime: string };

export default function CheckoutPageClient(props: Props) {
  const [barcodeIdInput, setBarCodeIdInput] = useState('');
  const [paymentMetodInput, setPaymentMetodInput] =
    useState<NonNullable<Ticket['paymentMethod']>>('CASH');
  const [ticket, setTicekt] = useState<Ticket>();
  const [error, setError] = useState<string>();
  const ticketDate = ticket && new Date(ticket.checkinTimestamp);
  const serverDate = new Date(props.serverTime);
  const timeDifference = ticketDate && new Date(+serverDate - +ticketDate);

  async function searchTicketHandler() {
    if (!barcodeIdInput) {
      setError('Plase Provide a valid barcode-id');
      return;
    }

    const response = await fetch(`/api/tickets/${barcodeIdInput}`);
    const data = (await response.json()) as TicketIdResponseBodyPost;

    if ('error' in data) {
      setError(data.error);
      return;
    }

    setTicekt(data.ticket);
    setError('');
  }

  async function payTicketHandler(paymentMethod: string) {
    if (
      !(
        paymentMethod === 'DEBIT' ||
        paymentMethod === 'CREDIT' ||
        paymentMethod === 'CASH'
      )
    ) {
      setError('Invalid payment Method');
      return;
    }

    // TODO: update the api to use request.body
    const response = await fetch(
      `/api/tickets/${barcodeIdInput}?method=${paymentMetodInput}`,
      { method: 'PUT' },
    );
    const data = (await response.json()) as TicketIdResponseBodyPost;

    if ('error' in data) {
      setError(data.error);
      return;
    }

    setTicekt(data.ticket);
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
          onClick={() => searchTicketHandler()}
        >
          Search Ticket
        </Button>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}

      {timeDifference && (
        <Box
          sx={{
            width: '90vw',
          }}
          display="flex"
          alignItems="center"
        >
          <Box
            sx={{
              width: '50vw',
              p: '5rem',
            }}
            display="flex"
            flexDirection="column"
            alignItems="left"
            gap="0.5rem"
          >
            <Typography>
              Starting Time: {ticketDate?.getHours()}:{ticketDate?.getMinutes()}
            </Typography>
            <Typography>
              Current Time: {serverDate?.getHours()}:{serverDate?.getMinutes()}
            </Typography>
            <Typography>Hours: {timeDifference.getHours()}</Typography>
            ----------------------------------------
            <Typography>
              Total Price:{' '}
              {ticket.billingTimestamp
                ? `€0 (Ticket Payed with ${ticket.paymentMethod?.toLocaleLowerCase()})`
                : `€ ${calculatePrice(timeDifference.getHours())}`}
            </Typography>
            <InputLabel
              id="payment-method-label"
              sx={{ color: 'primary.main', mt: '1rem' }}
            >
              Payment Method
            </InputLabel>
            <Select
              labelId="payment-method-label"
              id="payment-method"
              value={paymentMetodInput}
              onChange={(event) => {
                setPaymentMetodInput(
                  event.target.value as NonNullable<Ticket['paymentMethod']>,
                );
              }}
            >
              <MenuItem value={'DEBIT'}>Debit Card</MenuItem>
              <MenuItem value={'CREDIT'}>Credit Card</MenuItem>
              <MenuItem value={'CASH'}>Cash</MenuItem>
            </Select>
            <Button
              disabled={!!ticket.billingTimestamp}
              variant="contained"
              sx={{ color: 'text.secondary' }}
              onClick={() => payTicketHandler(paymentMetodInput)}
            >
              Pay Ticket
            </Button>
          </Box>
          <BarcodeCanvas barcodeId={ticket?.barcodeId} />
        </Box>
      )}
    </Box>
  );
}
