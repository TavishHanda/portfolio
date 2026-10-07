---
title: SSRF URL Previewer
shortTitle: SSRF Previewer
meta: 2025 · Security
tags: [TypeScript, Next.js, SQLite]
shot: Deliberately vulnerable
order: 4
---
A link-preview app that screenshots a URL and pulls its metadata, built on purpose with a server-side request forgery hole (no protocol or hostname checks) so we could exploit it and then explain the fix. My part: the login page, account auth backed by SQLite, and per-account search history.
