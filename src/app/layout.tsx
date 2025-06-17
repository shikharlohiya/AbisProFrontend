import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SidebarProvider } from '@/components/sidebarcontext';
import { CallStateProvider } from '@/components/CallStateContext';
import { OrderManagementProvider } from '@/components/OrderManagementContext'; // ADD THIS
import ThemeRegistry from '@/components/ThemeRegistry';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'ABIS Pro - Call Management System',
  description: 'Professional call management and customer relationship system',
  keywords: ['call management', 'CRM', 'customer service', 'ABIS'],
  authors: [{ name: 'ABIS Pro Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'ABIS Pro - Call Management System',
    description: 'Professional call management and customer relationship system',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ABIS Pro - Call Management System',
    description: 'Professional call management and customer relationship system',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#EE3741',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className} suppressHydrationWarning={true}>
        <ThemeRegistry>
          <SidebarProvider>
            <CallStateProvider>
              <OrderManagementProvider> {/* ADD THIS: For order context */}
                {children}
              </OrderManagementProvider>
            </CallStateProvider>
          </SidebarProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
