import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateTransitionSample,
  summarizeTransitionHistory,
  evaluateImageAssetSample,
  evaluateThreeRenderSample
} from './perf-monitor.mjs';

test('evaluateTransitionSample classifies smooth 60fps GSAP transition as ok', () => {
  const sample = evaluateTransitionSample({
    fromSlide: 1,
    toSlide: 2,
    trigger: 'keyboard',
    mode: 'gsap',
    totalMs: 440,
    frameCount: 26,
    droppedFrames: 0,
    worstFrameMs: 17.2,
    maxLongTaskMs: 0
  });

  assert.equal(sample.routeLabel, '01 → 02');
  assert.equal(sample.severity, 'ok');
  assert.equal(sample.bottlenecks.length, 0);
  assert.ok(sample.estimatedFps >= 55 && sample.estimatedFps <= 65);
});

test('evaluateTransitionSample detects main-thread Long Task and frame drops as bottleneck', () => {
  const sample = evaluateTransitionSample({
    fromSlide: 4,
    toSlide: 5,
    trigger: 'stepper',
    mode: 'gsap',
    totalMs: 690,
    frameCount: 22,
    droppedFrames: 5,
    worstFrameMs: 84.5,
    maxLongTaskMs: 72.3
  });

  assert.equal(sample.severity, 'bottleneck');
  assert.ok(sample.bottlenecks.includes('main-thread-long-task'));
  assert.ok(sample.bottlenecks.includes('frame-drop-jank'));
  assert.match(sample.recommendation, /Long Task/i);
});

test('summarizeTransitionHistory computes accurate mean, p95, and bottleneck counts', () => {
  const s1 = evaluateTransitionSample({ fromSlide: 1, toSlide: 2, totalMs: 410, frameCount: 24 });
  const s2 = evaluateTransitionSample({ fromSlide: 2, toSlide: 3, totalMs: 430, frameCount: 25 });
  const s3 = evaluateTransitionSample({
    fromSlide: 3,
    toSlide: 4,
    totalMs: 910,
    frameCount: 30,
    droppedFrames: 4,
    worstFrameMs: 62
  });

  const summary = summarizeTransitionHistory([s1, s2, s3]);
  assert.equal(summary.count, 3);
  assert.equal(summary.worstMs, 910);
  assert.equal(summary.totalDroppedFrames, 4);
  assert.equal(summary.bottleneckCount, 1);
});

test('evaluateImageAssetSample flags high-megapixel slow decode and missing async attribute', () => {
  const sample = evaluateImageAssetSample({
    label: 'compromisso.jpg',
    slideLabel: 'Slide 05',
    naturalWidth: 2400,
    naturalHeight: 1800,
    renderedWidth: 520,
    renderedHeight: 390,
    transferBytes: 1_250_000,
    resourceDurationMs: 48,
    decodeDurationMs: 52.4,
    decodingAttr: 'auto'
  });

  assert.equal(sample.severity, 'bottleneck');
  assert.ok(sample.megapixels > 4.0);
  assert.ok(sample.bottlenecks.includes('very-high-megapixels'));
  assert.ok(sample.bottlenecks.includes('slow-image-decode'));
  assert.ok(sample.bottlenecks.includes('missing-async-decoding'));
});

test('evaluateThreeRenderSample handles deferred state and software-WebGL detection', () => {
  const deferred = evaluateThreeRenderSample({ initialized: false });
  assert.equal(deferred.initialized, false);
  assert.equal(deferred.severity, 'ok');

  const swActive = evaluateThreeRenderSample({
    initialized: true,
    active: true,
    preset: 'brazil1824',
    isSoftwareGl: true,
    rendererName: 'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device))',
    buildMs: 145,
    avgFrameMs: 24.5,
    worstFrameMs: 31.0,
    drawCalls: 42,
    triangles: 14200,
    geometries: 26,
    textures: 5
  });

  assert.equal(swActive.severity, 'warn');
  assert.ok(swActive.bottlenecks.includes('software-webgl-cpu'));
  assert.ok(swActive.estimatedFps >= 38 && swActive.estimatedFps <= 44);
});
