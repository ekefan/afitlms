import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Afit LMS",
  description: "lecture monitoring systems for afit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans?.variable} ${geistMono?.variable} antialiased`}
      >
        <main>
          {children}
        </main>
        <Toaster position={"top-center"} toastOptions={{
          unstyled: true,
          classNames: {
            toast: "bg-muted-foreground border border-border rounded-lg shadow-lg p-4 space-y-3 min-w-[300px] max-w-lg text-sm",
            actionButton: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-md p-1 py-1.5 grow",
          }
        }} />
      </body>
    </html>
  );
}
