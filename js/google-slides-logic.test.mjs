import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WORKSPACE_SCOPES,
  stripHtmlToPlainText,
  parseGoogleSlidesId,
  buildGoogleSlidesDeckSpec,
  buildSlidesBatchUpdateRequests,
  buildSpeakerNotesBatchRequests
} from './google-slides-logic.mjs';

test('WORKSPACE_SCOPES contains all 7 configured Drive, Slides, and Sheets scopes', () => {
  assert.equal(WORKSPACE_SCOPES.length, 7);
  assert.ok(WORKSPACE_SCOPES.includes('https://www.googleapis.com/auth/presentations'));
  assert.ok(WORKSPACE_SCOPES.includes('https://www.googleapis.com/auth/presentations.readonly'));
  assert.ok(WORKSPACE_SCOPES.includes('https://www.googleapis.com/auth/drive'));
  assert.ok(WORKSPACE_SCOPES.includes('https://www.googleapis.com/auth/drive.file'));
  assert.ok(WORKSPACE_SCOPES.includes('https://www.googleapis.com/auth/drive.readonly'));
  assert.ok(WORKSPACE_SCOPES.includes('https://www.googleapis.com/auth/spreadsheets'));
  assert.ok(WORKSPACE_SCOPES.includes('https://www.googleapis.com/auth/spreadsheets.readonly'));
});

test('parseGoogleSlidesId extracts IDs from full Google Slides URLs and raw IDs', () => {
  const fromUrl = parseGoogleSlidesId(
    'https://docs.google.com/presentation/d/1AbCdEfGhIjKlMnOpQrStUvWxYz012345/edit#slide=id.p'
  );
  assert.equal(fromUrl.valid, true);
  assert.equal(fromUrl.presentationId, '1AbCdEfGhIjKlMnOpQrStUvWxYz012345');

  const fromRaw = parseGoogleSlidesId('1AbCdEfGhIjKlMnOpQrStUvWxYz012345');
  assert.equal(fromRaw.valid, true);
  assert.equal(fromRaw.presentationId, '1AbCdEfGhIjKlMnOpQrStUvWxYz012345');

  const invalid = parseGoogleSlidesId('short');
  assert.equal(invalid.valid, false);
  assert.ok(invalid.error.length > 0);
});

test('buildGoogleSlidesDeckSpec maps all 7 slides, preserves both Slide 7 questions, and formats speaker notes', () => {
  const spec = buildGoogleSlidesDeckSpec({
    editsMap: { 's1-title': '<em>Custom</em> Montesquieu Title' },
    includeSpeakerNotes: true
  });

  assert.equal(spec.slides.length, 7);
  assert.equal(spec.slides[0].title, 'Custom Montesquieu Title');
  assert.match(spec.slides[0].speakerNotes, /Ana Vitória Vanzin Mendes/);

  const slide7 = spec.slides[6];
  assert.equal(slide7.isDarkClosing, true);
  assert.equal(slide7.bullets.length, 2);
  assert.match(slide7.bullets[0], /Question 1:/);
  assert.match(slide7.bullets[1], /Question 2:/);
});

test('buildSlidesBatchUpdateRequests creates 7 slides before deleting initial blank slide and maps speaker notes', () => {
  const spec = buildGoogleSlidesDeckSpec();
  const { requests, createdSlideIds } = buildSlidesBatchUpdateRequests(spec, {
    slides: [{ objectId: 'p_initial_blank' }]
  });

  assert.equal(createdSlideIds.length, 7);
  const createCount = requests.filter((r) => r.createSlide).length;
  assert.equal(createCount, 7);

  const lastReq = requests[requests.length - 1];
  assert.deepEqual(lastReq, { deleteObject: { objectId: 'p_initial_blank' } });

  const mockFetchedPresentation = {
    slides: createdSlideIds.map((item, i) => ({
      objectId: item.slideId,
      slideProperties: {
        notesPage: {
          notesProperties: {
            speakerNotesObjectId: `notes_obj_${i + 1}`
          }
        }
      }
    }))
  };

  const notesReqs = buildSpeakerNotesBatchRequests(spec, mockFetchedPresentation);
  assert.equal(notesReqs.length, 7);
  assert.equal(notesReqs[0].insertText.objectId, 'notes_obj_1');
  assert.match(notesReqs[0].insertText.text, /Slide 1/);
});

test('stripHtmlToPlainText removes markup cleanly', () => {
  assert.equal(
    stripHtmlToPlainText('Montesquieu’s <cite>De l’esprit des lois</cite> &amp; liberty'),
    'Montesquieu’s De l’esprit des lois & liberty'
  );
});
