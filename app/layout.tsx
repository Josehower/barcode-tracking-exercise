import { AppBar, Box, Toolbar, Typography } from '@mui/material';
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
              <Typography
                variant="h5"
                component="h2"
                sx={{ color: 'primary.main' }}
              >
                SensevenSpa
              </Typography>
              <Typography
                sx={{ color: '#405861', ml: 'auto' }}
                variant="body1"
              ></Typography>
            </Toolbar>
          </AppBar>
          <Box sx={{ mt: '10vh', display: 'flex', height: '90vh' }}>
            {children}
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
