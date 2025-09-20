import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Nightreign Seed Search",
  description: "Nightreign Seed Search",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased flex justify-center`}
      >
        {children}
      </body>
    </html>
  );
}
