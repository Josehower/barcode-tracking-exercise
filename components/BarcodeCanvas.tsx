import { Box } from '@mui/material';
import JsBarcode from 'jsbarcode';
import { useEffect, useRef } from 'react';

type Props = { barcodeId?: string };

export default function BarcodeCanvas(props: Props) {
  const canvasRef = useRef(null);
  useEffect(() => {
    props.barcodeId && JsBarcode(canvasRef.current, props.barcodeId);
  }, [props.barcodeId]);

  return (
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
  );
}
