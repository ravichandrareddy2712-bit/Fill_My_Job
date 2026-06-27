import { NextResponse } from 'next/server'

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://ramanreddy.app.n8n.cloud/webhook/autoapply-start'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Await the webhook so we can return an error if it fails
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      console.error('n8n webhook error:', res.status)
      return NextResponse.json(
        { success: false, message: `Failed to trigger agent: ${res.status}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Agent triggered successfully' })
  } catch (err) {
    console.error('n8n-webhook route error:', err)
    return NextResponse.json(
      { success: false, message: 'Failed to trigger agent' },
      { status: 500 }
    )
  }
}
