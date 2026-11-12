#!/usr/bin/env bash
set -e

echo "=== 1. Starting playwright-cli session in 9:16 vertical stories format (720x1280) ==="
trap 'playwright-cli close' EXIT

mkdir -p /tmp/stories_raw
mkdir -p public/assets
rm -f /tmp/stories_raw/*

# Open the root URL with no autostart so the Event Landing Poster is active
playwright-cli open "http://localhost:3000/"
playwright-cli resize 720 1280
playwright-cli video-start /tmp/stories_raw/walkthrough.webm

echo "=== 2. Showcasing the Landing Page & PPGD-UFSC Event Poster ==="

# Allow the top navy sky banner and title to display
sleep 3.0

# Smoothly scroll down the landing screen to reveal Montesquieu, Serge Dauchy, Marja Mangili & Ana Vitória, plus the Franco-Brazilian flags art
playwright-cli eval '() => document.getElementById("podium-curtain")?.scrollTo({ top: 380, behavior: "smooth" })'
sleep 3.8

# Click "Start Presentation" to part the curtain with its cinematic animation
playwright-cli eval '() => document.getElementById("curtain-start-btn")?.click()'
sleep 2.2

echo "=== 3. Stepping through slides and key interactive features ==="

# Slide 1: Opening & Voice Code Key
playwright-cli eval '() => window.dauchyDeckBridge?.goToSlide(1, { smooth: true })'
sleep 2.8

# Slide 2: Political Liberty beyond Constitutional Formula
playwright-cli eval '() => window.dauchyDeckBridge?.goToSlide(2, { smooth: true })'
sleep 2.0
playwright-cli eval '() => window.dauchyDeckBridge?.applySlideCallout(2, "civil-criminal")'
sleep 1.8
playwright-cli eval '() => window.dauchyDeckBridge?.applySlideCallout(2, "judicial")'
sleep 1.8

# Slide 3: Brazil, 1824 Four Powers Orbit
playwright-cli eval '() => window.dauchyDeckBridge?.goToSlide(3, { smooth: true })'
sleep 2.0
playwright-cli eval '() => window.dauchyDeckBridge?.applySlideCallout(3, "four-powers")'
sleep 2.2

# Slide 4: Compromisso Constitucional & 10s Look
playwright-cli eval '() => window.dauchyDeckBridge?.goToSlide(4, { smooth: true })'
sleep 2.0
playwright-cli eval '() => window.dauchyDeckBridge?.applySlideCallout(4, "prudente")'
sleep 1.8
playwright-cli eval '() => window.dauchyDeckBridge?.applySlideCallout(4, "pause-5s")'
sleep 2.2

# Slide 5: Ceschiatti Stone A Justiça & Sword Focus
playwright-cli eval '() => window.dauchyDeckBridge?.goToSlide(5, { smooth: true })'
sleep 2.0
playwright-cli eval '() => window.dauchyDeckBridge?.applySlideCallout(5, "sword-detail")'
sleep 1.8
playwright-cli eval '() => window.dauchyDeckBridge?.applySlideCallout(5, "whole")'
sleep 1.8

# Slide 6: Transplants, Hybridity & 1916 Civil Code
playwright-cli eval '() => window.dauchyDeckBridge?.goToSlide(6, { smooth: true })'
sleep 2.0
playwright-cli eval '() => window.dauchyDeckBridge?.applySlideCallout(6, "watson")'
sleep 1.6
playwright-cli eval '() => window.dauchyDeckBridge?.applySlideCallout(6, "code1916")'
sleep 2.0

# Slide 7: Closing Questions on Renegotiated Legal Boundaries
playwright-cli eval '() => window.dauchyDeckBridge?.goToSlide(7, { smooth: true })'
sleep 2.2
playwright-cli eval '() => window.dauchyDeckBridge?.applySlideCallout(7, "q1")'
sleep 2.2
playwright-cli eval '() => window.dauchyDeckBridge?.applySlideCallout(7, "q2")'
sleep 3.0

echo "=== 4. Stopping video recording ==="
playwright-cli video-stop

echo "=== 5. Checking recorded video files ==="
RAW_VIDEO=$(ls -t /tmp/stories_raw/*.webm /tmp/stories_raw/*.mp4 2>/dev/null | head -n 1)

if [ -z "$RAW_VIDEO" ]; then
  RAW_VIDEO=$(find . -name "*.webm" -o -name "*.mp4" | grep -v node_modules | head -n 1)
fi

echo "Raw video found: $RAW_VIDEO"

AUDIO="public/assets/aistudio/Classicals.de_-_Chopin_-_Nocturne_Op._9_no._2_in_E-flat_major_a91ca46b.mp3"
OUTPUT="public/assets/montesquieu-stories-preview-9-16.mp4"
POSTER="public/assets/stories-poster.jpg"

# Get video duration using ffprobe
DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$RAW_VIDEO" | cut -d. -f1)
echo "Video duration in seconds: $DURATION"
FADE_OUT_START=$((DURATION - 2))

echo "=== 6. Transcoding to 9:16 (1080x1920) H.264 MP4 with synchronized Chopin Nocturne audio ==="
ffmpeg -y -i "$RAW_VIDEO" -i "$AUDIO" \
  -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x0c0f18[v];[1:a]afade=t=in:ss=0:d=1.5,afade=t=out:st=${FADE_OUT_START}:d=2.0[a]" \
  -map "[v]" -map "[a]" \
  -c:v libx264 -pix_fmt yuv420p -preset fast -crf 20 \
  -c:a aac -b:a 192k \
  -shortest "$OUTPUT"

echo "=== 7. Extracting poster frame capturing the Landing Poster ==="
ffmpeg -y -ss 00:00:04.500 -i "$OUTPUT" -vframes 1 -q:v 2 "$POSTER"

echo "=== Done! Video saved to: $OUTPUT ==="
ls -lh "$OUTPUT" "$POSTER"

