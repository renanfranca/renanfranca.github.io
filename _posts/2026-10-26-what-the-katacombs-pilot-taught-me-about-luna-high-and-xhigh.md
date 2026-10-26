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

This study began with Steven Diamante's excellent presentation about Katacombs and code-quality sensors for coding agents. Steven was attentive and generous with his time. We met over Zoom, exchanged ideas, and debated questions that were not even on my radar. That conversation led directly to this pilot.

I had already been asking whether GPT-6-Luna could handle implementation work that I currently do with GPT-6.1 Medium. My longer-term goal is to see how far I can move that work toward a local model. In [my earlier post about Codex hooks in Git worktrees](/from-skills-to-hooks-testing-codex-hooks-in-git-worktrees.html), I described the start of that challenge. Here, I wanted to compare Luna's `high` and `xhigh` reasoning efforts on a concrete programming exercise.

## First, what is Katacombs?

A programming kata is a focused exercise for practicing software development in small steps. Katacombs is a kata about building a text adventure: the player explores an underground world by typing commands into a terminal. The game is built in slices, so each slice adds a playable set of behaviors instead of requiring the whole game at once.

The slice in this pilot is called **Walk the map**. Imagine arriving in an Entrance Hall. The game prints the room's title and description; you can then type commands such as `GO N`, `GO E`, or `GO DOWN` to travel between five connected locations. When you arrive somewhere, the game prints that location's title and description too. The six directions are north, east, south, west, up, and down.

This first slice also has to explain two different problems clearly: a valid direction with no exit should say that the player cannot go that way, while an unknown command such as `GO SIDEWAYS` should say that the input was not understood. Typing `?` lists the commands available in this slice, and `QUIT` exits the game.

That is the whole first increment. There are no items to pick up, gold to collect, doors to open, or `LOOK` command yet. Those belong to later slices. Keeping the task this small made it possible to give both model runs the same observable behaviors to implement and verify.

The game is the vehicle for the workshop's main idea: an agent can change code faster than a person can review every line, so it needs reliable feedback while it works. The sensor framework is meant to catch problems and explain what to do, without relying on the agent to remember every instruction.

## Hooks trigger checks; sensors do the checking

The words _hook_ and _sensor_ describe different parts of the setup. A **hook** is an automatic trigger tied to an event in the agent's session. A **sensor** is the check or review that the trigger starts. In this project, a sensor is meant to do more than report a number: it detects a problem and gives the agent guidance for addressing it. The hook supplies the trigger; it is not itself the check.

The setup had three kinds of sensors. Structural checks look for issues such as overly complex code or duplication. Behavioral checks ask whether the program and its tests work, including whether the tests catch deliberately introduced mistakes. A design review looks for problems that require judgment, such as responsibilities in the wrong place or names that mislead. It uses a separate language-model review, not another lint rule. The design review is the most expensive tier, so it is gated rather than run after every small edit.

Here is the sequence the hooks are designed to follow:

1. **`SessionStart`: record the starting point.** When a session opens, a hook snapshots the Git worktree. This is a baseline, not a quality result; it lets later checks distinguish new edits from files that were already present.
2. **`PostToolUse`: check after tool activity.** After a relevant tool call, a worktree watcher compares the current files with the previous snapshot. If files changed, quick checks run for code structure, duplication, and secrets. The watcher matters because Codex's tool event does not always identify which file an edit changed.
3. **`Stop`: check at the end of a turn.** When the agent tries to finish a turn, the hook checks the changed work again. If the quick checks are clear, behavioral validation escalates through type checking, related tests, and mutation testing; each stage gates the next. Mutation testing makes small, intentional changes to the code and checks whether the tests catch them. If the earlier gates allow it and the design review is due, the hook reports `SENSOR design: DUE`, and the agent runs the separate, judgment-based review.
4. **Before a commit: run the commit gate.** The repository also configures a pre-commit check. Neither pilot run made a commit, so that gate did not run as part of this comparison.

The configured sequence is different from claiming that every check fired at every event. The session records for both runs show `SessionStart`, `PostToolUse`, and a real `Stop` request for a design review. In the `high` run, a `Stop` check reported 91 mutants killed and then asked for the design review. After Luna corrected the review finding, the final direct `npm run check` reported 97 mutants killed and no timeouts.

Neither session recorded a new request to authorize hooks. That could mean existing trust was reused; it does not prove that hook authorization is never needed. I did not change trust records or provoke an artificial authorization prompt.

## How I compared `high` and `xhigh`

Both runs used the same model, `gpt-6-luna`; `high` and `xhigh` are its reasoning-effort settings, not different models. They also shared the starting commit, project brief, sensor framework, design charter, thresholds, and acceptance criteria. Each started in its own clean Git worktree: a separate working directory linked to the same repository, which kept the two implementations isolated. The runs happened on October 11 and 13, 2026. Installing the same locked dependencies was included in the elapsed time.

Both implementations met the functional criteria, passed the project's full `npm run check` command, and recorded a design review. The elapsed time runs from each task's start through implementation and review, so it includes more than coding and test execution.

| Effort       | Total elapsed time | Final checks                                                                            |
| ------------ | -----------------: | --------------------------------------------------------------------------------------- |
| Luna `xhigh` |  39 min 38.794 sec | `npm run check` passed; 562 tests across 37 files; 120 mutants killed and 4 timed out   |
| Luna `high`  |  14 min 30.206 sec | `npm run check` passed; 563 tests across 36 files; 97 mutants killed and none timed out |

In this pair of runs, `high` took 25 min 8.588 sec less elapsed time, a 63.42% reduction compared with `xhigh`. The test and mutation counts are not direct quality scores: the implementations and mutation targets differed, and the four `xhigh` timeouts are not mutants killed by tests.

Both design reviews covered the same twelve questions. Each recorded and corrected one finding, then recorded zero remaining findings. The implementations addressed duplication differently: `xhigh` consolidated the direction list and derived its type from that source, while `high` removed duplication between command parsing and help output. A later comparison found that `high` still listed directions separately in its type and direction table. Review receipts show that a review happened; they do not preserve written answers to every question or prove that no other design issues remained.

Test-driven development (TDD) means writing a test that fails first (red), changing the code until it passes (green), then improving the design while keeping tests green. The process was only partially followed here: both runs had red and green cycles, but tests were sometimes added in groups. In `high`, four tests for refusals, unknown input, help, and quitting were added together and passed without an implementation change between editing and running them. `Xhigh` also grouped journeys and cases. So both implementations met the functional result, but neither consistently tested one behavior per cycle as requested.

## What I take from one pair of runs

For this task, Luna `high` delivered a functional implementation with substantially less elapsed time than Luna `xhigh`. That is an encouraging reason to keep trying Luna during implementation, especially because my longer-term goal is to move toward a local model.

It is still only one run at each effort. The runs happened on different days, and system load, npm cache, and service latency were not controlled. The `xhigh` run also recorded a context-compaction gap of 5 min 55 sec; I kept it in elapsed time but cannot attribute the whole gap to processing or human activity. This comparison does not show that `high` is generally faster, that Luna is equivalent to GPT-6.1 Medium, or that it predicts the performance of a local model. I would need repeated runs across tasks and more controlled conditions to make those claims.

## Katacombs and Steven Diamante

Thank you, Steven, for an excellent presentation, for your time and attention during our Zoom conversation, and for the questions we explored together. They took this study beyond what I had originally planned.

- [Steven's Katacombs presentation](https://sdiamante13.github.io/katacombs-kata-ts/index.html#1)
- [Katacombs reference material](https://sdiamante13.github.io/katacombs-kata-ts/references.html)
- [Steven Diamante on LinkedIn](https://www.linkedin.com/in/stevendiamante/)
