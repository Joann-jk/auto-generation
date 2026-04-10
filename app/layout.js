import './globals.css';
import { Inter, Playfair_Display } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata = {
  title: {
    default: "Autonomous Content Factory",
    template: "%s | Autonomous Content Factory",
  },
  description:
    "Craft high-converting marketing campaigns with intelligent multi-agent collaboration.",
  themeColor: "#f46e09",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`bg-brand-black ${inter.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen bg-brand-black text-brand-cream antialiased">
        {children}
      </body>
    </html>
  );
}