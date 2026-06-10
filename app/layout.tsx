import type { Metadata } from "next";
import "../styles/index.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Raflux Wallet - Connect & Manage",
  description: "Simple wallet manager powered by Raflux",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
