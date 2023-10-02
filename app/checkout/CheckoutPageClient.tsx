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
import { Billing } from '../../migrations/3-create-table-billings';
import { calculatePrice } from '../../util/price';
import { BillingsResponseBodyPost } from '../api/billings/route';
import { TicketIdResponseBodyGet } from '../api/tickets/[barcodeId]/route';

type Props = { serverTime: string; supportedPaymentMethods: PaymentMethod[] };

export default function CheckoutPageClient(props: Props) {
  const [barcodeIdInput, setBarCodeIdInput] = useState('');
  const [paymentMetodInput, setPaymentMetodInput] = useState<
    PaymentMethod['id']
  >(props.supportedPaymentMethods[0]!.id);

  const [ticket, setTicket] = useState<TicketWithBillings>();
  const [error, setError] = useState<string>();

  const serverDate = new Date(props.serverTime);
  const mostRecentBilling = ticket?.billings.reduce((previous, current) => {
    if (!previous) return undefined;

    const mostRecent =
      +new Date(previous.billingTimestamp) > +new Date(current.billingTimestamp)
        ? previous
        : current;

    return mostRecent;
  }, ticket?.billings[0]);

  const isDoorClosed =
    !!mostRecentBilling &&
    +serverDate <
      +new Date(mostRecentBilling.billingTimestamp) + 1000 * 60 * 15;

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
    amount: Billing['amount'],
  ) {
    const response = await fetch('/api/billings', {
      method: 'POST',
      body: JSON.stringify({ ticketId, paymentMethodId, amount }),
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

      {ticket && (
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
            <Typography>Starting Time: {ticket.checkinTimestamp}</Typography>
            <Typography>Current Time: {props.serverTime}</Typography>
            {mostRecentBilling && (
              <Typography>
                Last Payment Time: {mostRecentBilling.billingTimestamp}
                {' With '}
                {mostRecentBilling.paymentMethod}
              </Typography>
            )}
            <Typography>
              Hours:{' '}
              {new Date(
                +serverDate - +new Date(ticket.checkinTimestamp),
              ).getHours()}
            </Typography>
            ----------------------------------------
            <Typography>
              Total Price: {calculatePrice(ticket, props.serverTime)}
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
            <Button
              disabled={isDoorClosed}
              variant="contained"
              sx={{ color: 'text.secondary' }}
              onClick={() =>
                payTicketHandler(
                  ticket.id,
                  paymentMetodInput,
                  calculatePrice(ticket, props.serverTime),
                )
              }
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
