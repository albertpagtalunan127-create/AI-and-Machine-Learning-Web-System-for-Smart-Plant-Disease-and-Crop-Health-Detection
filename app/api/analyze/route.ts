import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { diseaseName, plantType } = await req.json();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
  }

  const isHealthy = diseaseName.toLowerCase().includes('healthy');

  const systemPrompt = `You are a plant pathology expert. Always respond with ONLY raw JSON (no markdown, no code blocks, no explanation). The JSON must match this exact structure:
{
  "symptoms": "string",
  "treatment": ["string", "string", "string", "string"],
  "prevention": ["string", "string", "string"],
  "severity": "none|low|medium|high",
  "urgency": "string"
}`;

  const userPrompt = isHealthy
    ? `The plant "${diseaseName}" on ${plantType || 'a plant'} was detected as healthy. Respond with a healthy plant JSON.`
    : `A plant disease detection AI identified "${diseaseName}" on a ${plantType || 'plant'}. Provide symptoms, treatment steps, prevention tips, severity level, and a one-sentence urgency note for the farmer.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `Groq API error: ${err}` }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    // Strip any accidental markdown wrapping
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to get AI analysis' }, { status: 500 });
  }
}
