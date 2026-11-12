import { perfMonitor } from './perf-monitor.mjs';

const $ = (s, r = document) => r.querySelector(s);

function renderBadgeClass(severity) {
  if (severity === 'bottleneck') return 'perf-pill perf-pill--bottleneck t-meta';
  if (severity === 'warn') return 'perf-pill perf-pill--warn t-meta';
  return 'perf-pill perf-pill--ok t-meta';
}

function initPerfMonitorDialogUI() {
  const dialog = $('#perf-monitor-dialog');
  if (!dialog) return;

  const openBtns = [$('#prep-perf-monitor-btn'), $('#mobile-perf-toggle')].filter(Boolean);
  const closeBtn = $('#perf-monitor-dialog-close');

  const kpiTransitions = $('#perf-kpi-transitions');
  const kpiTransitionsSub = $('#perf-kpi-transitions-sub');
  const kpiFrames = $('#perf-kpi-frames');
  const kpiFramesSub = $('#perf-kpi-frames-sub');
  const kpiImages = $('#perf-kpi-images');
  const kpiImagesSub = $('#perf-kpi-images-sub');
  const kpiThree = $('#perf-kpi-three');
  const kpiThreeSub = $('#perf-kpi-three-sub');

  const transitionsTbody = $('#perf-transitions-tbody');
  const imagesTbody = $('#perf-images-tbody');
  const threeSummaryText = $('#perf-three-summary');
  const threeBadge = $('#perf-three-badge');

  const probeDecodeBtn = $('#perf-probe-decode-btn');
  const benchmarkNextBtn = $('#perf-benchmark-btn');
  const consoleReportBtn = $('#perf-console-report-btn');
  const clearBtn = $('#perf-clear-btn');

  let unsubscribe = null;

  function renderReport(report) {
    if (!report) return;
    const { summary, transitions, images, threeMeridian } = report;

    if (kpiTransitions) {
      kpiTransitions.textContent = summary.count ? `${summary.meanMs} ms` : '—';
    }
    if (kpiTransitionsSub) {
      kpiTransitionsSub.textContent = summary.count
        ? `${summary.count} transition${summary.count === 1 ? '' : 's'} · p95 ${summary.p95Ms} ms`
        : 'Step between slides to measure latency';
    }

    if (kpiFrames) {
      kpiFrames.textContent = summary.count ? `~${summary.avgFps} fps` : '60 fps';
    }
    if (kpiFramesSub) {
      kpiFramesSub.textContent = `${summary.totalDroppedFrames} dropped frame${
        summary.totalDroppedFrames === 1 ? '' : 's'
      } · ${summary.bottleneckCount} alert${summary.bottleneckCount === 1 ? '' : 's'}`;
    }

    const flaggedImages = images.filter((img) => img.severity !== 'ok').length;
    if (kpiImages) {
      kpiImages.textContent = `${images.length} Plates`;
    }
    if (kpiImagesSub) {
      kpiImagesSub.textContent = flaggedImages
        ? `${flaggedImages} high-res plate${flaggedImages === 1 ? '' : 's'} noted`
        : 'All slide plates within budget';
    }

    if (kpiThree) {
      kpiThree.textContent = !threeMeridian.initialized
        ? 'Deferred'
        : threeMeridian.active
        ? `${threeMeridian.avgFrameMs || '—'} ms`
        : 'Paused';
    }
    if (kpiThreeSub) {
      kpiThreeSub.textContent = !threeMeridian.initialized
        ? '~680 KB bundle lazy-loaded on demand'
        : `${threeMeridian.drawCalls} draw calls · ${threeMeridian.triangles.toLocaleString()} tris`;
    }

    // 1. Transitions Table
    if (transitionsTbody) {
      transitionsTbody.textContent = '';
      if (!transitions.length) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 6;
        td.className = 'perf-table__empty';
        td.textContent =
          'No slide transitions recorded yet. Navigate slides or click "Benchmark Slide Transition" above.';
        tr.appendChild(td);
        transitionsTbody.appendChild(tr);
      } else {
        transitions.slice(0, 14).forEach((t) => {
          const tr = document.createElement('tr');

          const tdRoute = document.createElement('td');
          tdRoute.className = 'mono';
          tdRoute.textContent = t.routeLabel;

          const tdTrigger = document.createElement('td');
          tdTrigger.textContent = `${t.trigger} (${t.mode})`;

          const tdLatency = document.createElement('td');
          tdLatency.className = 'mono';
          tdLatency.textContent = `${t.totalMs} ms`;

          const tdFps = document.createElement('td');
          tdFps.className = 'mono';
          tdFps.textContent = `~${t.estimatedFps} fps (${t.droppedFrames} drop)`;

          const tdWorst = document.createElement('td');
          tdWorst.className = 'mono';
          tdWorst.textContent = `${t.worstFrameMs} ms / LT ${t.maxLongTaskMs} ms`;

          const tdStatus = document.createElement('td');
          const pill = document.createElement('span');
          pill.className = renderBadgeClass(t.severity);
          pill.textContent = t.severity.toUpperCase();
          tdStatus.appendChild(pill);
          const note = document.createElement('span');
          note.className = 'perf-cell-note';
          note.textContent = ` ${t.recommendation}`;
          tdStatus.appendChild(note);

          tr.append(tdRoute, tdTrigger, tdLatency, tdFps, tdWorst, tdStatus);
          transitionsTbody.appendChild(tr);
        });
      }
    }

    // 2. High-Resolution Imagery Table
    if (imagesTbody) {
      imagesTbody.textContent = '';
      images.forEach((img) => {
        const tr = document.createElement('tr');

        const tdLoc = document.createElement('td');
        tdLoc.textContent = `${img.slideLabel} · ${img.label}`;

        const tdDim = document.createElement('td');
        tdDim.className = 'mono';
        tdDim.textContent = `${img.naturalWidth}×${img.naturalHeight} (${img.megapixels} MP)`;

        const tdBox = document.createElement('td');
        tdBox.className = 'mono';
        tdBox.textContent =
          img.renderedWidth > 0 ? `${img.renderedWidth}×${img.renderedHeight} (${img.oversampleRatio}×)` : 'Hidden';

        const tdTiming = document.createElement('td');
        tdTiming.className = 'mono';
        const decStr = img.decodeDurationMs !== null ? `${img.decodeDurationMs} ms` : '—';
        tdTiming.textContent = `Load ${img.resourceDurationMs} ms · Decode ${decStr}`;

        const tdHint = document.createElement('td');
        const pill = document.createElement('span');
        pill.className = renderBadgeClass(img.severity);
        pill.textContent = img.severity.toUpperCase();
        tdHint.appendChild(pill);
        const note = document.createElement('span');
        note.className = 'perf-cell-note';
        note.textContent = ` ${img.hint}`;
        tdHint.appendChild(note);

        tr.append(tdLoc, tdDim, tdBox, tdTiming, tdHint);
        imagesTbody.appendChild(tr);
      });
    }

    // 3. 3D WebGL Meridian Diagnostics
    if (threeBadge) {
      threeBadge.className = renderBadgeClass(threeMeridian.severity);
      threeBadge.textContent = !threeMeridian.initialized
        ? 'DEFERRED'
        : threeMeridian.severity.toUpperCase();
    }
    if (threeSummaryText) {
      threeSummaryText.textContent = !threeMeridian.initialized
        ? `${threeMeridian.rendererName} — ${threeMeridian.hint}`
        : `Renderer: ${threeMeridian.rendererName} · Build: ${threeMeridian.buildMs} ms · Preset: ${threeMeridian.preset} · Avg Frame: ${threeMeridian.avgFrameMs} ms (Worst ${threeMeridian.worstFrameMs} ms) · Geometries: ${threeMeridian.geometries}, Textures: ${threeMeridian.textures} — ${threeMeridian.hint}`;
    }
  }

  function openPerfDialog() {
    perfMonitor.auditHighResImages({ runDecodeProbe: false, logToConsole: false }).catch(() => {});
    renderReport(perfMonitor.getReport());
    if (!unsubscribe) {
      unsubscribe = perfMonitor.subscribe((rep) => {
        if (dialog.open) renderReport(rep);
      });
    }
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  function closePerfDialog() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  openBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mobileMenu = $('#mobile-contents');
      const contentsToggle = $('#contents-toggle');
      if (mobileMenu && contentsToggle) {
        mobileMenu.hidden = true;
        contentsToggle.setAttribute('aria-expanded', 'false');
      }
      openPerfDialog();
    });
  });

  closeBtn?.addEventListener('click', closePerfDialog);
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) closePerfDialog();
  });

  probeDecodeBtn?.addEventListener('click', async () => {
    probeDecodeBtn.disabled = true;
    const orig = probeDecodeBtn.textContent;
    probeDecodeBtn.textContent = 'Decoding Plates…';
    try {
      await perfMonitor.auditHighResImages({ runDecodeProbe: true, logToConsole: true });
    } finally {
      probeDecodeBtn.disabled = false;
      probeDecodeBtn.textContent = orig;
    }
  });

  benchmarkNextBtn?.addEventListener('click', () => {
    const cur = window.dauchyDeckBridge?.getCurrentSlide?.() || 1;
    const next = cur < 7 ? cur + 1 : 1;
    window.dauchyDeckBridge?.goToSlide?.(next, { smooth: true, trigger: 'perf-benchmark' });
  });

  consoleReportBtn?.addEventListener('click', () => {
    perfMonitor.printConsoleReport();
    const orig = consoleReportBtn.textContent;
    consoleReportBtn.textContent = 'Logged to Console ✓';
    setTimeout(() => {
      consoleReportBtn.textContent = orig;
    }, 1500);
  });

  clearBtn?.addEventListener('click', () => {
    perfMonitor.clearSamples();
  });

  // Schedule an automatic, zero-jank initial asset audit in DevTools console once page finishes loading
  const scheduleInitialAudit = () => {
    const idle =
      typeof window.requestIdleCallback === 'function'
        ? (cb) => window.requestIdleCallback(cb, { timeout: 2500 })
        : (cb) => setTimeout(cb, 1200);
    idle(() => {
      perfMonitor.auditHighResImages({ runDecodeProbe: false, logToConsole: true }).catch(() => {});
    });
  };

  if (document.readyState === 'complete') {
    scheduleInitialAudit();
  } else {
    window.addEventListener('load', scheduleInitialAudit, { once: true });
  }

  if (/(?:^\?|&)perf=1(?:&|$)/.test(window.location.search)) {
    requestAnimationFrame(() => openPerfDialog());
  }

  perfMonitor.openDialog = openPerfDialog;
}

initPerfMonitorDialogUI();
