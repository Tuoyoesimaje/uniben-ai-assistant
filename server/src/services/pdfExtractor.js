// pdf-parse may export the parser as the module export or as `default` depending on bundler/node interop.
// In test environment avoid loading heavy native modules (canvas/pdfjs)
if (process.env.NODE_ENV === 'test') {
  module.exports = {
    extractTextFromPDF: async () => ''
  };
} else {

  let pdfParse;
  try {
    const pdfParseRaw = require('pdf-parse');
    // Handle CommonJS function export or { default: fn }
    pdfParse = typeof pdfParseRaw === 'function' ? pdfParseRaw : (pdfParseRaw && pdfParseRaw.default) ? pdfParseRaw.default : null;
  } catch (err) {
    console.error('Could not require pdf-parse:', err);
  }

  async function extractTextFromPDF(buffer) {
    try {
      // pdf-parse preferred; if unavailable, fall back to pdfjs-dist
      const pdfBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

      if (pdfParse) {
        const data = await pdfParse(pdfBuffer);
        return data && data.text ? data.text : '';
      }

      // Fallback: use pdfjs-dist to extract text. Try a few possible entry points because package layouts vary.
      try {
        const tryPaths = [
          'pdfjs-dist/legacy/build/pdf',
          'pdfjs-dist/legacy/build/pdf.js',
          'pdfjs-dist/build/pdf',
          'pdfjs-dist',
        ];

        let pdfjsLib = null;
        const requireErrors = [];

        for (const p of tryPaths) {
          try {
            const mod = require(p);
            // Some builds export under .default
            pdfjsLib = mod && mod.getDocument ? mod : (mod && mod.default && mod.default.getDocument ? mod.default : mod);
            if (pdfjsLib && pdfjsLib.getDocument) {
              break;
            }
          } catch (e) {
            requireErrors.push({ path: p, error: e && e.message ? e.message : String(e) });
          }
        }

        if (!pdfjsLib || !pdfjsLib.getDocument) {
          console.error('pdfjs-dist require attempts failed:', requireErrors);
          throw new Error('Could not load pdfjs-dist from known entry points');
        }

        // pdfjs expects a Uint8Array for binary PDF data
        const uint8 = new Uint8Array(pdfBuffer);
        const loadingTask = pdfjsLib.getDocument({ data: uint8 });
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map(item => item.str || '');
          fullText += strings.join(' ') + '\n';
        }

        return fullText;
      } catch (fallbackErr) {
        console.error('pdfjs-dist fallback error:', fallbackErr);
        throw new Error('pdfjs-dist fallback error: ' + (fallbackErr && fallbackErr.message ? fallbackErr.message : String(fallbackErr)));
      }
    } catch (error) {
      console.error('PDF extraction error:', error);
      // Re-throw the original error so controller logs include the specific cause
      throw error;
    }
  }

  module.exports = { extractTextFromPDF };

}