import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Note: Santi Black font would need to be added as a local font
// For now, we'll use a fallback to Inter for the santi-black class
const santiBlack = {
  variable: "--font-santi-black",
};

export const metadata: Metadata = {
  title: "LAWSA - Build AI Agents. Visually.",
  description: "Transform complex AI workflows into simple drag-and-drop designs. LAWSA gives you the power of agentic AI with none of the code.",
  keywords: ["AI agents", "no-code", "automation", "workflow", "visual editor"],
  authors: [{ name: "LAWSA" }],
  openGraph: {
    title: "LAWSA - Build AI Agents. Visually.",
    description: "Transform complex AI workflows into simple drag-and-drop designs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${santiBlack.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
