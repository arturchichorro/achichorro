# Legacy bolota.eu vs current achichorro.com

**A standalone comparison of the two live websites and their source code.**

Measured **9 October 2026**, using the latest benchmark round, approximately **15:21–15:32 UTC**. Live pages and `origin/main` were rechecked at **15:40 UTC**: the current Home Hub HTML and legacy homepage were byte-identical to the measured versions. This report compares legacy directly with current—not with an intermediate achichorro.com release.

## Executive summary

**Current achichorro.com is substantially lighter, with less application code, fewer dependencies, and far less browser JavaScript. The homepage is faster by LCP, but not every article performance metric improves.**



Suggested blog-post wording:

> I kept React as a tool for building the website, but stopped making it a requirement for reading ordinary pages. The migration cut application code by about a third, production dependencies from 19 to 3, and homepage transfer from roughly 487 kB to 69 kB. Its measured mobile LCP approximately halved. Interactive articles still use React, but download much less JavaScript than before.

Important qualification: **higher LCP on some redesigned articles does not prove slower Cloudflare R2 image delivery.** The old and new layouts produce different LCP elements; matching image downloads are comparable or faster on the new pages in the applied-throttling samples. See section 6.

## 1. Versions and methodology



The former repository URL now resolves to the renamed repository. Legacy source was extracted from Git history into a temporary directory; current source was extracted from `origin/main`. Neither website exposes a complete deployed commit SHA. Source snapshots are relevant historical/current-main revisions, while benchmarks measure the live sites independently.

### Measurements

- **32 Lighthouse runs:** three alternating simulated-mobile runs per site/page across four pages; one desktop run per site on homepage/Home Hub; one applied-network-throttled mobile run per site on AI/Home Hub.
- **Eight browser payload samples:** one fresh mobile-sized Chrome context per site/page, cache disabled, initial load plus 10 seconds, no scrolling/clicking.
- **Source counts:** cloc against committed snapshots; dependency counts from package manifests and pnpm lockfiles.
- **Live crawl:** homepage, post index, and all 16 current published articles; corresponding routes and internal destinations on legacy.
- **Image checks:** four representative old/new files downloaded and compared by SHA-256.
- **Native-control smoke checks:** keyboard interaction and dialog focus behavior in live Chrome.

Tools: **Lighthouse 13.5.0**, **Chrome 154**, **cloc 2.06**, Playwright/CDP; Apple M2 Pro, macOS 26.7.1. Lighthouse ran serially; other browser/network measurements followed. Browser caches were fresh; server/CDN caches were not cleared. Results are lab measurements, not real-user data or an isolated framework/hosting experiment.

Tested routes are listed in the results tables below.



Directly served URLs avoid redirect penalties in the timing comparison. **kB means 1,000 bytes; MB means 1,000,000 bytes.** Browser wire-byte counts include protocol/header overhead. Decoded sizes are separately identified.

## 2. Code and repository size

`cloc` counts nonblank, noncomment lines. Implementation rows exclude content, documentation, lockfiles, binary assets, dependency installs, generated output, and Git history.



Definitions and interpretation:

- **Application-directory:** old `app/`, `components/`, `lib/`, `config/`, `styles/` versus current `src/` plus `public/newsletter.js`. These are useful footprint boundaries, not perfectly equal feature boundaries: legacy API routes are under `app/`; current newsletter Worker code is separate.
- **All implementation:** TS/TSX, JS/MJS, CSS, Python, shell, and HTML, including tests, publishing tooling, and Worker code. YAML is excluded; current CI adds another 80 nonblank lines.
- The smaller overall reduction reflects the new tests and publishing/newsletter infrastructure. Native controls also require local behavior/CSS previously supplied by a library.
- The 51.5% tracked-text reduction is **not** a 51.5% reduction in application complexity. Removing the old 9,238-code-line `package-lock.json` accounts for much of it.
- Tracked-file totals describe file contents, not clone size, installed dependencies, production output, or visitor downloads.
- Functionality is not identical: analytics, About, theme-related UI, and dynamic social-image generation differ; one article is now unpublished.

The untracked draft `content/posts/achichorrov4.mdx` and report files are excluded from source counts and left untouched.

## 3. Dependencies: which version is lighter?



Production-root traversal includes regular and optional dependency edges, not development roots or peer-only roots. These are **lockfile graph counts**, not installed package/disk counts or browser bundle sizes. Optional platform packages may not install on a particular machine.

### What changed

- **Removed:** Next.js; six direct Radix packages; `next-themes`, `posthog-js`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, and `tailwindcss-animate`.
- **UI:** styled native browser controls. Current source does not depend on Base UI.
- **Content tooling:** Velite/Next integration replaced by Vite, MDX Rollup integration, local metadata validation, and explicit prerendering.
- **Retained direct production dependencies:** React, React DOM, and KaTeX.
- **Math tooling:** `remark-math` is development-only; a local adapter replaces `rehype-katex`.
- **Development infrastructure:** current tooling includes Wrangler, Shiki, YAML/Zod, and Vite/MDX plugins.

Relevant snapshot-resolved versions: React **18.3.1 → 19.3.0**, KaTeX **0.16.47 → 0.19.0**; legacy Next.js **14.2.35**. These are lockfile versions, not a separately verified old deployment build environment.

**Verdict:** current is lighter in dependency graph and browser payload. Ordinary static page delivery needs no Next.js application runtime; newsletter handling remains a separate Worker. Development-dependency count increases, and classification/count alone cannot establish download or installed-disk size.

## 4. Live payloads and JavaScript bundles

### External JavaScript



Ordinary pages download only the newsletter script: **1,968 decoded bytes**, approximately 1.4 kB transferred including overhead. They do **not** download React. Interactive posts retain React and route-specific modules.



Compressed and decoded sizes differ; specify which one you quote. External-script figures exclude inline script text. Legacy Sudoku HTML also contains about **343 kB of inline bootstrap/page-serialization text**. Much of that is data, not executable application logic; it is already included in the document transfer.

### Entire initial-view transfer



These are initial-view windows—not full-scroll sessions or total build artifacts. Lighthouse can load additional images while auditing the page, so its byte totals differ.

### What the homepage requests actually are



Legacy's same-origin chunks include framework/site code and bundled dependencies, including analytics. Additional PostHog requests load configuration, surveys, dead-click detection, and web-vitals instrumentation. The 10 fetches are Next.js server-component payload prefetches for About, the post index, and eight articles, before any click: approximately **104.5 kB**.

Current's five requests are the HTML, shared CSS, DM Sans font, `newsletter.js`, and SVG favicon. No sampled current page loads external analytics scripts; that does not establish what server-side logging exists.

### Other payload differences

- Homepage font transfer: **48.7 → 37.5 kB**.
- Homepage CSS: **15.5 → 19.3 kB**. Generated CSS did not shrink merely because source code did. Shared CSS includes KaTeX styling on nonmath pages.
- Interactive current pages add component-specific CSS: approximately **20.0 kB total CSS** on Home Hub and **20.2 kB** on Sudoku.
- Both current and legacy favicons are small in this final comparison: about **0.9 kB** current SVG transfer versus **1.1 kB** legacy icon transfer. Current SVG's decoded file is **1,122 bytes**, matching main.
- Home Hub initially downloads roughly **1.90 MB of images on either site**. This explains why JavaScript savings have a modest effect on its total payload.

Decoded HTML figures are listed in the results tables below.



The current site avoids Next.js client page serialization, but math/interactive HTML can still be large.

## 5. Lighthouse performance and accessibility

### Simulated mobile

**Three-run medians**, standard Moto G Power emulation: approximately **1.64 Mbps**, **150 ms RTT**, and **4× CPU slowdown**. Scores out of 100. FCP = first contentful paint; LCP = largest contentful paint; TBT = total blocking time; CLS = cumulative layout shift.



Every arrow is **legacy → current**. **SEO and best practices are 100 on both sites for every tested page.**

LCP ranges:

- Homepage: legacy **1.89–2.44 s**, current **1.07–1.26 s**.
- AI: legacy **2.47–2.58 s**, current **4.55–4.56 s**.
- Home Hub: legacy **2.46–2.62 s**, current **5.91–11.97 s**. Current image-based LCP is particularly variable.
- Sudoku: legacy **2.02–2.54 s**, current **1.96–1.96 s**, rounded.

The homepage's LCP approximately halves, but its FCP is slightly slower. Article results are mixed; do not claim every metric improved or that Vite alone caused the differences.

### Desktop

Single runs, standard desktop preset:



Desktop's high scores conceal the larger slow-mobile image costs.

### Accessibility details

Legacy automated failures include an unnamed GitHub link, subscription-button contrast, and heading order. Current Home Hub retains a heading-order failure; an unscored header accessible-name warning remains.

Targeted live Chrome checks pass for native gallery Enter/open, arrow navigation, Escape/close and focus restoration, close button, Sudoku slider keyboard arrows, and Connect Four switch Space/toggle. No page errors occurred during those checks. These are not exhaustive keyboard, screen-reader, touch, Safari, or Firefox audits; a Lighthouse score of 100 is not proof of complete accessibility.

## 6. Images and hosting: why article LCP can look worse

### Image identity and caching

Four representative pairs are **SHA-256 byte-identical** across old/new hosts:



Sampled new media responses were **Cloudflare cache hits**, with **immutable one-year caching**. Old sampled responses used a one-day cache lifetime; their server header also named Cloudflare. This is not simply a “no CDN → CDN” migration.

R2 does not automatically resize or recompress those files. A 1.2 MB screenshot remains expensive on a fresh slow connection regardless of hosting.

### Applied network throttling

Four additional diagnostic runs used `--throttling-method=devtools`, applying approximately **1.47 Mbps download**, **562.5 ms request latency**, and **4× CPU slowdown** to the browser rather than extrapolating from an unthrottled capture. **One sample per site/article**; do not mix these scores into the simulated medians or treat them as an isolated origin benchmark.



Matching image request durations from those runs are listed in the results tables below.



These durations include competing page requests and the applied bandwidth limit. Fewer competing downloads help current AI; the table does not isolate R2's origin speed. It does refute reading the LCP difference as proof that matching images downloaded more slowly.

### Explanation

- **Different LCP element:** legacy AI/Home Hub report the introductory **paragraph**; current slow runs report an **image**. The old score can finish before its large images finish downloading.
- **Different presentation:** current gallery images occupy more prominent viewport space, and the gallery recenters after hydration. Which candidate becomes LCP can vary.
- **Different scheduling:** article-image transforms default to lazy loading, including the AI page's visible first image. Gallery `preload` makes every preview eager, introducing competing large downloads.
- **Layout shift:** current AI CLS is about **0.113**, versus **0.085** legacy. Image dimension/aspect-ratio reservation still needs improvement.

**Conclusion:** current image-heavy article LCP can genuinely be worse as a page metric, while the images themselves download equally fast or faster. This is an end-to-end redesign comparison—not a controlled hosting-speed comparison. Do not write “Cloudflare R2 made the images slower.”

## 7. SEO and discovery



Current canonical/Open Graph/JSON-LD article URLs, sitemap, RSS, and repaired internal links use the directly served slash routes. No-slash article requests still correctly redirect with 308.

Live crawl: **18 current routes and 203 same-origin anchor occurrences, zero failing destinations**, with no `/about` links. The old corresponding crawl also has zero failing destinations. Checks cover page destinations, not fragment IDs, forms, or links produced only after interaction.

Current improves indexing/discovery plumbing, but has a social-card regression. Missing legacy robots.txt did **not** mean indexing was blocked, and RSS is not a direct ranking metric. Neither a Lighthouse SEO score nor this crawl establishes actual search traffic or rankings.

Remaining refinements: include homepage/post index in the article-only sitemap; use genuine modification dates instead of assigning publication date as JSON-LD modification date; restore static social-preview images. When retiring bolota.eu, preserve article paths with permanent redirects and use Search Console's migration workflow rather than redirecting every article to the homepage.

## 8. Which migration decisions mattered most?

1. **JavaScript became opt-in for interactive posts.** React builds ordinary pages, but visitors do not need its runtime to read them. This is the largest ordinary-page architectural change.
2. **Next.js client navigation/prefetch and global analytics/theme infrastructure disappeared.** The homepage stops downloading unrelated route payloads and instrumentation.
3. **Interactive code is explicitly route-specific**, with native browser controls instead of a UI-library runtime. Interactive posts still use React but ship much less JavaScript.
4. **The output is static HTML**, with a small newsletter enhancement and a separate backend Worker rather than a Next.js serving runtime for the static site.

Crucially, legacy already compiled MDX, rendered math, and generated syntax highlighting at build time; initial HTML/metadata were server/build-generated too. Those operations were **not newly moved out of the browser by this migration**. The central win is removing unnecessary browser infrastructure around content already rendered ahead of time—not simply changing bundlers.

The same measurements do not isolate the exact byte/timing contribution of every decision. Source/dependency reductions support simplicity, but fewer dependencies alone do not guarantee faster pages.

## 9. Next opportunities

- **Responsive image previews:** resize/re-encode gallery thumbnails, keeping originals in `fullSrc`. The initial image budget is much larger than remaining JavaScript.
- **Initial-image priorities and dimensions:** do not indiscriminately lazy-load above-the-fold images; avoid eagerly fetching all originals; reserve aspect ratios to reduce CLS.
- **Gallery-only progressive enhancement:** a small vanilla script could retain native dialog interactions without React or the full MDX module. This requires a refactor, not simply disabling `interactive`.
- **Interactive islands for complex posts:** hydrate Sudoku/game widgets rather than the entire article and compiled MDX body. More involved, but could reduce duplicated article JavaScript further.
- **Static social cards and optional math-CSS splitting:** restore richer sharing previews and avoid unnecessary math styling on ordinary pages.

## 10. CI build and deployment time

Measured from GitHub Actions job/step timestamps and historical Vercel deployment statuses—not inferred from local builds.

### Current production workflow

Latest main-branch run, for `b8c8b46`: [GitHub Actions run](https://github.com/arturchichorro/achichorro/actions/runs/37950663390).



The build log reports **815 ms for the client build**, **729 ms for the SSR build**, then prerenders **18 pages**, sitemap, and RSS. GitHub timestamps have second-level precision. The latest run explicitly reported **no restored pnpm cache**, so its fast install/build was not dependent on a successful pnpm-cache restore.

Across the **six latest successful main workflow runs**, which span several recent Vite revisions:

- Full workflow: **58–69 seconds**, median **60.5 seconds**.
- Build step alone: **3–5 seconds**, median **4.5 seconds**.

Job durations do not sum to the full workflow duration because queueing, job handoff, and final status updates add time. Most elapsed time is setup, tests, and publishing—not compilation.

### Legacy Vercel deployment

The matching legacy commit has no GitHub Actions/check-run build history. Its Vercel status changed from pending at **19:31:08 UTC** to success at **19:31:53 UTC** on 13 September 2026: a **45-second deployment-status interval**. [Historical Vercel deployment](https://vercel.com/arturchichorros-projects/bolota-v2/AuaaRJuLD4yWYA6oBvheShv2t1Wf).

That interval is **not the isolated Next.js build duration** and cannot fairly be compared with the current three-second build step. The current approximately one-minute workflow also runs verification/tests and a separate publishing job. We therefore cannot claim the migration made CI faster from these figures alone.

For a proper old-versus-new build-time comparison, obtain the legacy deployment's **Build Logs / Building duration** from Vercel, separating queueing, installation, build, and deployment. The current pure build and end-to-end CI times are established; the legacy pure build time is not.

CI timing data, raw API responses, and current logs are retained outside the repository at `/Users/artur/Documents/Personal/website-comparison-2026-10-09-native-controls/ci/`.

## 11. Results tables

All tables are grouped here in report order. Every arrow means **legacy bolota.eu → current achichorro.com**. kB = 1,000 bytes. Mobile Lighthouse tables use three-run simulated medians; desktop and applied-throttling tables use single runs. The CI table describes current GitHub Actions only: legacy's 45-second deployment-status interval is not an isolated build time.

### 1. Headline comparison

| Headline | Legacy bolota.eu | Current achichorro.com | Difference |
|---|---:|---:|---:|
| Application-directory code | 4,628 lines | 3,174 lines | **31.4% less** |
| All implementation code, including tests/tooling | 4,805 lines | 4,141 lines | **13.8% less** |
| Direct production dependencies | 19 | 3 | **84.2% fewer** |
| Homepage external JavaScript transfer | 305.3 kB | 1.4 kB | **99.5% less** |
| Entire observed homepage transfer | 486.6 kB | 68.8 kB | **85.9% less** |
| Homepage requests | 35 | 5 | **85.7% fewer** |
| Mobile homepage Lighthouse performance | 98 | 100 | +2 points |
| Mobile homepage median simulated LCP | 2.33 s | 1.21 s | **48.1% lower** |
| Mobile homepage accessibility score | 93 | 100 | +7 points |

### 2. Versions and architecture

| | Legacy | Current |
|---|---|---|
| Live URL | `https://bolota.eu` | `https://achichorro.com` |
| Architecture | Next.js/React, served through Vercel | Vite/React, prerendered static pages, served through Cloudflare |
| Source snapshot | [`ded8b4e`](https://github.com/arturchichorro/achichorro/commit/ded8b4e3873f0c800c8d9c98274b502289453bd5), last commit before the Vite rewrite | [`b8c8b46`](https://github.com/arturchichorro/achichorro/commit/b8c8b469ac8f4f41f29e04d8eb97f01b5b93053f), current `origin/main` |
| UI | Radix-based controls and associated utilities | Styled native buttons, range inputs, switches, and dialogs; no Base UI |
| Media | Uploadthing-hosted asset URLs | `media.achichorro.com`, Cloudflare/R2 |

### 3. Tested routes

| Page | Legacy route | Current route |
|---|---|---|
| Homepage | `/` | `/` |
| AI article, noninteractive | `/posts/16_aidisinfo` | `/posts/16_aidisinfo/` |
| Home Hub, interactive gallery | `/posts/17_homehub` | `/posts/17_homehub/` |
| Sudoku | `/posts/14_algxsudoku` | `/posts/14_algxsudoku/` |

### 4. Code and repository size

| Metric | Legacy | Current | Change |
|---|---:|---:|---:|
| Application-directory code | 4,628 | 3,174 | **−31.4%** |
| Application-directory source files | 74 | 44 | −40.5% |
| TypeScript/TSX code across repository | 4,637 | 3,109 | −33.0% |
| All implementation code, including tests/tooling | 4,805 | 4,141 | **−13.8%** |
| CSS source code | 143 | 137 | −4.2% |
| Automated test source files | 0 | 5 | Added |
| Automated test code lines | 0 | 483 | Added |
| MDX article files | 17 | 17 | Same count |
| Published article files | 17 | 16 | One now unpublished |
| All tracked text lines, including lockfiles/docs | 23,744 | 11,521 | −51.5% |
| Tracked file bytes, including binary assets | 1,229,775 | 496,001 | −59.7% |

### 5. Dependencies

| Metric | Legacy | Current | Change |
|---|---:|---:|---:|
| Direct production dependencies | 19 | 3 | **−84.2%** |
| Direct development dependencies | 15 | 19 | +26.7% |
| All direct dependencies | 34 | 22 | −35.3% |
| Package/version records in pnpm lockfile | 672 | 408 | −39.3% |
| Distinct package names in lockfile | 649 | 364 | −43.9% |
| Snapshots reachable from production roots | 236 | 5 | −97.9% |

### 6. External JavaScript transfer

| Page | Legacy wire transfer | Current wire transfer | Reduction | Script requests, legacy → current |
|---|---:|---:|---:|---:|
| Homepage | 305.3 kB | **1.4 kB** | **99.5%** | 19 → 1 |
| AI article | 277.2 kB | **1.4 kB** | **99.5%** | 16 → 1 |
| Home Hub | 299.0 kB | **98.3 kB** | **67.1%** | 18 → 4 |
| Sudoku | 299.0 kB | **111.9 kB** | **62.6%** | 18 → 6 |

### 7. Decoded external JavaScript

| Decoded external JavaScript | Legacy | Current |
|---|---:|---:|
| Homepage | 773,363 bytes | 1,968 bytes |
| AI article | 693,983 bytes | 1,968 bytes |
| Home Hub | 755,601 bytes | 289,892 bytes |
| Sudoku | 755,601 bytes | 537,322 bytes |

### 8. Entire initial-view transfer

| Page | Legacy | Current | Reduction | Requests, legacy → current |
|---|---:|---:|---:|---:|
| Homepage | 486.6 kB | **68.8 kB** | **85.9%** | 35 → 5 |
| AI article | 1,570.6 kB | **610.8 kB** | **61.1%** | 28 → 6 |
| Home Hub | 2,286.7 kB | **2,064.3 kB** | **9.7%** | 29 → 12 |
| Sudoku | 544.9 kB | **270.1 kB** | **50.4%** | 32 → 15 |

### 9. Homepage request breakdown

| Type | Legacy | Current |
|---|---:|---:|
| HTML | 1 | 1 |
| Font | 1 | 1 |
| Stylesheets | 3 | 1 |
| Same-origin JavaScript chunks | 15 | 1 |
| Additional PostHog scripts | 4 | 0 |
| Next.js page-prefetch requests | 10 | 0 |
| Favicon | 1 | 1 |
| **Total** | **35** | **5** |

### 10. Decoded HTML

| Page | Legacy | Current |
|---|---:|---:|
| Homepage | 59,118 bytes | 32,719 bytes |
| AI | 87,387 bytes | 36,380 bytes |
| Home Hub | 81,401 bytes | 27,841 bytes |
| Sudoku | 716,450 bytes | 369,063 bytes |

### 11. Mobile Lighthouse — legacy → current

| Page | Performance | Accessibility | FCP | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|
| Homepage | **98 → 100** | **93 → 100** | 0.95 → 1.07 s | **2.33 → 1.21 s** | 6.5 → 0 ms | 0 → 0 |
| AI article | **96 → 80** | **94 → 100** | 0.94 → 1.12 s | **2.48 → 4.55 s** | 11 → 0 ms | 0.085 → 0.113 |
| Home Hub | **97 → 77** | **95 → 99** | 0.97 → 1.77 s | **2.50 → 6.07 s** | 8 → 0 ms | 0 → 0 |
| Sudoku | **97 → 98** | **88 → 100** | 1.11 → 1.81 s | **2.53 → 1.96 s** | 18.5 → 5.5 ms | 0 → 0.010 |

### 12. Desktop Lighthouse — legacy → current

| Page | Performance | Accessibility | LCP |
|---|---:|---:|---:|
| Homepage | 100 → 100 | 96 → 100 | 0.51 → 0.33 s |
| Home Hub | 100 → 98 | 98 → 99 | 0.53 → 1.13 s |

### 13. Image identity

| Image | Body bytes on both hosts |
|---|---:|
| AI article's first image | 537,392 |
| Home Hub first gallery image | 1,225,453 |
| Home Hub second gallery image | 603,103 |
| Home Hub third gallery image | 67,512 |

### 14. Applied-throttling LCP

| Article | Legacy actual-throttled LCP | Current actual-throttled LCP |
|---|---:|---:|
| AI | 1.86 s | 5.06 s |
| Home Hub | 1.91 s | 18.79 s |

### 15. Applied-throttling image request durations

| Image | Legacy | Current |
|---|---:|---:|
| AI first image | **8.44 s** | **3.59 s** |
| Home Hub first gallery image | **18.37 s** | **18.13 s** |
| Home Hub second gallery image | **11.78 s** | **11.53 s** |
| Home Hub third gallery image | **2.77 s** | **2.54 s** |

### 16. SEO and discovery

| Check | Legacy | Current |
|---|---|---|
| HTML language, title, description | Present | Present |
| Sampled article canonical URL | Missing | Present, served trailing-slash URL |
| JSON-LD on sampled pages | Not found | `Blog` / `BlogPosting` |
| `/robots.txt` | 404 | 200; permits crawling and advertises sitemap |
| `/sitemap.xml` | 404 | 200; 16 published articles |
| `/rss.xml` | 404 | 200; slash links/GUIDs |
| Article Open Graph metadata | Present | Present |
| Article social-preview image | Dynamic image endpoint; rechecked 200 | No `og:image` / `twitter:image` |
| Twitter card | `summary_large_image` | `summary` |
| `/about` | 200 | Intentionally removed, 404 |
| Unknown route | 404 | 404, empty body |

### 17. Current CI and deployment timings

| Measurement | Duration |
|---|---:|
| `pnpm build` step: client build + SSR build + prerender | **3 seconds** |
| Dependency installation | 3 seconds; pnpm log reports 2.8 s |
| Restricted publisher tests / shell validation | 9 seconds |
| Entire verification job, including setup/checks/cleanup | **41 seconds** |
| Publishing job, including artifact download and activation | **11 seconds** |
| SSH upload/activation step alone | 4 seconds |
| Full workflow, creation → final status | **61 seconds** |

## 12. Evidence, rerunning, and limits

Machine-readable results (`summary.json`), full HTML/JSON Lighthouse reports, network records, crawl/image responses, scripts, native-control checks, and source snapshots are retained outside the repository at **`/Users/artur/Documents/Personal/website-comparison-2026-10-09-native-controls/`**. The standalone report uses that latest, independently measured old/new dataset, not older deployment numbers.

Minimal rerun without changing project dependencies:

```sh
mkdir -p /tmp/site-benchmark-tools
npm install --prefix /tmp/site-benchmark-tools lighthouse@13.5.0
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  /tmp/site-benchmark-tools/node_modules/.bin/lighthouse https://achichorro.com/ \
  --chrome-flags="--headless --no-sandbox" --output=html --output=json \
  --output-path=/tmp/achichorro-home
```

Use `https://bolota.eu/` for legacy. Repeat URLs three times, alternating sites, and compare medians. Add `--preset=desktop` for desktop, or `--throttling-method=devtools` for applied throttling, keeping these groups separate. In DevTools Network, disable cache, reload, wait a consistent interval, and inspect transferred versus decoded sizes; export a HAR to preserve the session.

**Not measured:** clean install disk usage, legacy isolated build duration, controlled same-runner build comparisons, total deployment-directory size, server CPU/memory/cost, newsletter delivery, exhaustive accessibility, field Core Web Vitals/INP, search traffic/rankings, or cold-origin/CDN performance. Do not infer those from source counts, dependency graphs, or Lighthouse TBT.

For real-user performance, check [PageSpeed Insights](https://pagespeed.web.dev/) for CrUX data on both domains; small sites may lack sufficient traffic. For SEO outcomes, compare Search Console indexing, impressions, clicks, and field Core Web Vitals over time.
