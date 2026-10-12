---
layout: post
title: 'From Skills to Hooks: Testing Codex Hooks in Git Worktrees'
description: A Codex CLI experiment comparing hook discovery in the main checkout and a Git worktree, with notes on trust, execution paths, and what the results cannot prove.
date: 2026-10-11 10:00:00 -0300
tags: tales-of-a-dev
dev_to_tags:
  - ai
  - agents
  - tooling
  - git
image: img/postbanners/2026-10-11-cover-from-skills-to-hooks-testing-codex-hooks-in-git-worktrees.png
permalink: /:categories/:title:output_ext
---

![Abstract branch diagram illustrating Codex hooks across Git worktrees](/img/postbanners/2026-10-11-cover-from-skills-to-hooks-testing-codex-hooks-in-git-worktrees.png)

I've set myself a new challenge: instead of using GPT-6.1 Medium for implementation, I'm now going to use GPT-6 Luna xhigh.

My goal is to accomplish everything I already do during the implementation phase, but with a model whose capabilities are closer to those of a model that could run locally. If I succeed, this could open the door to eventually migrating to a local model.

To make this possible, I realized that Luna wouldn't be able to follow all the instructions in my skills. So I decided to replace skills with hooks wherever possible.

However, I ran into a problem with hooks in ChatGPT Desktop. There's a bug that prevents them from working.

That's why I switched to Codex CLI. While working on my project, I decided to test how hooks are triggered when using Git Worktrees.

And what did I discover? Hooks behave differently when working with Git Worktrees.

I ran several tests to better understand this behavior, and now I'm going to share a report with my findings.

## What I tested

That last point led me to a narrower question I could observe directly: when a Codex CLI session starts inside a linked Git worktree, which checkout supplies its project hook definition?

I used a disposable repository with a main checkout and a linked worktree. Both had a `.codex/hooks.json` file. I changed the marker in each file across four phases, then checked both the hook definition reported by the App Server and the marker recorded when the hook ran.

| Phase | Main checkout manifest | Worktree manifest | Hook listed and run in the worktree | Trust and authorization                                                   |
| ----- | ---------------------- | ----------------- | ----------------------------------- | ------------------------------------------------------------------------- |
| A     | `MAIN_V1`              | `MAIN_V1`         | `MAIN_V1`                           | Already authorized                                                        |
| B     | `MAIN_V1`              | `WORKTREE_V1`     | `MAIN_V1`                           | No new explicit authorization prompt                                      |
| C     | `MAIN_V1`              | `WORKTREE_V2`     | `MAIN_V1`                           | The only `Stop` hook was already authorized                               |
| D     | `MAIN_V2`              | `WORKTREE_V2`     | `MAIN_V2`                           | The CLI requested authorization; after approval, the new hash was trusted |

Phase A was a control: both manifests had the same marker, so that phase alone could not tell which one supplied the hook. In phases B and C, changing only the worktree manifest did not change the hook that was listed or run. In phase D, changing the main checkout manifest changed the hook shown and executed in the worktree.

The definition and the command ran from different checkouts. In phases B and C, `hooks/list` pointed to `codex-hooks-probe-main/.codex/hooks.json`, even when I queried it using the worktree path. The hook command used `git rev-parse --show-toplevel` to locate its script, so the script itself ran from `codex-hooks-probe-worktree/scripts/hook-probe.mjs`. The command came from the main checkout's manifest; the script it resolved at runtime lived in the worktree.

The test used Codex CLI 0.162.1 on Linux. For each phase, I started fresh App Server processes and queried the main checkout and worktree separately, including in both query orders. The order did not change the result. `config/read` reported `cwdProjectTrust: null` for the worktree path throughout the experiment.

## Trust leaves a question open

The [hooks documentation](https://learn.chatgpt.com/docs/hooks) says that matching hooks from multiple active configuration layers are loaded, that project-local hooks load only when the project's `.codex` layer is trusted, and that new or changed hook definitions need review against their current hash.

The `cwdProjectTrust: null` value matters here. It does not establish that the worktree's project layer had been explicitly trusted. So, although the worktree manifest did not appear in my results, this experiment does not tell me what would happen after explicitly trusting that worktree layer. It also cannot identify, by itself, whether trust state or hook discovery explains the observed behavior.

## Similar reports and current source

Other Codex users have reported related behavior in separate issues. [Issue #23996](https://github.com/openai/codex/issues/23996) describes Codex Desktop and App Server loading a project hook definition from the primary checkout while running the command with the linked worktree as its current directory. The report tested a bundled `codex-cli 0.133.0-alpha.1`.

[Issue #27133](https://github.com/openai/codex/issues/27133) reports project-level hooks not being discovered from a worktree in Codex CLI 0.137.0. Later comments describe similar observations on other versions. One commenter reports that, on Codex CLI 0.162.1 for Linux, the exact worktree path was trusted and its project configuration was enabled, but `/hooks` still showed no project events. That symptom differs from my experiment: I saw the main checkout's hook listed and run from the worktree, while `cwdProjectTrust` was `null`. These are separate user reports under different setups, not identical reproductions or measurements from my experiment.

The [current loader on the Codex `main` branch](https://github.com/openai/codex/blob/main/codex-rs/config/src/loader/mod.rs#L1132-L1154) contains explicit linked-worktree handling. It keeps ordinary project configuration associated with the worktree while resolving hook declarations from the matching root checkout layer; [the merge code](https://github.com/openai/codex/blob/main/codex-rs/config/src/loader/mod.rs#L1811-L1833) replaces the worktree layer's hook declarations with the root checkout's hooks. That current source is useful context for the observed split between hook definition and command execution. It is separate evidence from the CLI binary I tested, and the documentation does not state this worktree-specific rule as a user-facing contract.

The [Git worktrees documentation](https://learn.chatgpt.com/docs/environments/git-worktrees) describes worktrees as separate working directories connected to one repository. It does not specify which checkout Codex should use when looking up project hooks.

## What I can conclude

In this experiment, Codex CLI 0.162.1 used the main checkout's hook manifest when a session ran in the linked worktree. Changing the worktree manifest from `WORKTREE_V1` to `WORKTREE_V2` did not change the hook listed or the marker recorded. Changing the main checkout manifest to `MAIN_V2` did. The hook command then resolved and ran its script inside the worktree.

That is the result for this installation and setup. It does not show that worktree-specific hooks never work. The worktree's `cwdProjectTrust` remained `null`, and the experiment did not test every trust state, Codex version, or worktree arrangement.

It also does not answer whether skills can be replaced wholesale by hooks. My experiment tested how Codex finds and runs project hook definitions. It did not test how well Luna follows a skill or which instructions are safe to move into a deterministic hook. For another project, I would start a CLI session from the worktree itself, open `/hooks`, and check the listed source and trust state before drawing a conclusion.
