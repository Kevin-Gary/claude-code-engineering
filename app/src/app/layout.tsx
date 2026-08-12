import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verdant: keep every plant thriving",
  description:
    "Snap a photo to identify any plant, get a care schedule built for your home, and a gentle nudge exactly when it needs you.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
