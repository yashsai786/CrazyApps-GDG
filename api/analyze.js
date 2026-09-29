// Vercel Serverless Function for ABSENT AI Vision Auditor
export default async function handler(req, res) {
  // CORS support
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse request body
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // Leave as string if parsing fails
      }
    } else if (!body) {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const rawBody = Buffer.concat(chunks).toString('utf-8');
      if (rawBody) {
        body = JSON.parse(rawBody);
      }
    }

    const { image, mode = 'accessibility' } = body || {};

    if (!image) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ error: 'Missing image data' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('[AbsentAPI] GROQ_API_KEY environment variable is not configured');
      res.setHeader('Content-Type', 'application/json');
      return res.status(500).json({ 
        error: 'GROQ_API_KEY is not configured on the server. Please add it to your Vercel Environment Variables.' 
      });
    }

    // Ensure valid data URL format
    let imageUrl = image;
    if (!imageUrl.startsWith('data:')) {
      imageUrl = `data:image/jpeg;base64,${image}`;
    }

    // Build mode-specific focus instructions
    const modeDescriptions = {
      accessibility: `Focus on ACCESSIBILITY: look for potentially missing, inaccessible, or obstructed infrastructure such as ramps, step-free access, handrails, tactile ground indicators, accessible signage, elevator/lift entrances, or accessible restroom markings. Never claim an accessible route definitely does not exist outside the frame; use phrases like 'No accessible alternative is visible in this frame'.`,
      safety: `Focus on SAFETY: look for visible safety concerns or potentially missing safety infrastructure such as emergency exit signage, fire extinguisher visibility, blocked egress routes, missing guardrails or handrails on drops, warning signage for slip/trip hazards, or exposed hazards. Do not make definitive legal certifications.`,
      sustainability: `Focus on SUSTAINABILITY: look for potentially missing environmental infrastructure such as waste separation/recycling bins, water refill stations, pedestrian paths, bicycle racks/parking, shaded greenery, or daylighting/energy-saving opportunities.`
    };

    const modeInstruction = modeDescriptions[mode] || modeDescriptions.accessibility;

    const systemPrompt = `You are ABSENT, an expert AI visual gap auditor that inspects scenes to identify what physical infrastructure appears to be missing, inaccessible, obstructed, or inadequate.

${modeInstruction}

IMPORTANT RULES:
1. Do not merely describe visible objects. Identify meaningful GAPS or ABSENCES.
2. Base every observation strictly on visible evidence in the provided frame.
3. NEVER claim something definitely does not exist outside the visible frame. Use cautious, objective language:
   - Use 'No [element] is visible in this frame' instead of 'There is no [element]'.
   - Use 'A potential concern is visible' instead of 'This area is dangerous'.
4. Every finding MUST include an explicit 'uncertainty' statement explaining what cannot be proven from this single camera frame.
5. Do not make legal, building code, or medical certifications.
6. Return valid JSON only with NO markdown wrappers or code fences, following this exact schema:
{
  "scene": "Concise description of the visible scene",
  "mode": "${mode}",
  "summary": "1-2 sentence overview of visible conditions and potential missing infrastructure",
  "findings": [
    {
      "title": "Clear concise title of potential gap (e.g. 'Accessible alternative not visible')",
      "severity": "low" | "medium" | "high",
      "confidence": 0.85,
      "evidence": [
        "Visible evidence point 1",
        "Visible evidence point 2"
      ],
      "uncertainty": "Precise explanation of why this absence cannot be definitively certified from this single frame",
      "recommendation": "Actionable recommendation (e.g. 'Check whether an accessible route exists outside the camera frame.')"
    }
  ],
  "overall_confidence": 0.82
}`;

    // Call Groq Vision API with active model qwen/qwen3.8-27b
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: `Inspect this image as an ABSENT visual gap auditor for: ${mode}. Identify any infrastructure that appears missing or not visible.` 
              },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1200,
        temperature: 0.15
      })
    });

    if (!groqRes.ok) {
      const errData = await groqRes.text();
      console.error('[AbsentAPI] Groq error status:', groqRes.status, errData);
      const isRateLimit = groqRes.status === 429 || errData.toLowerCase().includes('rate_limit') || errData.toLowerCase().includes('quota');
      res.setHeader('Content-Type', 'application/json');
      return res.status(isRateLimit ? 429 : 502).json({ 
        error: isRateLimit ? 'Sorry, AI rate limit exceeded. Come back tomorrow.' : 'The AI could not inspect this image right now. Please try again.',
        isRateLimit: isRateLimit
      });
    }

    const groqData = await groqRes.json();
    const rawContent = groqData.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error('Empty response from AI model');
    }

    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (e) {
      console.error('[AbsentAPI] JSON parse error:', rawContent);
      res.setHeader('Content-Type', 'application/json');
      return res.status(502).json({ error: 'Invalid response from vision model' });
    }

    parsed.mode = mode;
    parsed.timestamp = Date.now();

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(parsed);
  } catch (err) {
    console.error('[AbsentAPI] Internal error:', err);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: 'The scan could not be completed.' });
  }
}
