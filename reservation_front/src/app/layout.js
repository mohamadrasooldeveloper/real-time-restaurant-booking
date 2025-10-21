import Navbar from "@/components/Header";
import "./globals.css";
import { ThemeProvider } from '@/components/context/ThemeContext';

export const metadata = {
  title: 'پنل رستوران',
};
// RootLayout.jsx

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900"
        suppressHydrationWarning
      >
        <ThemeProvider>
          
            <Navbar />
            {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
