import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata = {
  title: {
    default: "BirdTrack — Your birdwatching world",
    template: "%s | BirdTrack"
  },
  description:
    "Explore birds by place, keep a private sighting list and journal, and research the birds you love."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
