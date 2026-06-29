// app/studio/(dashboard)/layout.tsx — Auth guard du cockpit (route group sans segment d'URL)
//
// Le route group (dashboard) ne change PAS l'URL : la page.tsx qu'il contient
// reste servie à "/studio". Il isole simplement les pages protégées du layout
// public de /studio/login → pas de boucle de redirection.
//
// Session absente / expirée → redirect vers /studio/login (qui, sans le slug
// secret, renvoie 404 : l'existence même du cockpit reste cachée).

import { redirect } from 'next/navigation'
import { verifyStudioCookie } from '@/lib/studio/studio-auth'
import { STUDIO_ROUTES } from '@/lib/studio/constants'
import StudioSidebar from '@/components/studio/StudioSidebar'
import StudioHeader from '@/components/studio/StudioHeader'

export default async function StudioDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { valid } = await verifyStudioCookie()
  if (!valid) redirect(STUDIO_ROUTES.LOGIN)

  return (
    <div className="flex min-h-screen">
      <StudioSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <StudioHeader />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
