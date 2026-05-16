import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'AI and Machine Learning Web System for Smart Plant Disease and Crop Health Detection',
  description: 'An AI and machine learning web system for smart plant disease and crop health detection. Upload or scan your plants in real-time to detect diseases and get treatment recommendations.',
  keywords: 'plant disease, AI detection, machine learning, agriculture, crop health, smart farming',
  openGraph: {
    title: 'AI & ML Smart Plant Disease Detection System',
    description: 'Detect plant diseases instantly with AI and machine learning',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
