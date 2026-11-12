const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { GoogleGenAI } = require('@google/genai');
const {
  DEFAULT_CANONICAL_DOMAIN,
  resolveSlideRouteKey,
  injectServerRenderedMetadata,
} = require('./seo-metadata.cjs');

const root = __dirname;
const port = Number(process.env.PORT || process.argv[2] || 3000);
const host = process.env.HOST || '0.0.0.0';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
};

const PRESET_ASSETS = {
  'montesquieu-oval': {
    relPath: 'assets/report/montesquieu-oval.webp',
    mimeType: 'image/webp',
  },
  compromisso: {
    relPath: 'assets/report/compromisso.jpg',
    mimeType: 'image/jpeg',
  },
  justica: {
    relPath: 'assets/report/justica.jpg',
    mimeType: 'image/jpeg',
  },
};

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: { 'User-Agent': 'aistudio-build' },
    },
  });
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readJsonBody(req, maxBytes = 25 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error('Request payload too large (max 25MB).'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(new Error('Invalid JSON payload.'));
      }
    });
    req.on('error', reject);
  });
}

function resolveInputImage(body) {
  if (body.imageBase64 && typeof body.imageBase64 === 'string') {
    let raw = body.imageBase64.trim();
    let detectedMime = body.mimeType || 'image/jpeg';
    const dataUrlMatch = raw.match(/^data:([^;]+);base64,(.+)$/i);
    if (dataUrlMatch) {
      detectedMime = dataUrlMatch[1];
      raw = dataUrlMatch[2];
    }
    return { base64: raw, mimeType: detectedMime };
  }
  if (body.presetAsset && PRESET_ASSETS[body.presetAsset]) {
    const preset = PRESET_ASSETS[body.presetAsset];
    const absPath = path.resolve(root, preset.relPath);
    const buf = fs.readFileSync(absPath);
    return { base64: buf.toString('base64'), mimeType: preset.mimeType };
  }
  return null;
}

async function handleResearch(req, res) {
  const body = await readJsonBody(req);
  const query = String(body.query || '').trim();
  const slideContext = String(body.slideContext || '').trim();
  if (!query) {
    sendJson(res, 400, { error: 'Please provide a research query.' });
    return;
  }

  const ai = getGenAI();
  const fullPrompt = slideContext
    ? `Active Slide Context: ${slideContext}\n\nResearch Question: ${query}`
    : query;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: fullPrompt,
    config: {
      systemInstruction:
        'You are a scholarly legal history research assistant supporting Ana Vitória Vanzin Mendes (PPGD/UFSC) for her 10-minute discussant response "Whose liberty? Montesquieu in Brazil: Reception, context, and the conditions of liberty" following Serge Dauchy at the 11 November 2026 UFSC panel on Montesquieu. ' +
        'Focus on Montesquieu’s De l’esprit des lois (1748), Serge Dauchy’s analysis of a wider “system of liberty” (constitutional arrangements, civil and criminal laws, judicial institutions), Brazilian constitutional reception in 1824 (Article 10: Legislative, Moderating, Executive, Judicial), visual representations of legal authority (Aurélio de Figueiredo’s 1896 Compromisso Constitucional representing the oath of 26 February 1891, and Alfredo Ceschiatti’s 1961 A Justiça at the Supremo Tribunal Federal), and debates on legal transfers and historical hybridity (Alan Watson, Pierre Legrand, imposed transfers, deliberate receptions, overlapping legal orders). Maintain strict documentary guardrails: do not present “system of liberty” as a verified English quotation of Montesquieu, do not present the Moderating Power as a fourth branch proposed by Montesquieu, and never claim the artworks prove direct influence from Montesquieu.',
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || '';
  const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const seenUris = new Set();
  const sources = [];

  for (const chunk of rawChunks) {
    const uri = chunk?.web?.uri;
    const title = chunk?.web?.title;
    if (uri && !seenUris.has(uri)) {
      seenUris.add(uri);
      sources.push({
        uri,
        title: title || uri,
      });
    }
  }

  sendJson(res, 200, { text, sources });
}

async function handleImageStudio(req, res) {
  const body = await readJsonBody(req);
  const prompt = String(body.prompt || '').trim();
  if (!prompt) {
    sendJson(res, 400, { error: 'Please enter a prompt to create or edit an image.' });
    return;
  }

  const allowedRatios = new Set(['1:1', '3:4', '4:3', '9:16', '16:9', '1:4', '4:1']);
  const aspectRatio = allowedRatios.has(body.aspectRatio) ? body.aspectRatio : '4:3';
  const allowedSizes = new Set(['1K', '2K', '4K']);
  const imageSize = allowedSizes.has(body.imageSize) ? body.imageSize : '1K';
  const inputImage = resolveInputImage(body);

  const ai = getGenAI();
  const parts = [];
  if (inputImage) {
    parts.push({
      inlineData: {
        data: inputImage.base64,
        mimeType: inputImage.mimeType,
      },
    });
  }
  parts.push({ text: prompt });

  const config = {
    imageConfig: {
      aspectRatio,
      imageSize,
    },
  };

  if (body.useSearch) {
    config.tools = [
      {
        googleSearch: {
          searchTypes: {
            webSearch: {},
            imageSearch: {},
          },
        },
      },
    ];
  }

  const response = await ai.models.generateContent({
    model: 'gemini-nano-banana-2.1',
    contents: { parts },
    config,
  });

  let imageDataUrl = null;
  let notes = '';

  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData?.data && !imageDataUrl) {
      const mime = part.inlineData.mimeType || 'image/png';
      imageDataUrl = `data:${mime};base64,${part.inlineData.data}`;
    } else if (part.text) {
      notes += (notes ? '\n' : '') + part.text;
    }
  }

  if (!imageDataUrl) {
    sendJson(res, 502, {
      error: notes || 'No image was returned by gemini-nano-banana-2.1. Try refining your prompt.',
    });
    return;
  }

  sendJson(res, 200, {
    imageDataUrl,
    notes,
    mode: inputImage ? 'edit' : 'create',
    aspectRatio,
  });
}

async function handleVideoAnimation(req, res) {
  const body = await readJsonBody(req);
  const inputImage = resolveInputImage(body);
  if (!inputImage) {
    sendJson(res, 400, {
      error: 'Please upload a photo or select one of the archival slide plates to animate.',
    });
    return;
  }

  const aspectRatio = body.aspectRatio === '9:16' ? '9:16' : '16:9';
  const prompt =
    String(body.prompt || '').trim() ||
    'Subtle archival camera pan with gentle warm museum gallery lighting and soft atmospheric depth, preserving historical portraiture and stone texture.';

  const ai = getGenAI();
  const interaction = await ai.interactions.create(
    {
      model: 'gemini-omni-1.2-flash',
      input: [
        {
          type: 'image',
          mime_type: inputImage.mimeType,
          data: inputImage.base64,
        },
        {
          type: 'text',
          text: prompt,
        },
      ],
      background: false,
      store: false,
      stream: false,
      response_format: {
        type: 'video',
        aspect_ratio: aspectRatio,
      },
    },
    { timeout: 300000 }
  );

  let videoPart = interaction.output_video;
  if (!videoPart && Array.isArray(interaction.outputs)) {
    videoPart = interaction.outputs.find((o) => o && (o.type === 'video' || o.mime_type?.startsWith('video/')));
  }

  if (!videoPart || (!videoPart.data && !videoPart.uri)) {
    sendJson(res, 502, {
      error: 'No video output was returned by gemini-omni-1.2-flash. Please try again.',
    });
    return;
  }

  const mimeType = videoPart.mime_type || 'video/mp4';
  let videoDataUrl = null;
  if (videoPart.data) {
    const base64Str = Buffer.isBuffer(videoPart.data)
      ? videoPart.data.toString('base64')
      : videoPart.data instanceof Uint8Array
      ? Buffer.from(videoPart.data).toString('base64')
      : String(videoPart.data);
    videoDataUrl = `data:${mimeType};base64,${base64Str}`;
  } else if (videoPart.uri) {
    videoDataUrl = videoPart.uri;
  }

  sendJson(res, 200, {
    videoDataUrl,
    mimeType,
    aspectRatio,
  });
}

async function handleChatbot(req, res) {
  const body = await readJsonBody(req);
  const message = String(body.message || '').trim();
  const history = Array.isArray(body.history) ? body.history : [];
  const requestedModel = String(body.model || 'gemini-3.8-flash').trim();
  const slideContext = String(body.slideContext || '').trim();

  if (!message) {
    sendJson(res, 400, { error: 'Please enter a message to begin or continue the conversation.' });
    return;
  }

  // Model selection per user request and guidelines:
  // - gemini-4-carbon for deep reasoning tasks
  // - gemini-4-argon for complex interactive tasks
  // - gemini-3.8-flash for general tasks
  // - gemini-3.1-flash-lite for fast tasks
  const allowedModels = new Set([
    'gemini-4-carbon',
    'gemini-4-argon',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
  ]);
  const model = allowedModels.has(requestedModel) ? requestedModel : 'gemini-3.8-flash';

  const systemInstruction =
    'You are a scholarly discussant dialogue assistant supporting Ana Vitória Vanzin Mendes (PPGD/UFSC) for her 10-minute intervention "Whose liberty? Montesquieu in Brazil: Reception, context, and the conditions of liberty" responding to Serge Dauchy at CCJ/UFSC on 11 November 2026. ' +
    'Provide rigorous, articulate, and historically grounded dialogue on Montesquieu’s De l’esprit des lois (1748), Dauchy’s analysis of a wider “system of liberty” (constitutional arrangements, civil and criminal laws, judicial institutions), Brazil’s 1824 Constitution (Article 10: Legislative, Moderating, Executive, Judicial), visual staging of legal authority (Figueiredo’s 1896 Compromisso Constitucional and Ceschiatti’s 1961 A Justiça), and comparative legal transfer debates (Watson, Legrand, Teubner). ' +
    'Maintain strict guardrails: do not present "system of liberty" as a verified English quotation of Montesquieu, do not treat the Moderating Power as a fourth branch proposed by Montesquieu, and keep the discussant’s image readings as her own. ' +
    (slideContext ? `Active Slide Context: ${slideContext}` : '');

  const ai = getGenAI();

  const contents = [];
  for (const turn of history) {
    if (turn && turn.role && turn.text) {
      contents.push({
        role: turn.role === 'model' || turn.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(turn.text) }],
      });
    }
  }
  contents.push({
    role: 'user',
    parts: [{ text: message }],
  });

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
    },
  });

  const replyText = response.text || '';
  sendJson(res, 200, {
    reply: replyText,
    modelUsed: model,
  });
}

// ============================================================================
// REAL-TIME AUDIENCE SLIDE SYNC BROKER (Companion to Firebase Realtime Database)
// ============================================================================
const SLIDE_TITLES = {
  1: 'Whose liberty? Montesquieu in Brazil',
  2: 'A “system of liberty”',
  3: 'Brazil, 1824',
  4: 'Making legal authority visible',
  5: 'What travels with a legal rule?',
  6: 'Hybridity is historical',
  7: 'Questions for Serge',
};

const syncSessions = new Map(); // sessionCode -> state object
const syncSubscribers = new Map(); // sessionCode -> Set<http.ServerResponse>

function normalizeCodeServer(raw) {
  const code = String(raw || 'UFSC-2026')
    .trim()
    .toUpperCase();
  if (!/^[A-Z0-9_-]{4,32}$/.test(code)) {
    return null;
  }
  return code;
}

function getOrCreateSessionState(sessionCode) {
  if (!syncSessions.has(sessionCode)) {
    syncSessions.set(sessionCode, {
      sessionCode,
      currentSlide: 1,
      slideTitle: SLIDE_TITLES[1],
      activeCallout: '',
      status: 'live',
      presenterName: 'Ana Vitória Vanzin Mendes · UFSC',
      rtdbPath: `syncSessions/${sessionCode}`,
      updatedAtMs: Date.now(),
    });
  }
  const base = syncSessions.get(sessionCode);
  const subs = syncSubscribers.get(sessionCode);
  return {
    ...base,
    viewerCount: subs ? subs.size : 0,
  };
}

function broadcastSessionState(sessionCode) {
  const subs = syncSubscribers.get(sessionCode);
  if (!subs || subs.size === 0) return;
  const payload = JSON.stringify(getOrCreateSessionState(sessionCode));
  const msg = `event: sync-state\ndata: ${payload}\n\n`;
  for (const clientRes of subs) {
    try {
      clientRes.write(msg);
    } catch {
      subs.delete(clientRes);
    }
  }
}

async function handleAudienceSyncPublish(req, res) {
  const body = await readJsonBody(req, 64 * 1024);
  const code = normalizeCodeServer(body.sessionCode);
  if (!code) {
    sendJson(res, 400, {
      error: 'Invalid session code. Use 4–32 letters, numbers, hyphens, or underscores.',
    });
    return;
  }

  const slideNum = Number(body.currentSlide);
  if (!Number.isInteger(slideNum) || slideNum < 1 || slideNum > 7) {
    sendJson(res, 400, { error: 'currentSlide must be an integer between 1 and 7.' });
    return;
  }

  const nextState = {
    sessionCode: code,
    currentSlide: slideNum,
    slideTitle: String(body.slideTitle || SLIDE_TITLES[slideNum] || `Slide ${slideNum}`).slice(
      0,
      160
    ),
    activeCallout: String(body.activeCallout || '').slice(0, 64),
    status: body.status === 'ended' ? 'ended' : 'live',
    presenterName:
      String(body.presenterName || 'Ana Vitória Vanzin Mendes · UFSC')
        .trim()
        .slice(0, 120) || 'Ana Vitória Vanzin Mendes · UFSC',
    rtdbPath: `syncSessions/${code}`,
    updatedAtMs: Date.now(),
  };

  syncSessions.set(code, nextState);
  broadcastSessionState(code);
  sendJson(res, 200, getOrCreateSessionState(code));
}

function handleAudienceSyncEvents(req, res, urlObj) {
  const code = normalizeCodeServer(urlObj.searchParams.get('session') || 'UFSC-2026');
  if (!code) {
    sendJson(res, 400, { error: 'Invalid session code.' });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  if (!syncSubscribers.has(code)) {
    syncSubscribers.set(code, new Set());
  }
  const subs = syncSubscribers.get(code);
  subs.add(res);

  // Immediately send initial state and notify room of updated viewerCount
  broadcastSessionState(code);

  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    subs.delete(res);
    broadcastSessionState(code);
  });
}

http
  .createServer(async (req, res) => {
    let urlObj;
    let pathname;
    try {
      urlObj = new URL(req.url, 'http://localhost');
      pathname = decodeURIComponent(urlObj.pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }

    if (req.method === 'GET' && pathname === '/api/audience-sync/events') {
      handleAudienceSyncEvents(req, res, urlObj);
      return;
    }

    if (req.method === 'GET' && pathname === '/api/audience-sync/state') {
      const code = normalizeCodeServer(urlObj.searchParams.get('session') || 'UFSC-2026');
      if (!code) {
        sendJson(res, 400, { error: 'Invalid session code.' });
        return;
      }
      sendJson(res, 200, getOrCreateSessionState(code));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/audience-sync/publish') {
      try {
        await handleAudienceSyncPublish(req, res);
      } catch (err) {
        sendJson(res, 500, { error: err.message || 'Failed to publish audience sync state.' });
      }
      return;
    }

    if (req.method === 'POST' && pathname === '/api/studio/research') {
      try {
        await handleResearch(req, res);
      } catch (err) {
        sendJson(res, 500, { error: err.message || 'Search grounding request failed.' });
      }
      return;
    }

    if (req.method === 'POST' && pathname === '/api/studio/image') {
      try {
        await handleImageStudio(req, res);
      } catch (err) {
        sendJson(res, 500, { error: err.message || 'Image generation/editing request failed.' });
      }
      return;
    }

    if (req.method === 'POST' && pathname === '/api/studio/video') {
      try {
        await handleVideoAnimation(req, res);
      } catch (err) {
        sendJson(res, 500, { error: err.message || 'Video animation request failed.' });
      }
      return;
    }

    if (req.method === 'POST' && pathname === '/api/studio/chat') {
      try {
        await handleChatbot(req, res);
      } catch (err) {
        sendJson(res, 500, { error: err.message || 'Chatbot request failed.' });
      }
      return;
    }

    // Deep-linked slide routes, sources, landing, and stories with server-rendered SEO & OpenGraph tags
    const slideRouteKey = resolveSlideRouteKey(pathname);
    if ((req.method === 'GET' || req.method === 'HEAD') && slideRouteKey) {
      try {
        const indexHtml = fs.readFileSync(path.resolve(root, 'index.html'), 'utf8');
        const customDomain = process.env.CANONICAL_DOMAIN || process.env.SITE_URL || DEFAULT_CANONICAL_DOMAIN;
        const renderedHtml = injectServerRenderedMetadata(indexHtml, pathname, customDomain);
        const bodyBuf = Buffer.from(renderedHtml, 'utf8');

        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Length': bodyBuf.length,
          'Cache-Control': 'no-cache',
        });
        if (req.method === 'HEAD') {
          res.end();
          return;
        }
        res.end(bodyBuf);
        return;
      } catch (err) {
        console.error('Failed to render slide route:', err);
      }
    }

    // Strip /slide/ prefix if requested for static subresources (e.g. /slide/css/report.css -> /css/report.css)
    let normalizedPath = pathname;
    if (normalizedPath.startsWith('/slide/')) {
      normalizedPath = normalizedPath.replace(/^\/slide/, '');
    }

    const relPathname = normalizedPath === '/' ? '/index.html' : normalizedPath;
    let file = path.resolve(root, '.' + relPathname);
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }

    const serveResolvedFile = (targetFile, stat) => {
      const contentType = types[path.extname(targetFile).toLowerCase()] || 'application/octet-stream';
      const rangeHeader = req.headers.range;

      if (rangeHeader && /^bytes=\d*-\d*$/.test(rangeHeader)) {
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parts[0] ? parseInt(parts[0], 10) : 0;
        const end = parts[1] ? Math.min(parseInt(parts[1], 10), stat.size - 1) : stat.size - 1;

        if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= stat.size) {
          res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end();
          return;
        }

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': end - start + 1,
          'Content-Type': contentType,
        });
        if (req.method === 'HEAD') {
          res.end();
          return;
        }
        fs.createReadStream(targetFile, { start, end })
          .on('error', () => res.destroy())
          .pipe(res);
        return;
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stat.size,
        'Accept-Ranges': 'bytes',
      });
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      fs.createReadStream(targetFile)
        .on('error', () => res.destroy())
        .pipe(res);
    };

    fs.stat(file, (err, stat) => {
      if (!err && stat.isFile()) {
        serveResolvedFile(file, stat);
        return;
      }
      if (relPathname.startsWith('/assets/aistudio/')) {
        const publicFallback = path.resolve(root, './public' + relPathname);
        if (publicFallback.startsWith(root + path.sep)) {
          fs.stat(publicFallback, (fbErr, fbStat) => {
            if (!fbErr && fbStat.isFile()) {
              serveResolvedFile(publicFallback, fbStat);
              return;
            }
            res.writeHead(404).end('Not found');
          });
          return;
        }
      }
      res.writeHead(404).end('Not found');
    });
  })
  .listen(port, host, () => console.log(`Presentation server: http://${host}:${port}/index.html`));
