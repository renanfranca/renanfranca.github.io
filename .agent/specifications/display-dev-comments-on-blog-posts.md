# Display DEV Comments on Blog Posts

- Status: Approved for implementation
- Source: Requirements agreed in the Codex conversation on 2026-09-13

## Purpose

Readers currently discuss syndicated posts on DEV, while the canonical blog exposes a separate GitHub discussion through Utterances. The blog must make the public DEV conversation visible on the canonical post without moving, copying, or accepting comments itself.

The feature is successful when a reader opens an eligible blog post that has public DEV comments and can read the current, complete threaded conversation before the existing GitHub comments. Reloading the post must revalidate the DEV data so that new public comments can appear without a site deployment.

## Scope

The implementation MUST:

- display the public DEV comment threads for syndicated posts;
- preserve every valid top-level comment and nested reply in the order returned by DEV;
- identify the corresponding DEV article through the canonical blog URL;
- link readers to DEV to continue or reply to the conversation;
- retain Utterances as a separate discussion below the DEV conversation; and
- disclose the browser's DEV integration in the site's privacy policy.

The implementation MUST NOT:

- authenticate readers with DEV or accept comments, replies, edits, reactions, or moderation actions in the blog;
- combine DEV and GitHub comments into one feed;
- maintain a local allowlist, blocklist, or selection of DEV comments;
- persist snapshots, article IDs, comments, or comment metadata in the repository or browser storage; or
- introduce a scheduled comment synchronization job.

Deletion, moderation, and visibility remain owned by DEV. A comment removed or hidden there MUST disappear from the blog after the next successful reload.

## Configuration and Eligibility

The site configuration MUST define a non-empty `dev_to_username` value. `renanfranca` is the initial value. This setting MUST be the single repository-owned source of the DEV username for both article synchronization account verification and comment display; a second hardcoded username MUST NOT be introduced.

Existing post eligibility remains authoritative:

- a post with `dev_to: false` MUST NOT emit the DEV comments integration or make DEV API requests;
- an otherwise DEV-enabled post MAY resolve a matching published article at runtime; and
- existing Jekyll post URLs and DEV canonical matching semantics MUST remain unchanged.

DEV metadata validation MUST fail with a clear diagnostic when `dev_to_username` is absent, blank, or not a string. No new per-post front matter is required.

## Runtime Data Flow

The browser MUST use unauthenticated DEV API v1 requests and the `Accept: application/vnd.forem.api-v1+json` media type. It MUST NOT receive, read, or transmit `DEV_TO_API_KEY`.

For each eligible post page:

1. Derive the post's absolute canonical URL from Jekyll's rendered page URL and site URL.
2. Request the configured user's published DEV articles and select an article whose `canonical_url` is exactly equal to the blog URL.
3. Treat no match as an unavailable DEV conversation and keep the section absent.
4. Treat multiple exact matches as an integration error rather than choosing one arbitrarily.
5. If the unique article reports zero comments, do not request its comments and keep the section absent.
6. Otherwise, request all comment threads using the article's numeric ID.
7. Keep the section absent when the returned collection is empty. When it is non-empty, render every valid node recursively.

The integration MUST NOT add an application-level persistent cache. A normal page reload MUST revalidate article and comment data with DEV. HTTP caching directed by DEV or the browser is permitted.

## Presentation and Navigation

The DEV discussion MUST appear after the article and before Utterances. When both sources are present, their visible headings MUST distinguish them as `Discussion on DEV` and `Comments on this blog`.

The DEV section MUST:

- remain hidden until a non-empty conversation has been resolved;
- show each comment author's name, profile image when safe and available, publication time, sanitized formatted body, and reply hierarchy;
- link the author to `https://dev.to/<username>`;
- link each comment to `<article.url>#comment-<id_code>`;
- provide a visible `Join the discussion on DEV` action that opens the matched article; and
- mark links opened in a new browsing context with `noopener noreferrer`.

Dates MUST use semantic `time` elements with the API timestamp in `datetime` and a human-readable value formatted for the page language. Profile images MUST have useful alternative text and lazy loading. Nested threads MUST retain their semantic hierarchy while capping visual indentation so that deep replies do not cause horizontal overflow.

The section MUST be responsive, usable by keyboard, readable in the site's light and dark themes, and excluded from printing. The existing article content, navigation, and Utterances behavior MUST remain unchanged.

## Content Safety

Every API field MUST be treated as untrusted input. Comment HTML MUST be sanitized before it enters the rendered document.

The sanitizer MAY preserve common comment formatting, including paragraphs, line breaks, emphasis, headings, lists, blockquotes, code blocks, tables, links, and images. It MUST remove scripts, styles, forms, frames, embedded objects, SVG, event-handler attributes, and any other executable or active content. Link and image URLs MUST be restricted to safe `https` or `http` protocols; unsafe or malformed URLs and attributes MUST be removed. DEV profile images MUST be omitted unless their URL is valid and uses HTTPS.

Text and attribute values from the API MUST be assigned through safe DOM operations rather than HTML string interpolation. Sanitization MUST cover nested comments and error or fallback content as well as the top-level thread.

## Failure Semantics

Failures in DEV integration MUST NOT block or alter the blog post, navigation, or Utterances.

- If article discovery fails because of a network error, non-success response, malformed response, or duplicate canonical match, the DEV section MUST remain absent and a concise diagnostic MUST be written to the browser console without exposing credentials or full response bodies.
- If a matched article is known but comment retrieval fails, the section MUST show a compact message that the DEV discussion could not be loaded and provide a link to the matched article.
- If an individual comment lacks the fields required for safe rendering, that node and its descendants MUST be omitted, valid sibling threads MUST still render, and the browser console MUST identify the malformed comment without logging its body.
- Failed profile images or optional profile metadata MUST NOT suppress an otherwise valid comment.

The user-facing fallback and diagnostics MUST not imply that an empty conversation is an error.

## Privacy Disclosure

The privacy policy MUST state that eligible post pages contact DEV to retrieve public discussions. It MUST explain that the request and DEV-hosted profile images can disclose ordinary request metadata, such as the visitor's IP address and user agent, to DEV and its asset delivery providers, and it MUST link to DEV's privacy information. The policy's last-updated date MUST be revised with the change.

## Acceptance Scenarios

1. Given a DEV-enabled post with one exact matching article and nested public comments, opening the blog post displays all valid comments and replies in API order under `Discussion on DEV`, followed by `Comments on this blog` and Utterances.
2. Given a new public comment or reply on DEV, reloading the canonical blog post revalidates the API and displays it without a repository change or deployment.
3. Given a matching article with zero comments or an empty comments response, the DEV section is absent and Utterances remains available.
4. Given `dev_to: false`, the rendered post contains no DEV comments loader or DEV API request.
5. Given no canonical match, the DEV section is absent. Given duplicate canonical matches, no arbitrary article is displayed and a safe console diagnostic is emitted.
6. Given a matched article whose comments request fails, the article remains readable and a compact link to the DEV article replaces the conversation while Utterances remains available.
7. Given comment HTML containing scripts, unsafe URLs, event handlers, frames, or embedded active content, none executes or survives sanitization; safe text and formatting continue to render.
8. Given a deeply nested conversation, desktop and mobile layouts preserve the reply relationship without horizontal page overflow.
9. In light mode, dark mode, keyboard navigation, and print preview, the discussion remains readable and operable, and no DEV or GitHub comments appear in print.

## Validation Expectations

Automated tests MUST use simulated DEV responses and MUST cover eligibility, exact canonical matching, no match, duplicate matches, zero comments, recursive ordering, safe link construction, malformed nodes, request failures, and sanitization of executable content. They MUST run through the existing `npm run test:dev-to` command and MUST NOT depend on the live DEV service.

Before completion, implementation validation MUST include:

- `npm run test:dev-to`;
- `npm run dev-to:validate`;
- the repository's Prettier check; and
- manual inspection of a real post with nested DEV replies on desktop and mobile, in both color themes and print preview.

Manual validation MUST confirm section ordering, links to the matched DEV article and individual comments, fresh data after reload, the empty state, and continued Utterances behavior.

## Explicit Limits and Rejected Alternatives

- Live read-only API retrieval is required; build-time snapshots and daily repository updates are rejected.
- DEV and GitHub remain visibly separate; a combined feed is rejected.
- DEV remains the only moderation surface; local filtering and curated highlights are rejected.
- Replying happens on DEV; DEV authentication or write APIs in the blog are rejected.
- Canonical URL matching remains the identity contract; storing DEV article IDs in front matter or generated data files is rejected.
