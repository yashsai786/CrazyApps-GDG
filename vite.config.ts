import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function absentBackendPlugin(): Plugin {
  return {
    name: 'absent-backend-api',
    configureServer(server) {
      server.middlewares.use('/api/analyze', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        try {
          // Read request body
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(chunk as Buffer);
          }
          const rawBody = Buffer.concat(chunks).toString('utf-8');
          const body = JSON.parse(rawBody);

          const { image, mode } = body;
          if (!image) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing image data' }));
            return;
          }

          const apiKey = process.env.GROQ_API_KEY;
          if (!apiKey) {
            console.error('[AbsentAPI] GROQ_API_KEY environment variable is not configured');
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'AI service configuration missing' }));
            return;
          }

          // Clean image base64 if data URL
          let imageUrl = image;
          if (!imageUrl.startsWith('data:')) {
            imageUrl = `data:image/jpeg;base64,${image}`;
          }

          // Build mode-specific focus instructions
          const modeDescriptions: Record<string, string> = {
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
            res.statusCode = isRateLimit ? 429 : 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              error: isRateLimit ? 'Sorry, AI rate limit exceeded. Come back tomorrow.' : 'The AI could not inspect this image right now. Please try again.',
              isRateLimit: isRateLimit
            }));
            return;
          }

          const groqData = await groqRes.json();
          const rawContent = groqData.choices?.[0]?.message?.content;
          if (!rawContent) {
            throw new Error('Empty response from AI model');
          }

          // Parse and validate JSON
          let parsed;
          try {
            parsed = JSON.parse(rawContent);
          } catch (e) {
            console.error('[AbsentAPI] JSON parse error:', rawContent);
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid response from vision model' }));
            return;
          }

          parsed.mode = mode;
          parsed.timestamp = Date.now();

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(parsed));
        } catch (err: any) {
          console.error('[AbsentAPI] Internal error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'The scan could not be completed.' }));
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  // Load env variables (GROQ_API_KEY)
  const env = loadEnv(mode, process.cwd(), '');
  process.env.GROQ_API_KEY = env.GROQ_API_KEY || process.env.GROQ_API_KEY;

  return {
    plugins: [react(), absentBackendPlugin()],
    server: {
      port: 3000,
      open: false,
      host: true
    }
  };
});
