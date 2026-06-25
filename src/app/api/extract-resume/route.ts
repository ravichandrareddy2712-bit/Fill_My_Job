import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''

async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  // Simple PDF text extraction: read raw bytes and find text streams
  // For production, use pdf-parse. Here we use a lightweight regex approach
  // that works server-side without native modules.
  try {
    const bytes = new Uint8Array(buffer)
    const text = new TextDecoder('latin1').decode(bytes)
    
    // Extract text between BT and ET markers (PDF text objects)
    const textParts: string[] = []
    const btEtRegex = /BT([\s\S]*?)ET/g
    let match
    while ((match = btEtRegex.exec(text)) !== null) {
      const content = match[1]
      // Extract strings in parentheses
      const strRegex = /\(([^)]*)\)/g
      let strMatch
      while ((strMatch = strRegex.exec(content)) !== null) {
        const str = strMatch[1].replace(/\\(\d{3})/g, (_: string, oct: string) =>
          String.fromCharCode(parseInt(oct, 8))
        ).replace(/\\\\/g, '\\').replace(/\\\(/g, '(').replace(/\\\)/g, ')')
        if (str.trim().length > 1) textParts.push(str.trim())
      }
    }
    
    if (textParts.length > 0) {
      return textParts.join(' ').substring(0, 8000)
    }
    
    // Fallback: extract any readable ASCII sequences
    const readable = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 8000)
    return readable
  } catch {
    return 'Resume text extraction failed. Please fill in details manually.'
  }
}

async function extractWithAI(resumeText: string): Promise<Record<string, unknown>> {
  const prompt = `Extract all information from this resume and return as JSON. Return ONLY valid JSON, no markdown, no explanation.

JSON structure to return:
{
  "first_name": "",
  "last_name": "",
  "middle_name": "",
  "email": "",
  "mobile": "",
  "gender": "",
  "dob": "",
  "current_city": "",
  "full_address": "",
  "linkedin_url": "",
  "portfolio_url": "",
  "current_ctc": "",
  "expected_ctc": "",
  "notice_period": "",
  "willing_to_relocate": false,
  "experience_years": 0,
  "skills": [],
  "target_roles": [],
  "experience": [{"company": "", "role": "", "duration": ""}],
  "internships": [],
  "projects": [],
  "education": [{"degree": "", "institution": "", "year": ""}],
  "certifications": [],
  "current_employer": "",
  "highest_qualification": "",
  "is_fresher": false,
  "common_answers": {
    "years_in_primary_skill": "",
    "night_shifts": "No",
    "valid_passport": "No",
    "fresher_or_experienced": "Fresher",
    "highest_qualification": "",
    "current_employer": ""
  }
}

Resume text:
${resumeText.substring(0, 6000)}`

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://fill-my-job-1rep.vercel.app',
      'X-Title': 'FindMyJob.AI Resume Extractor',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-lite:free',
      max_tokens: 2000,
      messages: [
        {
          role: 'system',
          content: 'You are a resume parser. Extract structured data from resumes. Return ONLY valid JSON, no markdown fences, no extra text.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!res.ok) {
    throw new Error(`OpenRouter error: ${res.status}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content || '{}'
  
  try {
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return {}
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('resume') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    // Extract text from PDF
    const buffer = await file.arrayBuffer()
    const resumeText = await extractTextFromPDF(buffer)

    // Use AI to parse resume
    let extracted: Record<string, unknown> = {}
    try {
      extracted = await extractWithAI(resumeText)
    } catch (err) {
      console.error('AI extraction failed:', err)
      // Return partial result with just the resume text
      extracted = { resume_text: resumeText }
    }

    // Always include raw text for reference
    extracted.resume_text = resumeText.substring(0, 5000)

    return NextResponse.json(extracted)
  } catch (err) {
    console.error('Extract resume error:', err)
    return NextResponse.json(
      { error: 'Failed to process resume', resume_text: '' },
      { status: 500 }
    )
  }
}
