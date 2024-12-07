import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Cloud",
  description: "Welcome Our Cloud project",
  keywords: [
    "next.js",
    "cloud",
    "cloud-nine",
    "cloud project fast",
    "SEO",
    "Google ranking",
  ],
  verification: {
    google: "NzQwnFDQb9bghCJFHR4OwCR07T8HG5rRWlhIfjF31D4",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        {children}
      </body>
    </html>
  );
}
