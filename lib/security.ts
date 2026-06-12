// lib/security.ts — Sanitisation, honeypot, hash IP
// Utilisé par les API routes commentaires et suggestions

import { COMMENT_PRENOM_MAX, COMMENT_MESSAGE_MAX } from './constants'
import type { CommentInput } from './types'

// ─── Sanitisation HTML ───────────────────────────────────────────────────────

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
}

export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char] ?? char)
}

// ─── Normalisation chaînes ───────────────────────────────────────────────────

export function sanitizeString(str: unknown, maxLength: number): string {
  if (typeof str !== 'string') return ''
  return escapeHtml(str.trim().slice(0, maxLength))
}

// ─── Hash IP (SHA-256) ───────────────────────────────────────────────────────
// L'IP n'est jamais stockée en clair — uniquement son hash

export async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// ─── Extraction IP depuis Next.js request ────────────────────────────────────

export function extractIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '0.0.0.0'
  )
}

// ─── Validation commentaire ──────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateComment(input: CommentInput): ValidationResult {
  if (input.honeypot && input.honeypot.length > 0) {
    // Rejet silencieux — le bot croit avoir réussi
    return { valid: true }
  }

  const prenom = input.prenom?.trim() ?? ''
  const message = input.message?.trim() ?? ''

  if (!prenom || prenom.length < 1) {
    return { valid: false, error: 'Prénom requis.' }
  }

  if (prenom.length > COMMENT_PRENOM_MAX) {
    return { valid: false, error: `Prénom trop long (max ${COMMENT_PRENOM_MAX} caractères).` }
  }

  if (!message || message.length < 2) {
    return { valid: false, error: 'Message trop court.' }
  }

  if (message.length > COMMENT_MESSAGE_MAX) {
    return { valid: false, error: `Message trop long (max ${COMMENT_MESSAGE_MAX} caractères).` }
  }

  return { valid: true }
}

// ─── Sanitisation commentaire ────────────────────────────────────────────────

export function sanitizeComment(input: CommentInput): Pick<CommentInput, 'prenom' | 'message'> {
  return {
    prenom: sanitizeString(input.prenom, COMMENT_PRENOM_MAX),
    message: sanitizeString(input.message, COMMENT_MESSAGE_MAX),
  }
}
