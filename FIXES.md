# Fixes applied

**ID scan stuck in a loop** – no step of the scan had a timeout. Now: AI call aborts after 45s (server) / 50s (client), on-device OCR
worker load + recognise each cap at 30s, ID-face extraction caps at 30s, re-entrant scans are blocked, side tabs lock while scanning.

**Bugs** – `kyc-media` storage bucket was never created (every submit failed); migration `0003` was missing from the drizzle journal
(hardening never applied); empty-DOB identity hash made unrelated people "duplicates"; camera stream leaked if you left mid-prompt;
images were uploaded before being validated and orphaned on DB failure.

**Security** – rate limit now runs before parsing big payloads; image bytes/base64 validated and size-capped before storage;
OCR confidence clamped; bucket forced private with mime/size limits; anon/authenticated write grants revoked on audit/verification tables.

**Still your call** – see the chat summary (client-trusted liveness/face data, public analyze endpoint, CSP report-only, IP rate limiting).
