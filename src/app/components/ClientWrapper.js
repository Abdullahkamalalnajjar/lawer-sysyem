'use client'

import { AppProvider } from './AppShell'

export default function RootLayoutClient({ children }) {
  return <AppProvider>{children}</AppProvider>
}
