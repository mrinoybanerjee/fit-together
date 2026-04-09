# Changelog

All notable changes to FitTogether are documented here.

## [0.1.0.0] - 2026-04-09

### Fixed
- WebSocket broadcasts now include `streakDays`, `milestones`, and `jointStreakDays` — previously these fields were missing from live updates, causing streak counters to reset to zero every 30 seconds
- Whoop workout duration calculation now sums all heart-rate zones correctly — an operator precedence bug (`??` vs `+`) caused only zone 2 to count, making durations appear near-zero
- Sam's (Partner 2) mock history now includes `steps` data, fixing streak computation that always returned 0 in demo mode

### Security
- OAuth callback no longer exposes raw access/refresh token values in browser HTML or server logs
- Login endpoint protected against brute-force with rate limiting (10 attempts per 15 minutes)
- OAuth error message HTML-escaped to prevent reflected XSS via `?error=` query parameter
- Rate limiter now uses real client IPs behind Nginx/reverse proxies via `trust proxy` setting
- Demo password removed from server startup log

### Changed
- Malformed JSON requests now return 400 instead of 500
- React Router v7 future flags enabled to silence deprecation warnings
