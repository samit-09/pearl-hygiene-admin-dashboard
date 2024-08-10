"use client";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  // const pathname = usePathname();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Pearl Hygiene - Admin Panel</title>
        <link
          rel="shortcut icon"
          href="/images/logo/logo.png"
          type="image/x-icon"
        />
      </head>
      <body suppressHydrationWarning={true} >
        <div className="dark:bg-boxdark-2 dark:text-bodydark" style={{ minHeight: '100vh' }}>
          {loading ? <Loader /> : children}
        </div>
      </body>
    </html>
  );
}
