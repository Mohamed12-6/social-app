"use client"

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import theme from "./theme";
import { ThemeProvider } from "@emotion/react";
import Navbar from "./_navbar/page";
import { ReactNode } from "react";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default function RootLayout({children}:{children:ReactNode})
{
  return (
    <html lang="en">
              <Provider store={store}>

      <body className={`${geistSans.variable} ${geistMono.variable}`}>
      <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
            <Navbar/>
            {children}
            <Toaster/>
            </ThemeProvider>
            </AppRouterCacheProvider>

      </body>
      </Provider>

    </html>
  );
}
