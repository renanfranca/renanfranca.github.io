# Display public DEV conversations on blog posts

## Purpose and success

Show the current public DEV conversation for each eligible syndicated post before the existing Utterances discussion. A successful implementation discovers the DEV article by exact canonical URL, renders every valid nested comment safely in API order, reloads fresh data without a deployment, and leaves the post and Utterances usable through every DEV failure mode.

## Context and limits

- `.agent/specifications/display-dev-comments-on-blog-posts.md` is the approved behavioral contract.
- `_config.yml` must define the single production `dev_to_username`; `dev_to: false` remains the per-post opt out.
- The browser may issue unauthenticated DEV API v1 `GET` requests only. It must never receive `DEV_TO_API_KEY`.
- Canonical URLs remain the identity contract. No article IDs, comments, snapshots, allowlists, browser storage, or scheduled synchronization may be introduced.
- The new page contract passes only the canonical URL and configured username from Jekyll to a browser module through `data-*` attributes.
- The current baseline has 24 passing DEV tests and validates 29 enabled posts, one opt out, and 1,287 tags. The repository-wide Prettier check has unrelated pre-existing failures.

## Decisions

- Use a package-lock-pinned DOMPurify build served from `assets/js/vendor` rather than a CDN or a custom sanitizer. This limits third-party requests and reduces XSS risk; recovery is reverting the integration and vendored artifact together.
- Use JSDOM plus dependency injection for deterministic browser-module tests. Runtime initialization stays thin while fetch, DOM, sanitizer, and logger behavior can be simulated without the live DEV service.
- Render sanitized comment bodies as DOM fragments and validate every link and image URL after sanitization. API text and attributes are assigned only through DOM APIs.
- Add component styles to `css/override.css`, which post pages already load, instead of changing Tailwind sources or generated CSS.

## Milestones

1. Centralize and validate DEV account configuration.
   - Edit `_config.yml`, `scripts/dev-to/posts.mjs`, `scripts/dev-to/cli.mjs`, and the focused post tests.
   - Require a non-empty string `dev_to_username`, remove the synchronization hardcode, and use the validated value for account verification and public article lookup.
   - Run `npm run test:dev-to` and `npm run dev-to:validate`; both must exit 0 and validation must retain the current post and tag counts.
2. Implement tested browser discovery, sanitization, and rendering.
   - Add DOMPurify, JSDOM, a reproducible `npm run build:dev-comments` command, a locally served vendor module, `assets/js/dev-to-comments.mjs`, and `scripts/dev-to/test/comments.test.mjs`.
   - Cover eligibility, exact and duplicate canonical matches, pagination, zero comments, recursive order, safe links, malformed nodes, network failures, profile images, dates, and executable content with simulated responses.
   - Run `npm run build:dev-comments` and `npm run test:dev-to`; the vendor copy must be current and all tests must pass without live calls.
3. Integrate presentation, privacy, and final validation.
   - Add `_includes/dev-to-comments.html`, update `_layouts/post.html` and `_includes/comments.html`, style the component and print behavior in `css/override.css`, and update `privacy-policy.html`.
   - Emit no integration for `dev_to: false`; otherwise reveal DEV content only after valid comments or the specified post-match retrieval fallback.
   - Build Jekyll, inspect enabled and opted-out output, exercise the real nested conversation on desktop and mobile in both themes and print preview, and run all repository validation commands.

## Progress

- [x] Approve the specification and map the current repository behavior.
- [x] Confirm the test, metadata, formatting, API, and nested-comment baselines.
- [x] Select locally served DOMPurify.
- [x] Complete milestone 1: configuration is centralized and validated; 25 DEV tests and metadata validation pass.
- [x] Complete milestone 2: local DOMPurify, deterministic browser behavior, and adversarial rendering tests pass in a 35-test suite.
- [x] Complete milestone 3: Jekyll integration, presentation, privacy disclosure, real DEV rendering, responsive themes, fallback, and print behavior are validated.
- [x] Perform the final specification audit and handoff: every approved behavior and prohibition is accounted for, with only the unrelated global Prettier baseline remaining red.

## Risks

- Remote HTML can attempt XSS or DOM clobbering. DOMPurify, an explicit passive allowlist, URL validation, safe DOM assignment, and adversarial tests must all remain in place.
- DEV API shape changes and outages must not degrade the post. Discovery errors stay hidden; failures after a matched article show only the safe article fallback.
- Deep nesting and wide formatted content can overflow narrow screens. Semantic nesting remains complete while additional visual indentation stops after two levels.
- The vendored sanitizer can drift from its package. The test suite must compare the committed artifact with the installed distribution.
- The global Prettier baseline is red. Changed files must pass a focused check without broad unrelated formatting edits.

## Documentation

`privacy-policy.html` is the public canonical disclosure. It must name DEV requests and DEV-hosted profile images, the possible exposure of IP address and user agent, DEV's privacy page, and the new last-updated date. No new authoring metadata or publishing guide is needed.

## Rollout and recovery

- Deploy as a normal static-site change with no migration, secret, workflow activation, or data recovery step.
- Verify `when-skill-evolution-means-removing-instructions.html`, which currently has 17 DEV comments and nested replies, after deployment.
- DEV outages are expected to fail in isolation. For a visual or security regression, revert the integration commit and republish; no local comment data exists to recover.

## Validation

- Milestone 1: `npm run test:dev-to` passed 25 tests, `npm run dev-to:validate` reported 29 enabled posts, one opt out, and 1,287 tags, and the four changed configuration files passed a focused Prettier check.
- Milestone 2: `npm run build:dev-comments` refreshed the pinned DOMPurify module, `npm run test:dev-to` passed 35 tests, metadata validation remained green, and the new package, copier, browser module, and tests passed focused formatting.
- Milestone 3: the suite passed 39 tests after security and failed-image hardening; Jekyll built successfully with the image's required `bigdecimal` preload; an eligible page rendered 18 live comments in seven reply groups while the opt-out and zero-comment pages emitted no DEV conversation.
- `npm run build:dev-comments`: exited 0 and the test suite confirmed the local DOMPurify module exactly matches the pinned package.
- `npm run test:dev-to`: passed 39 deterministic tests without the live DEV service.
- `npm run dev-to:validate`: exited 0 with 29 enabled posts, one opt out, and 1,287 tags.
- Focused `npx prettier --check` for every changed source and content file: exited 0; the vendor artifact and lockfile are intentionally ignored.
- `npm run prettier:check`: exited 2 with the same unrelated repository baseline, including the five known Liquid/HTML parser errors; no changed file appears in its warnings or errors.
- `docker compose run --rm jekyll ruby -rbigdecimal -S bundle exec jekyll build`: exited 0. The platform line Bundler adds locally was removed from `Gemfile.lock` afterward.
- Generated HTML contains the loader only for eligible posts and orders the rendered DEV section before `Comments on this blog` and the Utterances iframe. The opted-out post contains no DEV loader.
- Headless Chrome rendered 18 current comments in seven nested lists on the real post. Desktop and 390 px mobile checks showed no horizontal overflow; light and dark screenshots were readable; print hid both discussions; reload issued fresh article and comment requests; a real zero-comment post stayed hidden; and a blocked comment request showed the safe DEV fallback while preserving the page.
