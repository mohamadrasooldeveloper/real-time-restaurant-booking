import Navbar from "@/components/Header";
import "./globals.css";

export const metadata = {
  title: 'پنل رستوران',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <Navbar />
        <main className="p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
