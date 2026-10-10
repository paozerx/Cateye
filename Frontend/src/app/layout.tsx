import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cateye — สมุดบันทึกการผจญภัย",
  description: "เก็บทุกการผจญภัยในเกม เควส และตัวละครที่คุณอยากจำ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body>{children}</body></html>;
}
