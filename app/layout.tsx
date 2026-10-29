import type {Metadata} from 'next';
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'PakPadel Club Manager',
  description: 'B2B Web Admin Dashboard for managing Padel club facilities, courts, dynamic PKR pricing rules, and real-time booking matrices.',
  openGraph: {
    title: 'PakPadel Club Manager',
    description: 'B2B Web Admin Dashboard for managing Padel club facilities, courts, dynamic PKR pricing rules, and real-time booking matrices.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PakPadel Club Manager',
    description: 'B2B Web Admin Dashboard for managing Padel club facilities, courts, dynamic PKR pricing rules, and real-time booking matrices.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
