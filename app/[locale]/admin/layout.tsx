import { redirect } from 'next/navigation'
import { verifyAdminCookie } from '@/lib/admin'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdmin = await verifyAdminCookie()
  if (!isAdmin) redirect('/')

  return (
    <div className="min-h-dvh bg-surface text-text">
      {/* AdminNav → ZARA/MILO */}
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  )
}
