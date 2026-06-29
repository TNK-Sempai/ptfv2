'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import * as THREE from 'three'

// ─── Données galerie + palettes mood ──────────────────────────────────────────

type Mood = { background: string; blob1: string; blob2: string }
type GalleryItem = {
  slug: string
  title: string
  image: string
  href: string
  mood: Mood
}

const GALLERY_DATA: GalleryItem[] = [
  {
    slug: 'tanukichessbot',
    title: 'TANUKICHESSBOT',
    image: '/img/tanuki-chessbot-cover.webp',
    href: '/projects/tanukichessbot',
    mood: { background: '#0a0500', blob1: '#c8a000', blob2: '#1a0000' },
  },
  {
    slug: 'opti-troc',
    title: 'OPTI-TROC',
    image: '/img/opti-troc-cover.webp',
    href: '/projects/opti-troc',
    mood: { background: '#000a05', blob1: '#c8f060', blob2: '#001a10' },
  },
  {
    slug: 'yummr',
    title: 'YUMMR',
    image: '/img/yummr-cover.webp',
    href: '/projects/yummr',
    mood: { background: '#0a0005', blob1: '#ff6090', blob2: '#1a0010' },
  },
  {
    slug: 'big-factory',
    title: 'BIG FACTORY',
    image: '/img/big-factory-cover.webp',
    href: '/projects/big-factory',
    mood: { background: '#050010', blob1: '#6060ff', blob2: '#000a1a' },
  },
  {
    slug: 'time-event',
    title: 'TIME-EVENT.CH',
    image: '/img/time-event-cover.webp',
    href: '/projects/time-event',
    mood: { background: '#050005', blob1: '#c060ff', blob2: '#0a000a' },
  },
]

// Espacement des plans sur l'axe Z : 0, -3, -6, -9, -12.
const PLANE_GAP = 3
const PLANE_W = 4
const PLANE_H = PLANE_W * (9 / 16) // ratio 16/9
const PLANE_ASPECT = 16 / 9
const N = GALLERY_DATA.length

// Profondeurs des plans : [0, -3, -6, -9, -12].
const PLANE_POSITIONS = GALLERY_DATA.map((_, i) => -i * PLANE_GAP)
const LAST_PLANE_Z = PLANE_POSITIONS[N - 1] // -12
const CAMERA_START_Z = 5 // devant le premier plan (z=0)

// Les ShaderMaterial ne réagissent pas aux lights : on éclaircit les textures
// directement dans le fragment shader. Régler ici (1.0 = brut).
const TEXTURE_BRIGHTNESS = 1.4

// ─── Shaders ───────────────────────────────────────────────────────────────────

const VERTEX = /* glsl */ `
  uniform float uVelocity;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 pos = position;
    // Ondulation pilotée par la vélocité de scroll (bombé centre du plan).
    float wave = sin(uv.x * 3.14159265) * sin(uv.y * 3.14159265);
    pos.z += wave * uVelocity * 0.12;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const FRAGMENT = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uImageAspect;
  uniform float uPlaneAspect;
  uniform float uBrightness;
  varying vec2 vUv;
  void main() {
    // UV "cover" : conserve le ratio de l'image dans le plan 16/9.
    vec2 ratio = vec2(
      min(uPlaneAspect / uImageAspect, 1.0),
      min(uImageAspect / uPlaneAspect, 1.0)
    );
    vec2 uv = vec2(
      vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
    vec4 tex = texture2D(uTexture, uv);
    gl_FragColor = vec4(tex.rgb * uBrightness, tex.a);
  }
`

// ─── Helpers ────────────────────────────────────────────────────────────────────

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

/** Couleurs THREE pré-parsées pour le lerp mood. */
const MOOD_COLORS = GALLERY_DATA.map((d) => ({
  background: new THREE.Color(d.mood.background),
  blob1: new THREE.Color(d.mood.blob1),
  blob2: new THREE.Color(d.mood.blob2),
}))

// ─── Composant ──────────────────────────────────────────────────────────────────

/**
 * DepthGallery — galerie 3D Three.js réactive au scroll.
 *
 * 5 plans texturés espacés en profondeur ; la caméra plonge dans l'axe Z au
 * scroll (lerp), la vélocité ondule les plans, et le fond + 2 blobs CSS lerpent
 * entre les palettes « mood » de chaque projet. Monter via `dynamic(ssr:false)`.
 *
 * Boucle d'animation : aucune mise à jour d'état React par frame — fond/blobs
 * sont écrits directement en style DOM ; seul l'index actif déclenche un render
 * (titre + lien). Cleanup complet au unmount.
 */
export default function DepthGallery() {
  const locale = useLocale()
  const lp = (p: string) => (locale === 'en' ? `/en${p}` : p)

  const containerRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)
  const blob1Ref = useRef<HTMLDivElement>(null)
  const blob2Ref = useRef<HTMLDivElement>(null)

  const [active, setActive] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    const sticky = stickyRef.current
    const mount = mountRef.current
    if (!container || !sticky || !mount) return

    const getSize = () => ({ w: window.innerWidth, h: window.innerHeight })
    let { w, h } = getSize()

    // Scene / caméra / renderer.
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100)
    camera.position.set(0, 0, CAMERA_START_Z)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    // Plans + textures.
    const loader = new THREE.TextureLoader()
    type PlaneEntry = {
      geometry: THREE.PlaneGeometry
      material: THREE.ShaderMaterial
      texture: THREE.Texture
      mesh: THREE.Mesh
    }
    const planes: PlaneEntry[] = GALLERY_DATA.map((item, i) => {
      const geometry = new THREE.PlaneGeometry(PLANE_W, PLANE_H, 32, 24)
      const texture = loader.load(
        item.image,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace
          const img = tex.image as { width: number; height: number } | undefined
          if (img && img.width && img.height) {
            material.uniforms.uImageAspect.value = img.width / img.height
          }
        },
        undefined,
        (err) => {
          // Échec de chargement → plan vide. On le rend visible plutôt que silencieux.
          console.error('Texture failed:', item.image, err)
        },
      )
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: texture },
          uVelocity: { value: 0 },
          uImageAspect: { value: PLANE_ASPECT },
          uPlaneAspect: { value: PLANE_ASPECT },
          uBrightness: { value: TEXTURE_BRIGHTNESS },
        },
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.z = -i * PLANE_GAP
      scene.add(mesh)
      return { geometry, material, texture, mesh }
    })

    // État scroll / vélocité.
    let lastScrollY = window.scrollY
    let velocity = 0
    let activeIndex = 0

    // Couleurs courantes (réutilisées chaque frame, pas d'alloc).
    const curBg = new THREE.Color(GALLERY_DATA[0].mood.background)
    const curBlob1 = new THREE.Color(GALLERY_DATA[0].mood.blob1)
    const curBlob2 = new THREE.Color(GALLERY_DATA[0].mood.blob2)

    let rafId = 0
    const animate = () => {
      rafId = requestAnimationFrame(animate)

      // Progression du scroll dans la section (sticky).
      const rect = container.getBoundingClientRect()
      const travel = rect.height - window.innerHeight
      const progress = travel > 0 ? clamp(-rect.top / travel, 0, 1) : 0

      // Vélocité : delta scroll × 0.3, décroît × 0.9 par frame.
      const sy = window.scrollY
      const delta = sy - lastScrollY
      lastScrollY = sy
      velocity += delta * 0.3
      velocity *= 0.9
      const vClamped = clamp(velocity, -6, 6)

      // Caméra : plonge de z=5 (devant le 1er plan) jusqu'à z=-12 (dernier plan),
      // pour que chaque plan devienne successivement le plus proche. Lerp 0.08.
      const targetZ = CAMERA_START_Z + progress * (LAST_PLANE_Z - CAMERA_START_Z)
      camera.position.z += (targetZ - camera.position.z) * 0.08

      for (const p of planes) {
        p.material.uniforms.uVelocity.value = vClamped
      }

      // Lerp mood entre les deux projets encadrant la progression.
      const f = progress * (N - 1)
      const i0 = Math.floor(f)
      const i1 = Math.min(i0 + 1, N - 1)
      const t = f - i0
      curBg.copy(MOOD_COLORS[i0].background).lerp(MOOD_COLORS[i1].background, t)
      curBlob1.copy(MOOD_COLORS[i0].blob1).lerp(MOOD_COLORS[i1].blob1, t)
      curBlob2.copy(MOOD_COLORS[i0].blob2).lerp(MOOD_COLORS[i1].blob2, t)
      sticky.style.backgroundColor = `#${curBg.getHexString()}`
      if (blob1Ref.current) blob1Ref.current.style.backgroundColor = `#${curBlob1.getHexString()}`
      if (blob2Ref.current) blob2Ref.current.style.backgroundColor = `#${curBlob2.getHexString()}`

      // Index actif — 5 zones égales de scroll (chaque image = 20% des 600vh).
      // Calcul direct sur `progress` : instantané, toujours synchrone.
      const idx = Math.min(Math.floor(progress * N), N - 1)
      if (idx !== activeIndex) {
        activeIndex = idx
        setActive(idx)
      }

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      ;({ w, h } = getSize())
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // ── Cleanup complet ──
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      for (const p of planes) {
        scene.remove(p.mesh)
        p.geometry.dispose()
        p.material.dispose()
        p.texture.dispose()
      }
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <section ref={containerRef} className="relative" style={{ height: '600vh' }}>
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen w-screen overflow-hidden"
        style={{ backgroundColor: GALLERY_DATA[0].mood.background }}
      >
        {/* Blobs mood — couleurs lerpées en JS */}
        <div
          ref={blob1Ref}
          aria-hidden="true"
          className="pointer-events-none absolute left-[12%] top-[18%] h-[45vw] w-[45vw] rounded-full opacity-50 blur-[120px]"
          style={{ backgroundColor: GALLERY_DATA[0].mood.blob1 }}
        />
        <div
          ref={blob2Ref}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[12%] right-[8%] h-[40vw] w-[40vw] rounded-full opacity-40 blur-[120px]"
          style={{ backgroundColor: GALLERY_DATA[0].mood.blob2 }}
        />

        {/* Canvas WebGL (transparent) */}
        <div ref={mountRef} className="absolute inset-0" />

        {/* Overlay — index + titre actif + CTA */}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-end pb-[12vh] text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted2">
            {String(active + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
          </p>
          <motion.h1
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mt-3 font-display text-[clamp(2.5rem,9vw,7rem)] uppercase leading-none tracking-tight text-accent"
          >
            {GALLERY_DATA[active].title}
          </motion.h1>
          <Link
            href={lp(GALLERY_DATA[active].href)}
            className="pointer-events-auto mt-6 inline-flex items-center gap-2 rounded border border-accent/40 px-6 py-3 font-mono text-sm text-accent transition-colors hover:bg-accent hover:text-bg"
          >
            Voir le projet
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Indice scroll */}
        <span className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest text-muted">
          Scroll ↓
        </span>
      </div>
    </section>
  )
}
