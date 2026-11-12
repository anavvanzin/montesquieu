/**
 * Performance Monitoring & Bottleneck Diagnostic Engine
 * Tracks slide transition latency, RAF frame drops, main-thread Long Tasks,
 * high-resolution imagery decode/resource bottlenecks, and 3D WebGL Meridian rendering.
 *
 * Pure evaluation helpers are exported at module top-level for deterministic unit testing
 * (via node:test) while keeping the live presentation stage free of visual clutter.
 */

export const PERF_BUDGETS = {
  targetFrameMs: 16.7,
  droppedFrameThresholdMs: 28.0,
  severeFrameThresholdMs: 50.0,
  transitionWarnMs: 580.0,
  transitionBottleneckMs: 850.0,
  longTaskWarnMs: 50.0,
  highResMegapixelsWarn: 1.8,
  highResMegapixelsBottleneck: 3.5,
  oversampleRatioWarn: 2.5,
  imageDecodeWarnMs: 16.7,
  imageDecodeBottleneckMs: 40.0,
  imageTransferWarnBytes: 900 * 1024,
  threeHardwareWarnMs: 20.0,
  threeSoftwareWarnMs: 38.0,
  threeDrawCallsWarn: 120,
  threeTrianglesWarn: 75000
};

function round1(val) {
  const n = Number(val);
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
}

function round2(val) {
  const n = Number(val);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

/**
 * Pure evaluator for a single slide transition measurement.
 * @param {Object} raw
 */
export function evaluateTransitionSample(raw = {}) {
  const fromSlide = Number(raw.fromSlide) || 1;
  const toSlide = Number(raw.toSlide) || 1;
  const trigger = String(raw.trigger || 'navigation');
  const mode = String(raw.mode || 'gsap');
  const interrupted = Boolean(raw.interrupted);
  const totalMs = Math.max(0, round1(raw.totalMs ?? 0));
  const frameCount = Math.max(0, Math.round(Number(raw.frameCount) || 0));
  const droppedFrames = Math.max(0, Math.round(Number(raw.droppedFrames) || 0));
  const worstFrameMs = Math.max(0, round1(raw.worstFrameMs ?? 0));
  const maxLongTaskMs = Math.max(0, round1(raw.maxLongTaskMs ?? 0));

  const estimatedFps =
    totalMs > 0 && frameCount > 0
      ? Math.min(120, Math.max(1, Math.round((frameCount * 1000) / totalMs)))
      : mode === 'instant'
      ? 60
      : 60;

  const bottlenecks = [];
  if (maxLongTaskMs >= PERF_BUDGETS.longTaskWarnMs) {
    bottlenecks.push('main-thread-long-task');
  }
  if (worstFrameMs >= PERF_BUDGETS.severeFrameThresholdMs || droppedFrames >= 4) {
    bottlenecks.push('frame-drop-jank');
  } else if (droppedFrames >= 2 || worstFrameMs >= PERF_BUDGETS.droppedFrameThresholdMs) {
    bottlenecks.push('minor-frame-drop');
  }
  if (!interrupted && mode !== 'instant' && totalMs >= PERF_BUDGETS.transitionBottleneckMs) {
    bottlenecks.push('high-transition-latency');
  } else if (!interrupted && mode !== 'instant' && totalMs >= PERF_BUDGETS.transitionWarnMs) {
    bottlenecks.push('elevated-transition-latency');
  }

  let severity = 'ok';
  if (
    bottlenecks.includes('main-thread-long-task') ||
    bottlenecks.includes('frame-drop-jank') ||
    bottlenecks.includes('high-transition-latency')
  ) {
    severity = 'bottleneck';
  } else if (bottlenecks.length > 0) {
    severity = 'warn';
  }

  let recommendation = 'Smooth GPU-composited slide transition within frame budget.';
  if (bottlenecks.includes('main-thread-long-task')) {
    recommendation = `Main-thread Long Task (${maxLongTaskMs} ms) blocked frames during Slide 0${fromSlide} → 0${toSlide}; check synchronous layout or image decoding.`;
  } else if (bottlenecks.includes('frame-drop-jank')) {
    recommendation = `${droppedFrames} dropped frames (worst ${worstFrameMs} ms) detected; verify high-res artwork decode or active background GPU layers.`;
  } else if (bottlenecks.includes('high-transition-latency') || bottlenecks.includes('elevated-transition-latency')) {
    recommendation = `Transition took ${totalMs} ms; consider shorter tween or reduced-motion projector mode on slower podium hardware.`;
  }

  return {
    id: raw.id || `tr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestampIso: raw.timestampIso || new Date().toISOString(),
    fromSlide,
    toSlide,
    routeLabel: `0${fromSlide} → 0${toSlide}`,
    trigger,
    mode,
    interrupted,
    totalMs,
    frameCount,
    estimatedFps,
    droppedFrames,
    worstFrameMs,
    maxLongTaskMs,
    severity,
    bottlenecks,
    recommendation
  };
}

/**
 * Pure aggregator for rolling slide transition samples.
 * @param {Array<Object>} samples
 */
export function summarizeTransitionHistory(samples = []) {
  const valid = Array.isArray(samples) ? samples.filter((s) => s && !s.interrupted) : [];
  if (!valid.length) {
    return {
      count: 0,
      meanMs: 0,
      p95Ms: 0,
      worstMs: 0,
      avgFps: 60,
      totalDroppedFrames: 0,
      bottleneckCount: 0
    };
  }

  const durations = valid.map((s) => Number(s.totalMs) || 0).sort((a, b) => a - b);
  const sumMs = durations.reduce((acc, n) => acc + n, 0);
  const p95Idx = Math.min(durations.length - 1, Math.floor(durations.length * 0.95));
  const avgFps = Math.round(
    valid.reduce((acc, s) => acc + (Number(s.estimatedFps) || 60), 0) / valid.length
  );
  const totalDroppedFrames = valid.reduce((acc, s) => acc + (Number(s.droppedFrames) || 0), 0);
  const bottleneckCount = valid.filter((s) => s.severity === 'bottleneck' || s.severity === 'warn').length;

  return {
    count: valid.length,
    meanMs: round1(sumMs / valid.length),
    p95Ms: round1(durations[p95Idx]),
    worstMs: round1(durations[durations.length - 1]),
    avgFps,
    totalDroppedFrames,
    bottleneckCount
  };
}

/**
 * Pure evaluator for high-resolution image asset load, intrinsic resolution, and decode cost.
 * @param {Object} raw
 */
export function evaluateImageAssetSample(raw = {}) {
  const label = String(raw.label || 'Slide image');
  const src = String(raw.src || '');
  const slideLabel = String(raw.slideLabel || 'Deck');
  const naturalWidth = Math.max(0, Math.round(Number(raw.naturalWidth) || 0));
  const naturalHeight = Math.max(0, Math.round(Number(raw.naturalHeight) || 0));
  const renderedWidth = Math.max(0, Math.round(Number(raw.renderedWidth) || 0));
  const renderedHeight = Math.max(0, Math.round(Number(raw.renderedHeight) || 0));
  const transferBytes = Math.max(0, Math.round(Number(raw.transferBytes) || 0));
  const resourceDurationMs = Math.max(0, round1(raw.resourceDurationMs ?? 0));
  const decodeDurationMs =
    raw.decodeDurationMs !== null && raw.decodeDurationMs !== undefined
      ? Math.max(0, round1(raw.decodeDurationMs))
      : null;
  const decodingAttr = String(raw.decodingAttr || 'auto');
  const loadingAttr = String(raw.loadingAttr || 'eager');

  const megapixels = round2((naturalWidth * naturalHeight) / 1_000_000);
  const renderedPixels = renderedWidth * renderedHeight;
  const oversampleRatio =
    renderedPixels > 0 && naturalWidth * naturalHeight > 0
      ? round1((naturalWidth * naturalHeight) / renderedPixels)
      : 1;

  const bottlenecks = [];
  if (megapixels >= PERF_BUDGETS.highResMegapixelsBottleneck) {
    bottlenecks.push('very-high-megapixels');
  } else if (megapixels >= PERF_BUDGETS.highResMegapixelsWarn) {
    bottlenecks.push('high-megapixels');
  }

  if (oversampleRatio >= PERF_BUDGETS.oversampleRatioWarn && megapixels >= 1.0) {
    bottlenecks.push('oversampled-for-container');
  }

  if (decodeDurationMs !== null && decodeDurationMs >= PERF_BUDGETS.imageDecodeBottleneckMs) {
    bottlenecks.push('slow-image-decode');
  } else if (decodeDurationMs !== null && decodeDurationMs >= PERF_BUDGETS.imageDecodeWarnMs) {
    bottlenecks.push('frame-budget-decode');
  }

  if (transferBytes >= PERF_BUDGETS.imageTransferWarnBytes) {
    bottlenecks.push('large-payload');
  }

  if (megapixels >= 1.2 && decodingAttr !== 'async') {
    bottlenecks.push('missing-async-decoding');
  }

  let severity = 'ok';
  if (
    bottlenecks.includes('very-high-megapixels') ||
    bottlenecks.includes('slow-image-decode') ||
    bottlenecks.includes('large-payload')
  ) {
    severity = 'bottleneck';
  } else if (bottlenecks.length > 0) {
    severity = 'warn';
  }

  let hint = 'Within viewport & decode budget.';
  if (bottlenecks.includes('slow-image-decode')) {
    hint = `Decode took ${decodeDurationMs} ms (>16.7 ms frame budget); pre-decode before transition or keep decoding="async".`;
  } else if (bottlenecks.includes('large-payload')) {
    hint = `Payload ${(transferBytes / 1024).toFixed(0)} KB (${megapixels} MP); pre-cached by Service Worker after initial fetch.`;
  } else if (bottlenecks.includes('oversampled-for-container')) {
    hint = `${naturalWidth}×${naturalHeight} (${megapixels} MP) is ${oversampleRatio}× rendered box (${renderedWidth}×${renderedHeight}).`;
  } else if (bottlenecks.includes('missing-async-decoding')) {
    hint = `Add decoding="async" to prevent synchronous rasterization stalls during scroll.`;
  } else if (bottlenecks.includes('high-megapixels')) {
    hint = `${megapixels} MP archival plate (${decodingAttr === 'async' ? 'async decode enabled' : 'sync decode'}).`;
  }

  return {
    label,
    slideLabel,
    src,
    naturalWidth,
    naturalHeight,
    megapixels,
    renderedWidth,
    renderedHeight,
    oversampleRatio,
    transferBytes,
    transferKb: round1(transferBytes / 1024),
    resourceDurationMs,
    decodeDurationMs,
    decodingAttr,
    loadingAttr,
    severity,
    bottlenecks,
    hint
  };
}

/**
 * Pure evaluator for Three.js 3D Transatlantic Meridian rendering telemetry.
 * @param {Object} raw
 */
export function evaluateThreeRenderSample(raw = {}) {
  const initialized = Boolean(raw.initialized);
  if (!initialized) {
    return {
      initialized: false,
      active: false,
      preset: 'deferred',
      isSoftwareGl: false,
      rendererName: 'Deferred (~680 KB Three.js bundle not loaded until 3D stage opened)',
      buildMs: 0,
      avgFrameMs: 0,
      worstFrameMs: 0,
      estimatedFps: 0,
      drawCalls: 0,
      triangles: 0,
      geometries: 0,
      textures: 0,
      severity: 'ok',
      bottlenecks: [],
      hint: 'Zero main-deck overhead while 3D Meridian overlay is closed.'
    };
  }

  const active = Boolean(raw.active);
  const preset = String(raw.preset || 'overview');
  const isSoftwareGl = Boolean(raw.isSoftwareGl);
  const rendererName = String(raw.rendererName || (isSoftwareGl ? 'Software WebGL' : 'Hardware WebGL'));
  const buildMs = Math.max(0, round1(raw.buildMs ?? 0));
  const avgFrameMs = Math.max(0, round1(raw.avgFrameMs ?? 0));
  const worstFrameMs = Math.max(0, round1(raw.worstFrameMs ?? 0));
  const drawCalls = Math.max(0, Math.round(Number(raw.drawCalls) || 0));
  const triangles = Math.max(0, Math.round(Number(raw.triangles) || 0));
  const geometries = Math.max(0, Math.round(Number(raw.geometries) || 0));
  const textures = Math.max(0, Math.round(Number(raw.textures) || 0));
  const estimatedFps = avgFrameMs > 0 ? Math.min(120, Math.max(1, Math.round(1000 / avgFrameMs))) : 0;

  const bottlenecks = [];
  if (isSoftwareGl) {
    bottlenecks.push('software-webgl-cpu');
  }
  const frameWarnBudget = isSoftwareGl
    ? PERF_BUDGETS.threeSoftwareWarnMs
    : PERF_BUDGETS.threeHardwareWarnMs;
  if (avgFrameMs > frameWarnBudget) {
    bottlenecks.push('frame-budget-exceeded');
  }
  if (drawCalls > PERF_BUDGETS.threeDrawCallsWarn) {
    bottlenecks.push('high-draw-calls');
  }
  if (triangles > PERF_BUDGETS.threeTrianglesWarn) {
    bottlenecks.push('high-triangle-count');
  }

  let severity = 'ok';
  if (
    bottlenecks.includes('frame-budget-exceeded') ||
    bottlenecks.includes('high-draw-calls') ||
    bottlenecks.includes('high-triangle-count')
  ) {
    severity = 'bottleneck';
  } else if (bottlenecks.includes('software-webgl-cpu')) {
    severity = 'warn';
  }

  let hint = active
    ? `3D Meridian active (${estimatedFps} fps, ${drawCalls} draw calls, ${triangles.toLocaleString()} tris).`
    : `3D Meridian paused (RAF halted while closed; 0 CPU/GPU draw cost on slides).`;

  if (bottlenecks.includes('frame-budget-exceeded')) {
    hint = `Avg frame ${avgFrameMs} ms (${estimatedFps} fps) exceeds ${frameWarnBudget} ms target on ${rendererName}.`;
  } else if (isSoftwareGl) {
    hint = `CPU rasterizer (${rendererName}) detected; pixelRatio=1, shadows disabled, and gl.fenceSync pacing active.`;
  }

  return {
    initialized: true,
    active,
    preset,
    isSoftwareGl,
    rendererName,
    buildMs,
    avgFrameMs,
    worstFrameMs,
    estimatedFps,
    drawCalls,
    triangles,
    geometries,
    textures,
    severity,
    bottlenecks,
    hint
  };
}

// ============================================================================
// Browser Runtime Performance Monitor & Console Logger
// ============================================================================
const MAX_TRANSITION_SAMPLES = 50;

export function createBrowserPerfMonitor() {
  const transitionSamples = [];
  let imageAuditSamples = [];
  let threeState = evaluateThreeRenderSample({ initialized: false });
  const listeners = new Set();
  let recentLongTasks = [];

  // Observe main-thread Long Tasks (>50ms) when supported by Chromium
  if (typeof window !== 'undefined' && typeof PerformanceObserver === 'function') {
    try {
      const supported = PerformanceObserver.supportedEntryTypes || [];
      if (supported.includes('longtask')) {
        const obs = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            recentLongTasks.push({
              startTime: entry.startTime,
              endTime: entry.startTime + entry.duration,
              duration: entry.duration
            });
          }
          if (recentLongTasks.length > 80) {
            recentLongTasks = recentLongTasks.slice(-40);
          }
        });
        obs.observe({ type: 'longtask', buffered: true });
      }
    } catch (e) {}
  }

  function notifyListeners() {
    const snapshot = getReport();
    listeners.forEach((fn) => {
      try {
        fn(snapshot);
      } catch (e) {}
    });
  }

  function logTransitionToConsole(sample) {
    if (typeof console === 'undefined') return;
    const badgeColor =
      sample.severity === 'bottleneck'
        ? 'color:#b91c1c;font-weight:700;'
        : sample.severity === 'warn'
        ? 'color:#b45309;font-weight:700;'
        : 'color:#15803d;font-weight:700;';
    const header = `%c[PerfMonitor] Slide ${sample.routeLabel} · ${sample.totalMs} ms · ~${sample.estimatedFps} fps · ${sample.severity.toUpperCase()}`;
    try {
      if (typeof console.groupCollapsed === 'function') {
        console.groupCollapsed(header, badgeColor);
        console.log({
          route: sample.routeLabel,
          trigger: sample.trigger,
          mode: sample.mode,
          latencyMs: sample.totalMs,
          frames: sample.frameCount,
          estimatedFps: sample.estimatedFps,
          droppedFrames: sample.droppedFrames,
          worstFrameMs: sample.worstFrameMs,
          maxLongTaskMs: sample.maxLongTaskMs,
          bottlenecks: sample.bottlenecks,
          recommendation: sample.recommendation
        });
        console.groupEnd();
      } else {
        console.log(
          `[PerfMonitor] Slide ${sample.routeLabel} | ${sample.totalMs}ms | ~${sample.estimatedFps}fps | dropped=${sample.droppedFrames} | worstFrame=${sample.worstFrameMs}ms | status=${sample.severity}`
        );
      }
    } catch (e) {}
  }

  function beginSlideTransition({ fromSlide, toSlide, trigger = 'navigation', mode = 'gsap' } = {}) {
    const hasPerf = typeof performance !== 'undefined' && typeof performance.now === 'function';
    const startNow = hasPerf ? performance.now() : Date.now();
    let lastFrameNow = startNow;
    let frameCount = 0;
    let droppedFrames = 0;
    let worstFrameMs = 0;
    let rafId = 0;
    let finished = false;

    const sampleFrame = (ts) => {
      if (finished) return;
      const now = typeof ts === 'number' ? ts : hasPerf ? performance.now() : Date.now();
      const delta = now - lastFrameNow;
      lastFrameNow = now;
      frameCount += 1;
      if (delta > worstFrameMs) worstFrameMs = delta;
      if (delta >= PERF_BUDGETS.droppedFrameThresholdMs) {
        droppedFrames += 1;
      }
      if (typeof requestAnimationFrame === 'function') {
        rafId = requestAnimationFrame(sampleFrame);
      }
    };

    if (typeof requestAnimationFrame === 'function' && mode !== 'instant') {
      rafId = requestAnimationFrame(sampleFrame);
    }

    return {
      complete({ interrupted = false } = {}) {
        if (finished) return null;
        finished = true;
        if (rafId && typeof cancelAnimationFrame === 'function') {
          cancelAnimationFrame(rafId);
        }
        const endNow = hasPerf ? performance.now() : Date.now();
        const totalMs = Math.max(0, endNow - startNow);

        // Attribute any Long Tasks overlapping [startNow, endNow]
        let maxLongTaskMs = 0;
        for (let i = 0; i < recentLongTasks.length; i++) {
          const lt = recentLongTasks[i];
          if (lt.endTime >= startNow && lt.startTime <= endNow) {
            if (lt.duration > maxLongTaskMs) maxLongTaskMs = lt.duration;
          }
        }

        const evaluated = evaluateTransitionSample({
          fromSlide,
          toSlide,
          trigger,
          mode,
          interrupted,
          totalMs,
          frameCount,
          droppedFrames,
          worstFrameMs,
          maxLongTaskMs
        });

        transitionSamples.unshift(evaluated);
        if (transitionSamples.length > MAX_TRANSITION_SAMPLES) {
          transitionSamples.length = MAX_TRANSITION_SAMPLES;
        }

        logTransitionToConsole(evaluated);
        notifyListeners();
        return evaluated;
      }
    };
  }

  async function auditHighResImages({ runDecodeProbe = false, logToConsole = true } = {}) {
    if (typeof document === 'undefined') return [];

    const resourceEntries =
      typeof performance !== 'undefined' && typeof performance.getEntriesByType === 'function'
        ? performance.getEntriesByType('resource')
        : [];

    const findResourceTiming = (urlStr) => {
      if (!urlStr || !resourceEntries.length) return null;
      let normalized = urlStr;
      try {
        normalized = new URL(urlStr, window.location.href).href;
      } catch (e) {}
      for (let i = resourceEntries.length - 1; i >= 0; i--) {
        if (resourceEntries[i].name === normalized) {
          return resourceEntries[i];
        }
      }
      return null;
    };

    const imgElements = Array.from(
      document.querySelectorAll('#podium-curtain img, main#report img')
    );

    const results = [];
    for (let i = 0; i < imgElements.length; i++) {
      const img = imgElements[i];
      const src = img.currentSrc || img.getAttribute('src') || '';
      if (!src) continue;

      const slideSec = img.closest('[data-slide]');
      const slideLabel = slideSec
        ? `Slide 0${slideSec.getAttribute('data-slide')}`
        : img.closest('#podium-curtain')
        ? 'Opening Poster'
        : 'Header / UI';

      const shortName = src.split('/').pop()?.split('?')[0] || 'image';
      const rect = img.getBoundingClientRect();
      const resEntry = findResourceTiming(src);

      let decodeDurationMs = null;
      if (runDecodeProbe && img.complete && img.naturalWidth > 0 && typeof img.decode === 'function') {
        const t0 = performance.now();
        try {
          await img.decode();
          decodeDurationMs = performance.now() - t0;
        } catch (e) {
          decodeDurationMs = 0;
        }
      }

      results.push(
        evaluateImageAssetSample({
          label: shortName,
          slideLabel,
          src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          renderedWidth: rect.width,
          renderedHeight: rect.height,
          transferBytes:
            resEntry?.decodedBodySize || resEntry?.encodedBodySize || resEntry?.transferSize || 0,
          resourceDurationMs: resEntry?.duration || 0,
          decodeDurationMs,
          decodingAttr: img.getAttribute('decoding') || 'auto',
          loadingAttr: img.getAttribute('loading') || 'eager'
        })
      );
    }

    // Sort highest megapixel / bottleneck assets first
    results.sort((a, b) => {
      const rank = { bottleneck: 3, warn: 2, ok: 1 };
      const diff = (rank[b.severity] || 0) - (rank[a.severity] || 0);
      if (diff !== 0) return diff;
      return b.megapixels - a.megapixels;
    });

    imageAuditSamples = results;

    if (logToConsole && typeof console !== 'undefined' && results.length > 0) {
      const flagged = results.filter((r) => r.severity !== 'ok').length;
      try {
        console.groupCollapsed(
          `[PerfMonitor] High-Res Imagery Audit · ${results.length} assets (${flagged} flagged)`
        );
        if (typeof console.table === 'function') {
          console.table(
            results.map((r) => ({
              location: r.slideLabel,
              asset: r.label,
              intrinsicPx: `${r.naturalWidth}×${r.naturalHeight}`,
              MP: r.megapixels,
              renderedPx: `${r.renderedWidth}×${r.renderedHeight}`,
              decodeMs: r.decodeDurationMs !== null ? r.decodeDurationMs : 'n/a',
              loadMs: r.resourceDurationMs,
              decoding: r.decodingAttr,
              status: r.severity.toUpperCase(),
              hint: r.hint
            }))
          );
        }
        console.groupEnd();
      } catch (e) {}
    }

    notifyListeners();
    return results;
  }

  function updateThreeMetrics(partial = {}, { logToConsole = false } = {}) {
    const mergedRaw = {
      ...threeState,
      ...partial,
      initialized: partial.initialized !== undefined ? partial.initialized : true
    };
    threeState = evaluateThreeRenderSample(mergedRaw);

    if (logToConsole && typeof console !== 'undefined') {
      try {
        console.groupCollapsed(
          `[PerfMonitor] 3D Meridian Stage · ${threeState.active ? 'ACTIVE' : 'PAUSED'} · ${
            threeState.avgFrameMs ? `${threeState.avgFrameMs} ms/frame (~${threeState.estimatedFps} fps)` : `Built in ${threeState.buildMs} ms`
          } · ${threeState.severity.toUpperCase()}`
        );
        console.log({
          preset: threeState.preset,
          renderer: threeState.rendererName,
          isSoftwareGl: threeState.isSoftwareGl,
          buildMs: threeState.buildMs,
          avgFrameMs: threeState.avgFrameMs,
          worstFrameMs: threeState.worstFrameMs,
          drawCalls: threeState.drawCalls,
          triangles: threeState.triangles,
          geometries: threeState.geometries,
          textures: threeState.textures,
          hint: threeState.hint
        });
        console.groupEnd();
      } catch (e) {}
    }

    notifyListeners();
    return threeState;
  }

  function getReport() {
    return {
      generatedAt: new Date().toISOString(),
      summary: summarizeTransitionHistory(transitionSamples),
      transitions: [...transitionSamples],
      images: [...imageAuditSamples],
      threeMeridian: { ...threeState }
    };
  }

  function printConsoleReport() {
    const report = getReport();
    if (typeof console === 'undefined') return report;
    try {
      console.group('[PerfMonitor] Full Presentation Performance & Bottleneck Report');
      console.log('Slide Transition Summary:', report.summary);
      if (report.transitions.length && typeof console.table === 'function') {
        console.table(
          report.transitions.map((t) => ({
            route: t.routeLabel,
            trigger: t.trigger,
            mode: t.mode,
            latencyMs: t.totalMs,
            estFps: t.estimatedFps,
            droppedFrames: t.droppedFrames,
            worstFrameMs: t.worstFrameMs,
            longTaskMs: t.maxLongTaskMs,
            status: t.severity.toUpperCase()
          }))
        );
      }
      console.log('3D Transatlantic Meridian Telemetry:', report.threeMeridian);
      if (report.images.length && typeof console.table === 'function') {
        console.table(
          report.images.map((r) => ({
            location: r.slideLabel,
            asset: r.label,
            MP: r.megapixels,
            oversample: `${r.oversampleRatio}x`,
            decodeMs: r.decodeDurationMs ?? 'n/a',
            status: r.severity.toUpperCase(),
            hint: r.hint
          }))
        );
      }
      console.groupEnd();
    } catch (e) {}
    return report;
  }

  function clearSamples() {
    transitionSamples.length = 0;
    notifyListeners();
  }

  function subscribe(fn) {
    if (typeof fn !== 'function') return () => {};
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  return {
    beginSlideTransition,
    auditHighResImages,
    updateThreeMetrics,
    getReport,
    printConsoleReport,
    clearSamples,
    subscribe
  };
}

export const perfMonitor =
  typeof window !== 'undefined'
    ? window.dauchyPerfMonitor || (window.dauchyPerfMonitor = createBrowserPerfMonitor())
    : createBrowserPerfMonitor();
