# Automate DEV article syndication

## Purpose and success

Make every eligible Jekyll post publishable to the `renanfranca` DEV account without copying content or metadata. A successful implementation validates four repository-owned DEV tags, creates missing articles with the blog URL as canonical, updates matching articles after blog changes, preserves DEV-only articles and series, and remains disabled until the repository owner explicitly enables it.

## Context and limits

- `_posts` remains the content source of truth; `dev_to: false` opts a post out.
- The integration uses the official DEV REST API and a GitHub Actions secret named `DEV_TO_API_KEY`; no credential is stored or printed.
- Existing DEV articles are matched only by canonical URL. Deleting or opting out of a blog post never unpublishes its DEV article.
- RSS import is outside the implementation and must be disabled manually before activation.
- The scheduled workflow checks once per day at 23:30 in `America/Bahia` and may publish a future-dated post later than its declared time.

## Decisions

- Store the public DEV tag catalog plus the author's used tags as a stable alphabetical JSON array in `_data/dev_to_tags.json`. This makes AI-assisted tag selection inspectable and avoids an AI dependency during deployment.
- Require exactly four `dev_to_tags` values for every eligible post. Missing metadata fails validation instead of silently selecting deployment-time tags.
- Match articles by canonical URL rather than writing DEV IDs back into posts. Rerunning a partially successful missing-only import is therefore idempotent without bot commits.
- Gate automatic push and schedule jobs with the `DEV_TO_SYNC_ENABLED` repository variable. Manual dry runs and the initial missing-only import remain available while the gate is off.

## Milestones

1. Establish tag and post contracts.
   - Add the site URL, generated tag catalog, package commands, `AGENTS.md` authoring rules, `dev_to_tags` for the 28 real posts, and `dev_to: false` for the sponsored template.
   - Add parsing, canonical URL, tag validation, and Markdown conversion modules with focused Node tests.
   - Validate with `npm run test:dev-to` and `npm run dev-to:validate`; both must exit 0 for all 29 posts.
2. Implement safe DEV synchronization.
   - Add a paginated DEV client, account verification, rate-limit retry, create/update/missing-only behavior, dry-run output, changed-file selection, and canonical duplicate protection.
   - Test HTTP behavior with simulated responses and validate current canonical URL derivation against the published sitemap.
   - Validate with `npm run test:dev-to` and `npm run dev-to:dry-run`; tests must pass and dry run must report 11 creates, 17 skips, and one opt-out without writing to DEV.
3. Wire GitHub Actions and rollout controls.
   - Add pull-request validation, guarded push synchronization, manual modes, daily future-post handling, GitHub Pages build waiting/requesting, and concise job summaries.
   - Run repository formatting checks and re-audit every requested behavior.
   - Validate the new files with Prettier, validate the workflow with actionlint, build the Jekyll site, and rerun the DEV tests and metadata validation.

## Progress

- [x] Create a dedicated working branch.
- [x] Record the implementation plan.
- [x] Complete milestone 1: 28 enabled posts and one opt-out validate against 1,287 catalog tags; 21 focused tests pass.
- [x] Complete milestone 2: the public-account dry run reports 11 creates, 17 existing articles plus one opt-out skipped, and no writes; all 29 canonical URLs match the published sitemap.
- [x] Complete milestone 3: actionlint accepts the workflow, all new integration files pass Prettier, and Jekyll builds successfully in the repository's Docker image after preloading its missing `bigdecimal` runtime dependency.
- [x] Perform the final request audit and handoff: every requested behavior is implemented, automatic writes remain gated off, and no DEV mutation occurred during validation.

## Risks

- DEV and Jekyll support different embeds and URL resolution. Conversion must leave fenced code untouched and fail on unsupported executable markup rather than publish broken content.
- The DEV API has separate creation and update limits. Requests must honor `Retry-After`, and retries must remain idempotent through canonical matching.
- GitHub Pages builds and the sync job can race. No DEV write may occur until the relevant Pages build succeeds and the canonical page is reachable.
- A first implementation commit changes post metadata. The activation variable prevents that commit from publishing before credentials and import review are ready.

## Rollout and recovery

1. Merge with `DEV_TO_SYNC_ENABLED` absent or set to `false`.
2. Generate a DEV API key, store it as `DEV_TO_API_KEY`, and verify RSS publishing is disabled.
3. Run the workflow manually in dry-run mode, then in `missing-only` mode.
4. Verify a sample of the 11 new articles and set `DEV_TO_SYNC_ENABLED=true`.
5. If the import fails partway, rerun `missing-only`; canonical matching skips successful articles. Disable the variable to stop later automatic writes.

## Validation

- `npm run test:dev-to`: 24 focused unit and integration-style tests pass.
- `npm run dev-to:validate`: 28 eligible posts and one opt-out validate against 1,287 catalog tags.
- `npm run dev-to:dry-run`: performs reads only and reports 11 creates, no updates, and 18 skips while displaying tags for each decision.
- A live comparison confirms that all 29 canonical URLs occur in the published sitemap and that all 17 existing blog-backed DEV articles retain their current DEV tags.
- The new workflow, scripts, tests, catalog, and documentation pass a focused Prettier check; actionlint v1.7.12 accepts the workflow.
- The repository-wide `npm run prettier:check` remains red because of existing formatting warnings and Liquid/HTML parse errors in files outside this implementation.
- Jekyll 4.4.1 builds successfully in Docker after preloading `bigdecimal`; the current container bundle omits that Ruby runtime dependency when invoked without the preload.
- Final manual workflow validation is intentionally deferred until the owner configures `DEV_TO_API_KEY`; implementation must not publish during local validation.
