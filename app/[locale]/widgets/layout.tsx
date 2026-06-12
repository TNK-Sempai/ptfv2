// Layout propre au blog 1001 Widgets
// Nav + sidebar filtres seront injectés par MILO
export default function WidgetsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh bg-bg text-text">
      {/* WidgetNav → MILO */}
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
    </div>
  )
}
