import { NextResponse } from 'next/server'

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'https://ramanreddy.app.n8n.cloud/webhook/autoapply-start'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Fire-and-forget: call n8n webhook but don't wait for it to complete
    // The n8n workflow runs asynchronously and updates Supabase as it progresses
    fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(err => {
      console.error('n8n webhook fire-and-forget error:', err)
    })

    return NextResponse.json({ success: true, message: 'Agent triggered successfully' })
  } catch (err) {
    console.error('n8n-webhook route error:', err)
    return NextResponse.json(
      { success: false, message: 'Failed to trigger agent' },
      { status: 500 }
    )
  }
}
