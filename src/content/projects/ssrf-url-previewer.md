---
title: SSRF URL Previewer
shortTitle: SSRF Previewer
meta: 2025 · Security
tags: [TypeScript, Next.js, SQLite]
shot: Deliberately vulnerable
order: 7
featured: false
summary: "A deliberately vulnerable link previewer for a security course. I built the login, SQLite accounts, and search history."
---
A link-preview app that screenshots a URL and pulls its metadata, built on purpose with a server-side request forgery hole (no protocol or hostname checks) so we could exploit it and then explain the fix. My part: the login page, account auth backed by SQLite, and per-account search history.
