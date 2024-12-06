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
  title: "Cloud",
  description: "Welcome Our Cloud project",
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Cloud",
    description: "Welcome Our Cloud project",
  };
  return (
    <html lang="en">
      <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
        <title>Cloud</title>
        <meta name="description" content="Welcome Our Cloud project" />
        <meta name="keywords" content="next.js, fast, SEO, Google ranking" />
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
