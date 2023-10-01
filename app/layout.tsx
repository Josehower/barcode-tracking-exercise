import { AppBar, Box, Link, Toolbar, Typography } from '@mui/material';
import type { Metadata } from 'next';
import ThemeRegistry from '../components/ThemeRegistry/ThemeRegistry';

export const metadata: Metadata = {
  title: 'SensevenSpa',
  description: 'Best Spa Since 2023',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AppBar
            color="transparent"
            sx={{ zIndex: '20000', backgroundColor: 'background.default' }}
          >
            <Toolbar>
              <Link href="/" color="secondary" sx={{ textDecoration: 'none' }}>
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{ color: 'primary.main' }}
                >
                  SensevenSpa
                </Typography>
              </Link>
              <Link href="/checkout" color="secondary" sx={{ ml: 'auto' }}>
                Checkout
              </Link>
            </Toolbar>
          </AppBar>
          <Box
            sx={{
              m: '90px auto 0 0',
              display: 'flex',
              height: '90vh',
              width: '95vw',
            }}
            component="main"
          >
            {children}
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
