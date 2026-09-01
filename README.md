# dadoune.com

Personal site and blog. Astro, Tailwind CSS v4, Markdown content, no CMS.

Version 3. The previous versions were react-static with content in Contentful (v2,
2018) and a Metalsmith/AngularJS static site before that (v1, 2016), both preceded by
a self-hosted Ghost blog (2014).

## Running it

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run preview  # serve the build
npm run check    # astro check (types + templates)
```

## Layout

```
src/
  content/blog/*.md     posts, one file per URL slug
  content.config.ts     collection schema (title, subtitle, date, tags)
  pages/                routes; file paths mirror URLs
  layouts/              Base, SimpleLayout, ArticleLayout
  components/           Container, Header, Footer, PostCard, Icon
  lib/site.ts           name, nav, socials, date and reading-time helpers
  lib/projects.ts       GitHub repo fetch + fallback
  data/repos.json       committed snapshot, used if the GitHub API is unavailable
public/                 static assets, copied verbatim
```

## Content

Posts are Markdown files in `src/content/blog/`. The filename is the URL slug, so
`docker-ambassador.md` serves at `/blog/docker-ambassador`. Frontmatter:

```yaml
---
title: 'Docker Ambassador'
subtitle: 'Micro docker for linking to external services'
date: 2014-09-03
tags: ['Docker', 'Socat']
---
```

Tag pages are generated from the union of all `tags` values. A post older than five
years automatically gets an "from the archive" note above the body, so dated advice
reads as dated.

## URLs

Every URL the 2018 site served still resolves: `/`, `/blog`, `/blog/<slug>`,
`/blog/tag/<tag>`, `/projects`. Nothing needs a redirect. `/about`, `/rss.xml`,
`/sitemap-index.xml` and a 404 page are new.

## Design

Ported from Spotlight (Tailwind Plus), a personal-site template: zinc neutrals, a
single teal accent, class-based dark mode, and a scroll-driven header where the
homepage avatar shrinks into a header pill. See `src/styles/global.css` for the type
scale and the Shiki dual-theme handling.

## Projects page

`src/lib/projects.ts` fetches public repos from the GitHub API at build time. GitHub
rate-limits unauthenticated requests, so if the call fails the build falls back to
`src/data/repos.json` and logs a warning rather than failing.

## Deploying

`npm run build` emits a fully static `dist/`. It needs no runtime, so any static host
works.

Note that the old deploy path (`buildspec.yml` + `cfn-stack.json`, CodePipeline to S3)
targeted the react-static build and is **not** carried over. It is kept in
`archive/legacy-src/` for reference. Point the host at `npm run build` and `dist/`.

## archive/

Local-only, gitignored. Holds the Ghost-era post originals, the 2019 Sketch redesign
and its extracted tokens, the v2 source, and the old Contentful credentials. See
`archive/README.md`.
