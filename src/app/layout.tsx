import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from '@/components/navbar';
import { getOptionalSession } from '@/lib/auth/session';
import { Footer } from '@/components/footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doc Pro — Find & Book Doctors",
  description: "Browse verified doctors, check real-time availability, and book appointments online. Demo project with fictional data.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getOptionalSession();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} >
        <Navbar
          user={
            session
              ? {
                  name: session.user.name,
                  role: session.user.role ?? 'PATIENT',
                  image: session.user.image ?? null,
                }
              : null
          }
        />
        {children}
        <Footer />
      </body>
    </html>
  );
}