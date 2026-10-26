---
layout: post
title: 'What the Katacombs Pilot Taught Me About Luna High and XHigh'
description: An exploratory Katacombs kata comparison of GPT-6-Luna high and xhigh, including elapsed time, hook behavior, and the limits of one run per effort.
date: 2026-10-26 10:00:00 -0300
tags: tales-of-a-dev
dev_to_tags:
  - ai
  - agents
  - testing
  - tooling
image: img/postbanners/2026-10-26-cover-what-the-katacombs-pilot-taught-me-about-luna-high-and-xhigh.png
permalink: /:categories/:title:output_ext
---

![A branching catacomb map with amber and blue paths through the same corridors](/img/postbanners/2026-10-26-cover-what-the-katacombs-pilot-taught-me-about-luna-high-and-xhigh.png)

In [my earlier post about Codex hooks in Git worktrees](/from-skills-to-hooks-testing-codex-hooks-in-git-worktrees.html), I wrote about a new challenge: using GPT-6-Luna for implementation instead of GPT-6.1 Medium. I want to find out whether Luna can become a practical option for that phase and, over time, help me move toward a local model.

This Katacombs study began with Steven Diamante's excellent presentation. Steven was very attentive and generous with his time. We met over Zoom, exchanged ideas, and debated questions that were not even on my radar. That conversation changed what I wanted to investigate and led directly to this pilot.

## The question behind the pilot

I compared two implementations of Katacombs' first increment, _Walk the map_, using the same starting commit and project brief. The increment is a small terminal adventure: show the current location, move through a map in six directions, handle invalid commands and blocked paths, provide help, and quit cleanly. Items, gold, doors that must be opened, and a `LOOK` command were outside this slice.

Both runs used `gpt-6-luna`, the same sensor framework, design charter, thresholds, and acceptance boundaries. One run used `xhigh`; the other used `high`. They ran in separate clean Git worktrees. Installing the same locked dependencies was included in the elapsed time.

## What happened

Both implementations met the functional criteria, passed `npm run check`, and recorded a design review. The elapsed time runs from each task's start through implementation and review, so it includes more than coding and test execution.

| Effort       | Total elapsed time | Final checks                                                                            |
| ------------ | -----------------: | --------------------------------------------------------------------------------------- |
| Luna `xhigh` |  39 min 38.794 sec | `npm run check` passed; 562 tests across 37 files; 120 mutants killed and 4 timed out   |
| Luna `high`  |  14 min 30.206 sec | `npm run check` passed; 563 tests across 36 files; 97 mutants killed and none timed out |

In this pair of runs, `high` took 25 min 8.588 sec less elapsed time, a 63.42% reduction compared with `xhigh`. The test and mutation counts are not direct quality scores: the implementations and mutation targets differed, and the four `xhigh` timeouts are not test-killed mutants.

The design reviews covered the same twelve questions. Each run recorded and corrected one finding, then recorded zero remaining findings. The changes were different: `xhigh` consolidated the direction list and derived its type from that source, while `high` removed duplication between command parsing and help output. A later comparison found that `high` still listed directions separately in its type and direction table. The review receipts show that a review happened; they do not preserve written answers to every question or prove that no other design issues remained.

There were red and green TDD cycles, but neither run followed one behavior per test cycle throughout. In `high`, four tests for refusals, unknown input, help, and quitting were added together and passed without an implementation change between editing and running them. `Xhigh` also grouped journeys and cases. So the functional result was complete, but the requested TDD granularity was only partially followed.

## What the hooks recorded

Both sessions observed `SessionStart` and `PostToolUse`, and the real `Stop` hook requested a design review. There were no additional user turns and no new hook authorization request recorded.

That absence is compatible with existing trust being reused; it does not prove that authorization was unnecessary. I did not edit trust records or trigger an artificial prompt. The sessions also ran on different days, and system load, npm cache, and service latency were not controlled. The `xhigh` run recorded a context-compaction gap of 5 min 55 sec, which remains part of its elapsed time; I cannot attribute that interval entirely to processing or to human activity.

## What I take from one pair of runs

For this task, Luna `high` delivered a functional implementation with substantially less elapsed time than Luna `xhigh`. That is an encouraging reason to keep trying Luna during implementation, especially because my longer-term goal is to learn how far I can move toward a local model.

It is still only one run at each effort. The result does not show that `high` is generally faster, that it is equivalent to GPT-6.1 Medium, or that it predicts the performance of a local model. I would need repeated runs across tasks and more controlled conditions to make those claims. For now, the useful outcome is a concrete next question: can Luna handle more of my implementation work reliably when I repeat this kind of study?

## Katacombs and Steven Diamante

- [Steven's Katacombs presentation](https://sdiamante13.github.io/katacombs-kata-ts/index.html#1)
- [Katacombs reference material](https://sdiamante13.github.io/katacombs-kata-ts/references.html)
- [Steven Diamante on LinkedIn](https://www.linkedin.com/in/stevendiamante/)
