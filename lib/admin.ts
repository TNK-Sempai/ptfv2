import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'

const COOKIE_NAME = 'admin-session'

export function signSession(value: string): string {
  const password = process.env.ADMIN_PASSWORD ?? ''
  const sig = createHmac('sha256', password).update(value).digest('hex')
  return `${value}.${sig}`
}

export function verifySession(signed: string): boolean {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return false

  const lastDot = signed.lastIndexOf('.')
  if (lastDot === -1) return false

  const value = signed.slice(0, lastDot)
  const sig = signed.slice(lastDot + 1)
  const expected = createHmac('sha256', password).update(value).digest('hex')

  try {
    const sigBuf = Buffer.from(sig, 'hex')
    const expectedBuf = Buffer.from(expected, 'hex')
    if (sigBuf.length !== expectedBuf.length) return false
    return timingSafeEqual(sigBuf, expectedBuf)
  } catch {
    return false
  }
}

export async function verifyAdminCookie(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(COOKIE_NAME)?.value
  if (!session) return false
  return verifySession(session)
}
