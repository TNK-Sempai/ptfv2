'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef } from 'react'

// ─── Shaders ───────────────────────────────────────────────────────────────

const VERTEX_SRC = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

// La couleur n'est PAS hardcodée : elle arrive via l'uniform uColor, lu depuis
// le token DA --accent au runtime (règle DA — jamais de couleur en dur).
const FRAGMENT_SRC = `
precision mediump float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec3 uColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 mouse = uMouse / uResolution;

  float dist = distance(uv, mouse);

  // Ondulation depuis la souris
  float wave = sin(dist * 30.0 - uTime * 3.0) * exp(-dist * 4.0) * 0.5;

  // Bruit ambiant
  float noise = sin(uv.x * 8.0 + uTime) * cos(uv.y * 6.0 + uTime * 0.7) * 0.15;

  float value = wave + noise;

  vec3 color = uColor * (value + 0.3);
  gl_FragColor = vec4(color, value + 0.2);
}
`

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convertit un hex (#rgb / #rrggbb) en triplet [r,g,b] normalisé 0–1. */
function hexToRgbFloat(hex: string): [number, number, number] {
  const h = hex.trim().replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = Number.parseInt(full, 16)
  if (full.length !== 6 || Number.isNaN(n)) return [0.784, 0.941, 0.376] // fallback accent #c8f060
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

// ─── Composant WebGL ─────────────────────────────────────────────────────────

function FluidBackgroundImpl() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Guards (composant client-only via dynamic ssr:false → window dispo).
  const blocked = useMemo(() => {
    if (typeof window === 'undefined') return true
    const isTouch = 'ontouchstart' in window && window.innerWidth < 1024
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return isTouch || reduced
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || blocked) return

    const gl = canvas.getContext('webgl')
    if (!gl) return

    // — Programme —
    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SRC)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC)
    const program = gl.createProgram()
    if (!vs || !fs || !program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      return
    }
    gl.useProgram(program)

    // — Quad plein écran —
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    )
    const posLoc = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    // — Uniforms —
    const uTime = gl.getUniformLocation(program, 'uTime')
    const uResolution = gl.getUniformLocation(program, 'uResolution')
    const uMouse = gl.getUniformLocation(program, 'uMouse')
    const uColor = gl.getUniformLocation(program, 'uColor')

    // Couleur depuis le token DA --accent (source de vérité unique).
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent')
    gl.uniform3fv(uColor, hexToRgbFloat(accent || '#c8f060'))

    // — Resize —
    const mouse = { x: 0, y: 0 }
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.floor(canvas.clientWidth * dpr)
      const h = Math.floor(canvas.clientHeight * dpr)
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
      mouse.x = w / 2
      mouse.y = h / 2
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // — Souris (origine gl_FragCoord = bas-gauche → on inverse Y) —
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      mouse.x = (e.clientX - rect.left) * dpr
      mouse.y = (rect.height - (e.clientY - rect.top)) * dpr
    }
    window.addEventListener('mousemove', onMouseMove)

    // — Boucle —
    let raf = 0
    const start = performance.now()
    const render = (now: number) => {
      gl.uniform1f(uTime, (now - start) / 1000)
      gl.uniform2f(uResolution, canvas.width, canvas.height)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    // Pause hors écran (respect « pas d'anim continue de fond » + GPU).
    const onVisibility = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) raf = requestAnimationFrame(render)
    }
    document.addEventListener('visibilitychange', onVisibility)

    // — Cleanup complet —
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('visibilitychange', onVisibility)
      ro.disconnect()
      gl.deleteProgram(program)
      gl.deleteBuffer(buffer)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [blocked])

  if (blocked) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-[0.18]"
    />
  )
}

// Export client-only obligatoire (ssr:false) — WebGL n'a aucun sens côté serveur.
export default dynamic(() => Promise.resolve(FluidBackgroundImpl), { ssr: false })
