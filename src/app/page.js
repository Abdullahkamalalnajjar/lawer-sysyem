'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from './components/AppShell'

export default function HomePage() {
  const { user } = useApp()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [user, router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚖️</div>
        <div style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>جارٍ التحميل...</div>
      </div>
    </div>
  )
}
