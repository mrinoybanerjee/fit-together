# FitTogether — CLAUDE.md

## gstack

This project uses gstack for development workflow.

**Web Browsing:** Always use `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

### Available gstack skills

- `/office-hours` — Interactive Q&A / rubber-duck debugging session
- `/plan-ceo-review` — Product/strategy-level plan review
- `/plan-eng-review` — Engineering architecture review (use before coding)
- `/plan-design-review` — Design review for plans
- `/design-consultation` — Design system / UX consultation
- `/design-shotgun` — Rapid multi-option design exploration
- `/design-html` — Generate HTML design mockups
- `/review` — Pre-landing PR code review (run before commits)
- `/ship` — Full ship workflow: merge base, tests, review, bump version, commit, push, create PR
- `/land-and-deploy` — Land and deploy workflow
- `/canary` — Canary deployment
- `/benchmark` — Performance benchmarking
- `/browse` — Fast headless browser for QA/testing/dogfooding (USE THIS for all web browsing)
- `/connect-chrome` — Connect Chrome for browser automation
- `/qa` — Full QA test run
- `/qa-only` — QA tests only (no review)
- `/design-review` — Visual design review
- `/setup-browser-cookies` — Set up browser auth cookies
- `/setup-deploy` — Configure deployment
- `/retro` — Post-ship retrospective
- `/investigate` — Root cause investigation
- `/document-release` — Generate release notes
- `/codex` — Coding standards/conventions reference
- `/cso` — Chief Security Officer review
- `/autoplan` — Run full auto-review pipeline (CEO + design + eng + DX reviews)
- `/plan-devex-review` — Developer experience review
- `/devex-review` — DX review
- `/careful` — Extra-careful mode for risky changes
- `/freeze` — Freeze codebase (no changes)
- `/guard` — Guard mode (review all changes)
- `/unfreeze` — Unfreeze codebase
- `/gstack-upgrade` — Upgrade gstack to latest
- `/learn` — Save a learning/pattern for this project

## Project Overview

FitTogether is a couples fitness tracking web app.

- **Partner 1**: Whoop device (official REST API, OAuth2)
- **Partner 2**: Apple Watch (Terra API as HealthKit bridge)
- **Stack**: React + Tailwind + shadcn/ui frontend, Node.js/Express backend, WebSocket for real-time updates
- **Charts**: Recharts
- **Auth**: JWT-based

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health

## Development

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && npm install && npm run dev
```

Backend runs on port 3001, frontend on 5173 (proxied).

The app works fully with mock data — no API keys required to see the dashboard.
