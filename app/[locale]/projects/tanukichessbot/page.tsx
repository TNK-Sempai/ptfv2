import type { Metadata } from 'next'
import TanukiChessBotContent from './TanukiChessBotContent'

export const metadata: Metadata = {
  title: 'TanukiChessBot — Stream autonome 24/7 — Tanuki',
  description:
    'Bot IA qui joue aux échecs, commente à voix haute, anime un avatar 3D et gère le chat Twitch — Stockfish, Ollama, Kokoro TTS, Warudo, OBS, en stream 24/7.',
}

/**
 * TanukiChessBotPage — Server Component.
 * Délègue le rendu et les animations au composant client TanukiChessBotContent,
 * ce qui préserve l'export statique `metadata` (incompatible avec 'use client').
 */
export default function TanukiChessBotPage() {
  return <TanukiChessBotContent />
}
