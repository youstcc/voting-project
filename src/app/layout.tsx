import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ContractProvider } from "@/lib/contract-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Application de Vote Décentralisée",
  description: "Plateforme de vote sécurisée basée sur la blockchain",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ContractProvider>{children}</ContractProvider>
      </body>
    </html>
  )
}

