import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FLOCK! — Birds Are Not Boring",
  description: "A loud, playful gallery of every living bird species.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
