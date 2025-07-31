import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import {Cinzel} from "next/font/google";
import "./globals.css";
import { Cloud } from "lucide-react";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

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
  title: "Muichiro-Nexus",
  description: "Mist Breathing App Form",
};

// function Header() {
//   return (
//     <header style={{ display: 'flex', justifyContent: 'space-between', padding: 20 }}>
//       <h1>My App</h1>
//       <SignedIn>
//         <UserButton />
//       </SignedIn>
//       <SignedOut>
//         <SignInButton />
//       </SignedOut>
//     </header>
//   )
// }

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
