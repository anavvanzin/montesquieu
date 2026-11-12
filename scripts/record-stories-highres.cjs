const { chromium } = require('/usr/local/share/bun-global/node_modules/playwright-core');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function recordHighResStories() {
  console.log('=== 1. Starting high-definition 9:16 (1080x1920) headless capture ===');
  
  const rawDir = '/tmp/stories_highres_raw';
  fs.mkdirSync(rawDir, { recursive: true });
  fs.mkdirSync('public/assets', { recursive: true });

  // Clean raw directory
  for (const file of fs.readdirSync(rawDir)) {
    fs.unlinkSync(path.join(rawDir, file));
  }

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  // Native 9:16 mobile viewport (540x960) with matching video recording canvas to eliminate any pillarboxing
  const context = await browser.newContext({
    viewport: { width: 540, height: 960 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: {
      dir: rawDir,
      size: { width: 540, height: 960 }
    }
  });

  const page = await context.newPage();

  console.log('=== 2. Opening Landing Screen ===');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  
  // Display the upper navy sky banner with the PPGD-UFSC header
  await page.waitForTimeout(3200);

  // Smoothly scroll down the landing poster to showcase Montesquieu, Dauchy, discussants & France/Brazil flags
  console.log('=== Scrolling Landing Screen ===');
  await page.evaluate(() => {
    const curtain = document.getElementById('podium-curtain');
    curtain?.scrollTo({ top: 380, behavior: 'smooth' });
  });
  await page.waitForTimeout(4000);

  // Click "Start Presentation" to part the curtain with its smooth cinematic animation
  console.log('=== Starting Presentation ===');
  await page.evaluate(() => {
    document.getElementById('curtain-start-btn')?.click();
  });
  await page.waitForTimeout(2500);

  console.log('=== 3. Guiding through Slides 1..7 with archival details ===');

  // Slide 1: Opening & Voice Code Key
  await page.evaluate(() => window.dauchyDeckBridge?.goToSlide(1, { smooth: true }));
  await page.waitForTimeout(3200);

  // Slide 2: Political Liberty beyond Constitutional Formula
  await page.evaluate(() => window.dauchyDeckBridge?.goToSlide(2, { smooth: true }));
  await page.waitForTimeout(2200);
  await page.evaluate(() => window.dauchyDeckBridge?.applySlideCallout(2, 'civil-criminal'));
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.dauchyDeckBridge?.applySlideCallout(2, 'judicial'));
  await page.waitForTimeout(2000);

  // Slide 3: Brazil, 1824 Four Powers Orbit
  await page.evaluate(() => window.dauchyDeckBridge?.goToSlide(3, { smooth: true }));
  await page.waitForTimeout(2200);
  await page.evaluate(() => window.dauchyDeckBridge?.applySlideCallout(3, 'four-powers'));
  await page.waitForTimeout(2400);

  // Slide 4: Compromisso Constitucional & 10s Look
  await page.evaluate(() => window.dauchyDeckBridge?.goToSlide(4, { smooth: true }));
  await page.waitForTimeout(2200);
  await page.evaluate(() => window.dauchyDeckBridge?.applySlideCallout(4, 'prudente'));
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.dauchyDeckBridge?.applySlideCallout(4, 'pause-5s'));
  await page.waitForTimeout(2400);

  // Slide 5: Ceschiatti Stone A Justiça & Sword Focus
  await page.evaluate(() => window.dauchyDeckBridge?.goToSlide(5, { smooth: true }));
  await page.waitForTimeout(2200);
  await page.evaluate(() => window.dauchyDeckBridge?.applySlideCallout(5, 'sword-detail'));
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.dauchyDeckBridge?.applySlideCallout(5, 'whole'));
  await page.waitForTimeout(2000);

  // Slide 6: Transplants, Hybridity & 1916 Civil Code
  await page.evaluate(() => window.dauchyDeckBridge?.goToSlide(6, { smooth: true }));
  await page.waitForTimeout(2200);
  await page.evaluate(() => window.dauchyDeckBridge?.applySlideCallout(6, 'watson'));
  await page.waitForTimeout(1800);
  await page.evaluate(() => window.dauchyDeckBridge?.applySlideCallout(6, 'code1916'));
  await page.waitForTimeout(2200);

  // Slide 7: Closing Questions on Renegotiated Legal Boundaries
  await page.evaluate(() => window.dauchyDeckBridge?.goToSlide(7, { smooth: true }));
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.dauchyDeckBridge?.applySlideCallout(7, 'q1'));
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.dauchyDeckBridge?.applySlideCallout(7, 'q2'));
  await page.waitForTimeout(3500);

  console.log('=== 4. Finalizing recording session ===');
  await context.close();
  await browser.close();

  const recordedFiles = fs.readdirSync(rawDir).filter(f => f.endsWith('.webm') || f.endsWith('.mp4'));
  if (recordedFiles.length === 0) {
    throw new Error('No recorded video found in ' + rawDir);
  }
  const rawVideoPath = path.join(rawDir, recordedFiles[0]);
  console.log('Raw video captured:', rawVideoPath);

  // Probe raw video duration
  const probeOutput = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${rawVideoPath}"`).toString().trim();
  const rawDuration = parseFloat(probeOutput) || 75;
  console.log(`Video raw duration: ${rawDuration.toFixed(2)} seconds`);

  const fadeOutStart = Math.max(0, rawDuration - 2.5);
  const audioPath = 'public/assets/aistudio/Classicals.de_-_Chopin_-_Nocturne_Op._9_no._2_in_E-flat_major_a91ca46b.mp3';
  const outputPath = 'public/assets/montesquieu-stories-preview-9-16.mp4';
  const posterPath = 'public/assets/stories-poster.jpg';

  console.log('=== 5. Transcoding to High-Definition 1080x1920 with Lanczos upscale (8500k bitrate, CRF 15, High Profile 4.2) ===');
  // Enhanced High-Definition H.264 encode: 8500 kbps bitrate, slow preset, CRF 15, High profile 4.2, movflags +faststart
  const ffmpegCmd = `ffmpeg -y -i "${rawVideoPath}" -i "${audioPath}" ` +
    `-t ${rawDuration.toFixed(2)} ` +
    `-filter_complex "[0:v]scale=1080:1920:flags=lanczos[v];[1:a]afade=t=in:ss=0:d=1.5,afade=t=out:st=${fadeOutStart.toFixed(2)}:d=2.5[a]" ` +
    `-map "[v]" -map "[a]" ` +
    `-c:v libx264 -preset slow -crf 15 -b:v 8500k -maxrate 12000k -bufsize 16000k ` +
    `-pix_fmt yuv420p -profile:v high -level 4.2 -movflags +faststart ` +
    `-c:a aac -b:a 256k -ar 48000 ` +
    `"${outputPath}"`;

  execSync(ffmpegCmd, { stdio: 'inherit' });

  console.log('=== 6. Extracting razor-sharp 1080x1920 poster thumbnail ===');
  execSync(`ffmpeg -y -ss 00:00:04.800 -i "${outputPath}" -vframes 1 -q:v 2 "${posterPath}"`, { stdio: 'inherit' });

  console.log('=== Done! High-definition video saved to:', outputPath);
}

recordHighResStories().catch(err => {
  console.error('Fatal recording error:', err);
  process.exit(1);
});
