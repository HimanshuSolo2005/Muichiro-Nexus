import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import {Cinzel} from "next/font/google";
import "./globals.css";
import { Cloud } from "lucide-react";
import { ClerkProvider } from "@clerk/nextjs";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Muichiro-Nexus : Mist Breathing",
  description: "Mist Breathing App Form",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${cinzel.variable} antialiased`}
      >
        {/* <Header /> */}
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
