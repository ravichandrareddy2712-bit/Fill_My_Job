import { NextResponse } from 'next/server'

const N8N_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ||
  'https://ramanreddy.app.n8n.cloud/webhook/autoapply-start'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Forward to n8n AutoApply Agent webhook
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // 30s timeout — n8n responds immediately (responseNode mode)
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('[n8n-webhook] n8n error:', res.status, errText)
      return NextResponse.json(
        { success: false, message: `Agent error: ${res.status}` },
        { status: 502 }
      )
    }

    // n8n responds with { status: 'ok', session_id, message }
    const data = await res.json().catch(() => ({ status: 'ok' }))
    return NextResponse.json({ success: true, ...data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[n8n-webhook] route error:', msg)
    return NextResponse.json(
      { success: false, message: 'Failed to trigger agent: ' + msg },
      { status: 500 }
    )
  }
}
