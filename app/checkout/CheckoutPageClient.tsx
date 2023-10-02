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
import { TicketWithBillings } from '../../database/tickets';
import { Ticket } from '../../migrations/0-create-table-tickets';
import { PaymentMethod } from '../../migrations/2-insert-payment-methods';
import { calculatePrice } from '../../util/price';
import { BillingsResponseBodyPost } from '../api/billings/route';
import { TicketIdResponseBodyGet } from '../api/tickets/[barcodeId]/route';

type Props = { serverTime: string; supportedPaymentMethods: PaymentMethod[] };

export default function CheckoutPageClient(props: Props) {
  const [barcodeIdInput, setBarCodeIdInput] = useState('');
  const [paymentMetodInput, setPaymentMetodInput] = useState<
    PaymentMethod['id']
  >(props.supportedPaymentMethods[0]!.id);

  // FIX: create TicketWithBilling
  const [ticket, setTicket] = useState<TicketWithBillings>();
  const [error, setError] = useState<string>();

  const ticketDate = ticket && new Date(ticket.checkinTimestamp);
  const serverDate = new Date(props.serverTime);
  const timeDifference = ticketDate && new Date(+serverDate - +ticketDate);
  const mostRecentBilling = ticket?.billings.reduce((previous, current) => {
    if (!previous) return undefined;

    const mostRecent =
      +new Date(previous.billingTimestamp) > +new Date(current.billingTimestamp)
        ? previous
        : current;

    return mostRecent;
  }, ticket?.billings[0]);

  async function searchTicketHandler(barcode: string) {
    if (!barcode) {
      setError('Plase Provide a valid barcode-id');
      return;
    }

    const response = await fetch(`/api/tickets/${barcode}`);
    const data = (await response.json()) as TicketIdResponseBodyGet;

    if ('error' in data) {
      setError(data.error);
      return;
    }

    console.log(data.ticket);

    setTicket(data.ticket);
    setError('');
  }

  async function payTicketHandler(
    ticketId: Ticket['id'],
    paymentMethodId: PaymentMethod['id'],
  ) {
    // TODO: update the api to use request.body
    const response = await fetch('/api/billings', {
      method: 'POST',
      body: JSON.stringify({ ticketId, paymentMethodId }),
    });
    const data = (await response.json()) as BillingsResponseBodyPost;

    if ('error' in data) {
      setError(data.error);
      return;
    }

    ticket &&
      setTicket({ ...ticket, billings: [data.billing, ...ticket?.billings] });
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
              Total Price:
              {mostRecentBilling
                ? `€0 (Ticket Payed with ${mostRecentBilling.paymentMethod})`
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
                setPaymentMetodInput(Number(event.target.value));
              }}
            >
              {props.supportedPaymentMethods.map((paymentMethod) => {
                return (
                  <MenuItem
                    key={`paymentMethod-option-${paymentMethod.id}`}
                    value={paymentMethod.id}
                  >
                    {paymentMethod.name}
                  </MenuItem>
                );
              })}
            </Select>
            {mostRecentBilling?.billingTimestamp}
            <br />
            {props.serverTime}
            <Button
              disabled={
                mostRecentBilling &&
                +new Date(mostRecentBilling?.billingTimestamp) +
                  15 * 60 * 1000 <
                  +serverDate
              }
              variant="contained"
              sx={{ color: 'text.secondary' }}
              onClick={() => payTicketHandler(ticket.id, paymentMetodInput)}
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
