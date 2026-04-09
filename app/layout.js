export const metadata = {
  title: "Autonomous Content Factory | Premium AI Campaign Studio",
  description:
    "Craft high-converting marketing campaigns with intelligent multi-agent collaboration.",
  themeColor: "#0A0A0A",
  icons: {
    icon: "/favicon.ico", // replace with your luxury black+gold favicon
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-dark text-brand-cream antialiased">
        {children}
      </body>
    </html>
  );
}