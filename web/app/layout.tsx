// The frame around every page: fonts, header with menu, footer with name and links
import type { Metadata } from "next";
import Link from "next/link";
import "@fontsource-variable/fraunces"; // headline font
import "@fontsource-variable/public-sans"; // body font
import "./globals.css";
import Nav from "@/components/Nav";
import meta from "@/public/data/meta.json";

export const metadata: Metadata = {
  title: "Remittance Cost Tracker",
  description: "What it costs to send $200 home: by route, by type of company and by country, from World Bank data.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="wrap">
            <Link href="/" className="site-name">
              <span className="site-mark" aria-hidden="true"><i /></span>
              Remittance Cost Tracker
            </Link>
            <Nav />
          </div>
        </header>

        <main className="wrap">{children}</main>

        <footer className="site-footer">
          <div className="wrap footer-row">
            <p className="footer-by">
              Built by <strong>Aditya Khetarpal</strong>
            </p>
            <nav className="footer-links" aria-label="Aditya Khetarpal elsewhere">
              <a href="https://github.com/AdityaKhetarpal" target="_blank" rel="noreferrer">GitHub</a>
              <a href="https://www.linkedin.com/in/adityakhetarpal" target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="https://github.com/AdityaKhetarpal/remittance-cost-tracker" target="_blank" rel="noreferrer">Source code</a>
            </nav>
          </div>
          <div className="wrap">
            <p className="footer-note">
              Data: World Bank Remittance Prices Worldwide, {meta.latest_quarter}. For analysis and education, not financial advice.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
