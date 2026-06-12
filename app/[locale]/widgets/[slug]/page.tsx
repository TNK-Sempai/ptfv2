// WidgetShell complet → MILO (components/widgets/WidgetShell.tsx)
// Données Notion → ZARA (lib/notion.ts)
type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export default async function WidgetPage({ params }: Props) {
  const { slug } = await params

  return (
    <section className="flex items-center justify-center py-32">
      <p className="font-display text-4xl text-muted">
        Widget <span className="text-accent">{slug}</span> — placeholder
      </p>
    </section>
  )
}
