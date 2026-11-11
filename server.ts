import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '5mb' }));

  // =========================================================================
  // Vowora Studio AI Assistant (Server-Side @google/genai Integration)
  // =========================================================================
  app.post('/api/ai/studio', async (req, res) => {
    const {
      taskType,
      tone = 'Elegant',
      language = 'en',
      partnerOne = 'Aarav',
      partnerTwo = 'Meera',
      weddingDate = '',
      venue = '',
      familyOne = '',
      familyTwo = '',
      eventName = '',
      currentText = '',
    } = req.body || {};

    const langLabel =
      language === 'hi' ? 'Hindi (Devanagari script)' : language === 'gu' ? 'Gujarati script' : 'English';

    // Curated manual fallback options when AI service is unconfigured or unavailable
    const buildFallbackSuggestions = () => {
      const couple = `${partnerOne} & ${partnerTwo}`;
      const venuePhrase = venue ? ` at ${venue}` : '';
      const datePhrase = weddingDate ? ` on ${weddingDate}` : '';
      const famPhrase =
        familyOne && familyTwo
          ? `Together with their families, ${familyOne} and ${familyTwo}, `
          : 'Together with their families, ';

      if (language === 'hi') {
        return [
          {
            label: `${tone} — विकल्प 1`,
            content: `सप्रेम निमंत्रण: हमारे परिवारों के आशीर्वाद से ${partnerOne} और ${partnerTwo} के शुभ विवाह समारोह में आपकी गरिमामयी उपस्थिति सादर प्रार्थनीय है।`,
          },
          {
            label: `${tone} — विकल्प 2`,
            content: `दो दिलों और दो परिवारों के इस पावन मिलन पर, हम आपको ${partnerOne} एवं ${partnerTwo} के विवाह उत्सव में शामिल होने के लिए हृदय से आमंत्रित करते हैं।`,
          },
          {
            label: `${tone} — विकल्प 3`,
            content: `प्रेम, परंपरा और आनंद की इस नई शुरुआत में ${partnerOne} और ${partnerTwo} को आशीर्वाद देने के लिए आपका स्वागत है।`,
          },
        ];
      }

      if (language === 'gu') {
        return [
          {
            label: `${tone} — વિકલ્પ 1`,
            content: `સ્નેહભર્યું આમંત્રણ: અમારા પરિવારોના આશીર્વાદ સાથે ${partnerOne} અને ${partnerTwo} ના શુભ લગ્ન પ્રસંગે આપની ઉપસ્થિતિ અમારા આનંદને બમણો કરશે.`,
          },
          {
            label: `${tone} — વિકલ્પ 2`,
            content: `પ્રેમ અને સંસ્કારના આ પવિત્ર બંધનમાં જોડાતા ${partnerOne} તથા ${partnerTwo} ને આશીર્વાદ આપવા આપ સૌને ભાવભર્યું નિમંત્રણ છે.`,
          },
          {
            label: `${tone} — વિકલ્પ 3`,
            content: `${partnerOne} અને ${partnerTwo} ના જીવનના આ નવા અધ્યાયની ઉજવણીમાં સહભાગી થવા આપનું હાર્દિક સ્વાગત છે.`,
          },
        ];
      }

      switch (taskType) {
        case 'headline':
          return [
            {
              label: `${tone} Editorial`,
              content: `Where Two Chapters Become One Eternal Story — ${couple}`,
            },
            {
              label: `${tone} Poetic`,
              content: `In the Quiet Beauty of Forever, ${partnerOne} & ${partnerTwo} Begin Their Life Together`,
            },
            {
              label: `${tone} Minimal`,
              content: `The Wedding Celebration of ${partnerOne} and ${partnerTwo}`,
            },
          ];
        case 'story':
          return [
            {
              label: `${tone} Narrative`,
              content: `What began as an unhurried conversation over coffee soon grew into a lifetime of shared mornings, long walks, and unwavering friendship. Today, ${partnerOne} and ${partnerTwo} step into their next chapter surrounded by the people who shaped their journey.`,
            },
            {
              label: `${tone} Romantic`,
              content: `Across seasons and cities, ${partnerOne} and ${partnerTwo} found a home in one another. With grateful hearts, they invite you to witness the promises that will guide the rest of their lives${venuePhrase}.`,
            },
            {
              label: `${tone} Modern`,
              content: `Years of laughter, shared adventures, and quiet devotion have led ${partnerOne} and ${partnerTwo} to this moment. Nothing would mean more than celebrating with you${datePhrase}.`,
            },
          ];
        case 'event':
          return [
            {
              label: `${tone} Event Note`,
              content: `Join ${couple} for ${eventName || 'our celebration'}${venuePhrase} — an evening of music, warm conversation, and timeless hospitality.`,
            },
            {
              label: `${tone} Cultural`,
              content: `An intimate gathering celebrating sacred traditions, family blessings, and joyful festivities for ${eventName || 'the ceremony'}.`,
            },
            {
              label: `${tone} Concise`,
              content: `Cocktails, dinner, and celebration under the stars in honor of ${couple}.`,
            },
          ];
        case 'dress_code':
          return [
            {
              label: `${tone} Attire Guide`,
              content: `Formal Heritage or Black Tie Optional — ivory, champagne, sage, and warm earth tones are warmly encouraged.`,
            },
            {
              label: `${tone} Festive`,
              content: `Traditional Indian Couture or Elevated Evening Wear. Please wear comfortable footwear for courtyard celebrations.`,
            },
            {
              label: `${tone} Minimal`,
              content: `Cocktail & Garden Formal in soft neutral or pastel palettes.`,
            },
          ];
        default:
          return [
            {
              label: `${tone} Formal Wording`,
              content: `${famPhrase}we joyfully request the honor of your presence at the wedding celebration of ${partnerOne} and ${partnerTwo}${datePhrase}${venuePhrase}.`,
            },
            {
              label: `${tone} Warm & Personal`,
              content: `With full hearts, we invite you to celebrate with us as ${partnerOne} and ${partnerTwo} exchange vows and begin their marriage${venuePhrase}${datePhrase}.`,
            },
            {
              label: `${tone} Editorial Minimal`,
              content: `Please join ${partnerOne} & ${partnerTwo} for an intimate celebration of love, family, and new beginnings${datePhrase}${venuePhrase}.`,
            },
          ];
      }
    };

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      return res.json({
        source: 'fallback',
        suggestions: buildFallbackSuggestions(),
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `You are Vowora Studio, a luxury editorial wedding stationery copywriter.
Generate 3 distinct, refined wording options for the following wedding invitation request.
STRICT RULES:
- Never invent names, dates, venues, or family details that were not supplied below.
- Use ONLY the provided details:
  Partner One: ${partnerOne}
  Partner Two: ${partnerTwo}
  Family One: ${familyOne || 'Not specified'}
  Family Two: ${familyTwo || 'Not specified'}
  Wedding Date: ${weddingDate || 'Not specified'}
  Venue: ${venue || 'Not specified'}
  Event Name: ${eventName || 'Wedding Celebration'}
  Existing Text (if rewriting/translating): ${currentText || 'None'}
- Requested Task: ${taskType} (options: wording, headline, family_wording, translate, event, story, dress_code, rsvp_reminder)
- Requested Tone: ${tone}
- Output Language: ${langLabel}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are Vowora Studio, an editorial luxury wedding copywriter. Keep copy warm, timeless, and free of clichés or emojis.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: {
                  type: Type.STRING,
                  description: 'Short editorial style label for this option.',
                },
                content: {
                  type: Type.STRING,
                  description: 'The generated wedding copy in the requested language.',
                },
              },
              required: ['label', 'content'],
            },
          },
        },
      });

      const rawText = (response.text ?? '[]').trim();
      const parsed = JSON.parse(rawText);
      return res.json({
        source: 'gemini',
        suggestions: Array.isArray(parsed) && parsed.length > 0 ? parsed : buildFallbackSuggestions(),
      });
    } catch (error) {
      console.error('Vowora Studio AI error:', error);
      return res.json({
        source: 'fallback',
        suggestions: buildFallbackSuggestions(),
        notice: error instanceof Error ? error.message : 'Using curated editorial templates.',
      });
    }
  });

  // =========================================================================
  // Server-Side QR Check-In Payload Validation
  // =========================================================================
  app.post('/api/checkin/verify', (req, res) => {
    const { qrPayload, expectedWeddingId } = req.body || {};

    if (!qrPayload || typeof qrPayload !== 'string') {
      return res.status(400).json({
        valid: false,
        error: 'Missing or malformed QR pass code.',
      });
    }

    // Format: VOWORA:<weddingId>:<inviteCode> or direct <inviteCode>
    const trimmed = qrPayload.trim();
    if (trimmed.startsWith('VOWORA:')) {
      const parts = trimmed.split(':');
      if (parts.length !== 3) {
        return res.status(400).json({
          valid: false,
          error: 'Invalid VOWORA QR pass signature format.',
        });
      }
      const [, payloadWeddingId, inviteCode] = parts;
      if (expectedWeddingId && payloadWeddingId !== expectedWeddingId) {
        return res.status(403).json({
          valid: false,
          error: 'This QR pass belongs to a different wedding project.',
        });
      }
      return res.json({
        valid: true,
        weddingId: payloadWeddingId,
        inviteCode: inviteCode.toUpperCase(),
      });
    }

    // Direct invite code entry (e.g. VOW-AARAV-104)
    const codeRegex = /^[a-zA-Z0-9_\-]{4,64}$/;
    if (!codeRegex.test(trimmed)) {
      return res.status(400).json({
        valid: false,
        error: 'Entry code contains invalid characters.',
      });
    }

    return res.json({
      valid: true,
      weddingId: expectedWeddingId || null,
      inviteCode: trimmed.toUpperCase(),
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VOWORA server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
