import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Head from "next/head";

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
  title: "Narpbd",
  description: "Welcome Our Cloud project",
  keywords: [
    "narpbd.com",
    "narp",
    "narpbd",
    "nrpbd",
    "nrp",
    "nrpbd.",
  ],
  verification: {
    // google: "NzQwnFDQb9bghCJFHR4OwCR07T8HG5rRWlhIfjF31D4",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
      <link rel="preload" href="/fonts/myfont.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        {children}
      </body>
    </html>
  );
}
