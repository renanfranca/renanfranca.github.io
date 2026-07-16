---
layout: post
title: I Had Already Built Three Agentic Loops Without Naming Them
description: How execution plans, milestone acceptance criteria, and TDD with executable architecture became three nested feedback loops in my coding agent workflow.
date: 2026-07-16 12:00:00 -0300
tags: tales-of-a-dev
image: img/postbanners/2026-07-16-cover-i-had-already-built-three-agentic-loops.jpg
permalink: /:categories/:title:output_ext
---

![cover image](https://renanfranca.github.io/img/postbanners/2026-07-16-cover-i-had-already-built-three-agentic-loops.jpg)

## I was already working with loops

After reading Laurie Voss's article [What the hell is a loop, anyway?](https://www.linkedin.com/pulse/what-hell-loop-anyway-laurie-voss-ldmdc), I realized that I had naturally ended up with three layers of loops in my workflow with coding agents.

I had not deliberately designed something I called a loop architecture.

I had been trying to solve practical problems.

How could I give an agent enough autonomy to implement a complete feature without losing the destination?

How could I divide a large implementation into observable units of progress?

How could I ensure that the code evolved through behavior while continuing to respect the architecture?

The solutions I adopted gradually became three nested feedback loops.

I just did not have a name for them.

## These are loops inside one implementation

My three layers do not map perfectly to the four loop architectures Laurie describes.

I am not running an autonomous software factory that chooses work from a backlog, ships it, monitors production, and starts again.

The loops I see are inside the implementation of a single change.

The outer loop follows the complete execution plan.

Inside it, another loop follows the milestones.

Inside each milestone, TDD can generate several smaller red-green-refactor cycles.

Each layer operates at a different level of abstraction, receives different feedback, and has a different exit condition.

## The outer loop: the execution plan

The outermost layer is the execution plan.

As I described in [When Plan Mode Was No Longer Enough](https://renanfranca.github.io/when-plan-mode-was-no-longer-enough.html), the execution plan gives the agent more than a list of tasks.

It describes:

- why the change is needed;
- the current context;
- the desired final behavior;
- relevant constraints and decisions;
- the implementation milestones;
- the validation strategy;
- the final acceptance criteria.

This loop begins with the current state of the repository and a desired destination.

The agent implements, validates, updates the plan with what it discovers, and continues until the complete plan satisfies its final acceptance criteria.

The important part is that the loop does not end merely because the agent says that it has finished.

It ends when the observable result matches what the plan defined as complete.

The execution plan therefore protects the destination.

Local implementation decisions can change. A milestone may reveal that an earlier assumption was incomplete. The agent may discover a better design while practising TDD.

The plan can evolve with those discoveries, but the final outcome must remain explicit.

## The middle loop: the milestones

Inside the execution plan, there are milestones.

Each milestone has its own scope, validation commands, expected result, and acceptance criteria.

A milestone creates a smaller convergence point inside the larger implementation.

Instead of asking only:

> Has the complete feature been implemented?

The plan can repeatedly ask:

> Has this meaningful part of the feature reached the state it promised?

This distinction matters even though I no longer stop the agent after every milestone.

Earlier in my workflow, each milestone was also a human approval gate. I reviewed the implementation and explicitly authorized the next step.

Today, I usually allow the agent to implement the complete execution plan autonomously.

However, removing the human interruption did not remove the milestone loop.

The agent still needs to complete the milestone, run its validations, verify its acceptance criteria, record relevant decisions, and only then move forward.

The milestone remains a checkpoint even when I am not standing at the checkpoint.

It protects intermediate progress.

Without this layer, the agent could perform many technically valid operations without demonstrating that the implementation is moving through meaningful states toward the final result.

## The inner loop: TDD and executable architecture

Inside the milestones is the smallest and most active layer.

The TDD loop chooses the next observable behavior, writes a failing test, implements the minimum code necessary to make it pass, evaluates the opportunity for refactoring, and continues while the suite remains green.

One milestone can generate many of these cycles.

As I described in [When I Entrusted TDD to an AI Agent](https://renanfranca.github.io/when-i-entrusted-tdd-to-an-ai-agent.html), I eventually allowed Codex CLI to run these cycles autonomously through my [tdd-behavior-autonomous-quiet](https://github.com/renanfranca/codex-skills/blob/main/tdd%2Fbehavior-autonomous-quiet%2FSKILL.md) skill.

But TDD alone was not enough.

An agent can write passing tests while moving behavior into the wrong architectural layer. It can also create tests that merely reproduce the structure of the production code.

For this reason, the loop also receives feedback from architectural tests such as [`HexagonalArchTest`](https://github.com/seed4j/seed4j-cli/blob/main/src%2Ftest%2Fjava%2Fcom%2Fseed4j%2Fcli%2FHexagonalArchTest.java).

These tests make architectural boundaries executable.

When the agent introduces an invalid dependency, the repository rejects the design.

The failure creates another correction cycle:

1. the behavioral test may already be green;
2. an architectural rule fails;
3. the agent changes the design;
4. both behavioral and architectural tests run again;
5. the implementation continues only when both forms of feedback agree.

Vertical checkpoints add another feedback signal.

After a small number of TDD cycles, the agent must validate the feature through its public path. This prevents locally successful cycles from drifting into what I called the implementation details loop.

The inner layer therefore does more than ask whether the latest unit test passes.

It asks whether the behavior works, whether the design respects the architecture, and whether the accumulated implementation still produces progress through the feature's public path.

## Each layer asks a different question

Looking at the workflow as nested loops helped me understand why I need all three layers.

The execution plan asks:

> Are we reaching the final outcome?

The milestone asks:

> Have we completed this meaningful stage of the implementation?

The TDD and architecture loop asks:

> Does the next behavior work without compromising the design?

None of these questions replaces the others.

A green TDD cycle does not prove that a milestone is complete.

A completed milestone does not prove that the entire feature satisfies its acceptance criteria.

A completed execution plan does not prove that every internal design decision is good.

Each loop provides feedback at the scale where that feedback is useful.

## Autonomy depends on where feedback lives

Previously, much of this feedback lived in my interventions.

I inspected each step, questioned the direction, approved the next behavior, and decided when the agent could continue.

As I removed confirmation gates, I needed to move that judgment into executable constraints.

The execution plan made the destination explicit.

The milestone criteria made intermediate progress observable.

Behavior tests made functionality executable.

Architectural tests made design boundaries executable.

Vertical checkpoints made progress through the public path executable.

The agent did not become more autonomous because I stopped caring about the process.

It became more autonomous because the process could increasingly evaluate itself without waiting for me to repeat the same instructions.

## The loops still end with me

Even with these layers, I remain outside the complete implementation loop.

When the agent finishes, I review the result as a pull request.

I read the behavior tests, follow the production code that makes them pass, inspect the architectural decisions, refactor where necessary, and decide whether the change belongs in the codebase.

The loops reduce the number of routine decisions that depend on my immediate participation.

They do not transfer responsibility for the final code.

For now, the simplest names I have are:

- the execution plan loop;
- the milestone loop;
- the TDD and architecture loop.

Perhaps better names will emerge.

What matters to me is that I can finally see the structure that was already there.

I was not merely giving an agent a large prompt and waiting for code.

I was stacking feedback loops, each with its own scale, evidence, and exit condition.

I just did not know that this was what I was doing.
