---
layout: post
title: When I Entrusted TDD to an AI Agent
description: How I gradually removed confirmation gates, added behavioral and architectural guardrails, and learned to let Codex CLI practise TDD autonomously.
date: 2026-07-10 18:00:00 -0300
tags: tales-of-a-dev
image: img/postbanners/2026-07-10-cover-when-i-entrusted-tdd-to-an-ai-agent.jpg
permalink: /:categories/:title:output_ext
---

![cover image](https://renanfranca.github.io/img/postbanners/2026-07-10-cover-when-i-entrusted-tdd-to-an-ai-agent.jpg)

## Keeping the tests under my control

When I first started using AI agents for software development, I kept a clear division of responsibilities.

I wrote the tests.

The agent implemented the production code and helped me refactor it.

At the time, I was using [Aider](https://aider.chat/) through its CLI.

This arrangement allowed me to benefit from the agent without giving up control of the TDD process. I still chose the next behavior, wrote the failing test, watched it fail, and decided when the implementation was ready to be refactored.

More importantly, it kept my anxiety under control.

As I described in [For Me, TDD Is Therapy](https://renanfranca.github.io/for-me-tdd-is-therapy.html), TDD gives me a systematic way to move through the uncertainty of software development. Delegating production code while retaining the tests allowed me to preserve that process.

Then I watched a presentation that changed how I thought about this division.

## Seeing an LLM practise TDD

The presentation was Lada Kesseler's excellent [Augmented Coding: Mapping the Uncharted Territory](https://youtu.be/_LSK2bVf0Lc?si=AW-QDxeCCgofLbDt).

For the first time, I saw the possibility of allowing an LLM to write both the tests and the production code while still following the TDD flow.

Until then, I had assumed that keeping control of TDD meant keeping control of the tests.

Lada's presentation showed me another possibility: perhaps I could delegate the entire red-green-refactor cycle while still making the process visible and inspectable.

I was so excited that I sent [Lada Kesseler](https://www.linkedin.com/in/lada-kesseler?utm_source=share_via&utm_content=profile&utm_medium=member_android) a message on LinkedIn to thank her.

She very kindly sent me the prompt she had used to guide the LLM through TDD.

Reusable agent skills, at least in the form in which I use them today, did not exist yet. Even so, her presentation and prompt were already exploring the problems that skills would later help me address.

## My first TDD skill

When skills emerged, I used Lada's prompt as the foundation for my first [`tdd` skill](https://github.com/renanfranca/codex-skills/blob/main/tdd%2FSKILL.md).

Sorry, Lada, if I somehow ruined your original prompt 😅.

I started using the skill with Codex CLI to implement new features inside existing business domains.

The process was extremely interactive.

The agent would:

1. write a comment describing the intention of the smallest test it wanted to implement;
2. wait for my approval;
3. implement the test and explain how it expected the test to fail;
4. wait for approval again;
5. implement the minimum production code necessary to make the test pass;
6. wait before refactoring or moving to the next behavior.

It was beautiful to watch.

The tests led the implementation. The expected failure was made explicit. Production code was added incrementally. Refactoring happened only while the test suite was green.

Most importantly, I could see the process.

I was no longer looking only at a final diff containing tests and production code. I could follow the sequence through which the design emerged.

However, I gradually started to notice another problem.

My need for control was forcing me to use the agent with the handbrake on.

## Removing confirmations from inside the cycle

My next experiment was [`tdd-strict-cycle-confirmation`](https://github.com/renanfranca/codex-skills/blob/main/tdd-strict-cycle-confirmation%2FSKILL.md).

Instead of requiring approval at several boundaries inside the same TDD cycle, the agent could complete red, green, and refactor before returning control to me.

The practical effect was simple.

I approved the next behavior. The agent wrote the failing test, implemented the minimum code, evaluated the opportunity for refactoring, reran the relevant tests, and then stopped before beginning another cycle.

This made the workflow considerably smoother.

I still had frequent opportunities to intervene, but I no longer needed to authorize every mechanical transition. The feedback loop remained small enough for me to understand what had happened without unnecessarily interrupting the agent.

For a while, this felt like the right balance.

Then I wanted to know what would happen if I removed even that confirmation gate.

## Letting the agent finish the feature

I created another variation called [`tdd-strict-autonomous`](https://github.com/renanfranca/codex-skills/blob/main/tdd-strict-autonomous%2FSKILL.md).

This version no longer stopped after every completed cycle. It continued automatically through red, green, and refactor, pausing only when it encountered an exceptional situation such as ambiguous behavior, an unexpected failure, an architectural decision, or an environment problem.

At the time, I was trying to implement [Registration of custom seed4j instances](https://github.com/seed4j/seed4j-cli/issues/6).

The feature would allow the Seed4j CLI to register additional Seed4j module providers and discover their modules at runtime.

Even I did not know exactly what the technical solution should look like.

That uncertainty was part of the experiment. Instead of directing every design decision, I wanted to observe what the agent would discover through TDD.

Unfortunately, the experiment exposed a serious problem.

## The implementation details loop

I called the problem the **implementation details loop**.

The agent continued taking small steps. Each individual step appeared reasonable. Tests were being added, production code was changing, and the suite kept moving forward.

But the implementation was no longer moving meaningfully toward the feature.

The agent had become absorbed in the internal structure it was creating.

A new class encouraged a new test class. That test exposed another internal detail. Supporting that detail required another production abstraction, which then received its own tests.

The cycles were small, but the feature was disappearing from view.

When I inspected the Codex CLI session, I found so much information that I could not identify the exact moment when the implementation had lost its direction.

The problem was not a lack of activity.

The problem was that local progress no longer implied progress through the feature's public path.

I abandoned the implementation and returned to [`tdd-strict-cycle-confirmation`](https://github.com/renanfranca/codex-skills/blob/main/tdd-strict-cycle-confirmation%2FSKILL.md).

This time, I wanted to find the precise cycle in which the agent started following implementation details instead of behavior.

After finding it, I told Codex CLI that it was trapped in a loop and added this instruction to the TDD skills:

> Run a vertical checkpoint at least every two cycles using the public path of the feature.

The agent could still work through small units, but it now had to regularly prove that those units composed into observable progress.

This improved the situation, but it did not solve everything.

## Making the autonomous process quieter

The agent still produced a large volume of messages.

Detailed output had initially helped me trust the process. Once the agent became autonomous, however, the same volume made it harder to notice the information that actually mattered.

Routine file reads, expected failures, test commands, green transitions, and minor refactorings created a long stream of activity.

I created [`tdd-strict-autonomous-quiet`](https://github.com/renanfranca/codex-skills/blob/main/tdd-strict-autonomous-quiet%2FSKILL.md) to reduce that noise.

Quiet does not mean merely writing shorter messages.

It means emitting fewer messages.

The agent keeps ordinary cycle details internal and interrupts me only for meaningful events:

- an unexpected failure;
- a blocked environment;
- a public-path checkpoint failure;
- an architectural or public API decision;
- a significant refactoring;
- a final summary.

This made autonomous execution much easier to follow.

However, the quieter output also made another problem clearer.

The agent was still creating too many tests tied to the structure of the production code.

## Tests should not mirror production topology

I frequently saw one test class for every production class.

When the implementation extracted a helper, resolver, parser, mapper, or adapter, the agent often created a corresponding test.

The final suite could have excellent coverage while still being fragile.

A refactoring that renamed, moved, split, or merged production classes could require several tests to change even when no observable behavior had changed.

I could correct the direction manually, but doing so repeatedly was becoming too much work.

The agent was failing to apply a concept presented in complementary ways in these two articles:

1. [Test Contra-variance, by Uncle Bob](https://blog.cleancoder.com/uncle-bob/2017/10/03/TestContravariance.html);
2. [Additional Testing After Refactoring, by Kent Beck](https://tidyfirst.substack.com/p/additional-testing-after-refactoring).

My interpretation is that the shape of the tests should not follow the shape of the production code.

Production code may become more detailed as the design evolves. It may gain more classes, functions, modules, and internal abstractions.

The tests do not need to reproduce that topology.

They should remain attached to observable behavior and stable contracts.

A test is suspicious when it fails merely because the production code was internally reorganized while preserving the same behavior.

## Architecture defines stable observation points

Before improving the TDD skill again, I realized that the agent was also failing to respect the chosen hexagonal architecture consistently.

This matters because architecture helps identify useful and stable observation points for tests.

A command-line feature can often be tested through the CLI boundary. An application behavior can be exercised through an application service. Domain rules can be verified through domain contracts.

Internal adapters and implementation helpers usually do not need tests merely because they exist.

For a practical explanation of this relationship, I recommend [TDD in Hexagonal and Clean Architecture](https://www.youtube.com/live/PE57mE3qaHI?is=seGIWqGBGgq8cKdA), by [Valentina Jemuović](https://www.linkedin.com/in/valentinajemuovic).

Without enforceable architectural boundaries, an agent can gradually move behavior into the wrong layer while continuing to produce passing tests.

The tests may verify the code it created without protecting the design I intended.

Prompt instructions alone were not enough.

I needed the repository itself to reject architectural violations.

## Making the architecture executable

I implemented architectural tests such as [`HexagonalArchTest`](https://github.com/seed4j/seed4j-cli/blob/main/src%2Ftest%2Fjava%2Fcom%2Fseed4j%2Fcli%2FHexagonalArchTest.java).

These tests use ArchUnit to enforce rules including:

- domain code must not depend on infrastructure;
- application code must not depend on infrastructure adapters;
- primary adapters must not depend directly on secondary adapters;
- secondary adapters must not depend on the application layer;
- bounded contexts must communicate through the intended boundaries;
- domain ports must represent business capabilities;
- composition code must remain in the composition root.

This changed my relationship with the agent.

I no longer needed to rely only on a written instruction saying, “Respect the hexagonal architecture.”

The test suite could detect violations.

The architecture became executable feedback inside the same loop the agent was already following.

When an architectural test failed, the agent received concrete evidence that its current design had crossed a boundary.

## From strict TDD to behavior-focused TDD

The remaining task was to combine everything I had learned into another skill.

I created [`tdd-behavior-autonomous-quiet`](https://github.com/renanfranca/codex-skills/blob/main/tdd-behavior-autonomous-quiet%2FSKILL.md).

It preserves autonomous red-green-refactor cycles and quiet output, but it adds an important requirement: tests must follow observable behavior, public contracts, user journeys, or intentionally stable component APIs.

They must not follow production file and class structure.

Before creating a new test class, the agent must effectively answer three questions:

1. Which behavior is being specified?
2. Through which public or stable API is that behavior observed?
3. Why is no existing behavior test suite the appropriate home for it?

Extracting a new internal class does not automatically justify creating a new test class.

Moving production code does not automatically justify moving tests.

A lower-level test is appropriate only when the component has a stable API that is independently meaningful to a caller.

The agent should prefer the highest useful observation point that still provides clear and sufficiently fast feedback.

This was the missing piece.

## Combining the skill with execution plans

Today, I use `tdd-behavior-autonomous-quiet` to implement execution plans created through the process I described in [When Plan Mode Was No Longer Enough](https://renanfranca.github.io/when-plan-mode-was-no-longer-enough.html).

My workflow has changed since I wrote that post.

Previously, I asked the agent to implement one milestone at a time. I reviewed the result and explicitly authorized the next milestone.

I no longer do that.

I realized that a milestone does not always correspond to a complete feature or even a complete design decision.

Sometimes I reviewed an intermediate state and corrected something that would naturally have been resolved in a later milestone. My intervention was based on incomplete information.

Now I wait for the entire execution plan to be implemented.

The execution plan gives the agent the destination, context, constraints, validation strategy, and important decisions.

The TDD skill controls how the implementation moves toward that destination.

The architectural tests protect the boundaries of the system.

The vertical checkpoints verify that local cycles continue producing progress through the public path.

Together, these elements allow the agent to work autonomously without reducing the process to “generate everything and add tests afterwards.”

## Reviewing the result as a pull request

The result is usually well-designed code with tests that genuinely verify behavior.

I still find opportunities for refactoring and improvement.

But the experience now feels like reviewing a very well-written pull request.

I begin with the first behavior test.

I understand what it protects.

Then I examine the production code that makes it pass.

I continue following that relationship between behavior and implementation until I complete the review.

A practical example is the pull request [enhance apply plan dependency status](https://github.com/seed4j/seed4j-cli/pull/272/commits).

The first commit contains exactly what the agent developed, without any intervention from me.

The remaining commits show the adjustments I made during my review.

That distinction is important because it makes the result inspectable.

It shows what autonomous implementation produced and where my judgment still changed the code.

## Autonomy introduced a different waiting problem

Waiting between three and six minutes for the agent to deliver the implementation still bothers me.

The agent writes quickly enough that I cannot meaningfully follow every operation in real time.

At the same time, it is slow enough to leave me waiting and disconnected from the problem-solving process.

Ideally, the interaction would [respond within the precious 400 milliseconds](https://newsletter.kentbeck.com/p/the-precious-eyeblink), preserving the feeling of a continuous workflow.

Instead, I delegate the work, wait, and later receive an implementation that I need to load into my mind.

This creates a different kind of cognitive cost.

## I am not a multitasker

I am not a multitasker.

I can perform tasks sequentially, and TDD supported this extremely well.

After completing a red-green-refactor cycle, I had a natural stopping point. If I was interrupted, I knew that the suite was green and the current behavior had been completed.

When I returned, the next failing test or pending behavior told me where to continue.

Reviewing an autonomous implementation is different.

If I am interrupted in the middle of the review, I need to mark which test I have already examined and which one I should read next.

I also carry a greater cognitive load because I did not participate directly in each problem-solving step.

The final code may be clear, but the path that produced it is not fixed in my mind in the same way as code I developed myself.

The agent has reduced the effort required to produce the implementation.

It has not eliminated the effort required for me to understand and assume responsibility for it.

## Answering my previous questions

In [For Me, TDD Is Therapy](https://renanfranca.github.io/for-me-tdd-is-therapy.html#ai-agents-brought-the-anxiety-back), I asked three questions.

I can now answer two of them.

> Am I limiting the AI agent by requiring it to work through TDD?

I reduced my need for control as much as I currently consider responsible.

I no longer write the tests myself. I do not approve every test, every green implementation, every refactoring, every cycle, or every milestone.

I entrust the TDD process to the agent until the complete execution plan has been implemented or a meaningful exception requires my attention.

The constraints remain strict, but routine control no longer depends on me.

> How can I reproduce the TDD feedback loop when working with an AI agent?

I moved toward it gradually.

Initially, every transition was visible and required confirmation. Later, I approved only complete cycles. Then I allowed cycles to continue autonomously.

Today, most routine steps remain internal, but the agent surfaces relevant decisions, failures, checkpoints, and refactorings.

I no longer experience the feedback loop by personally performing each step.

Instead, I make the loop executable through the skill, the test suite, the architectural rules, and the public-path checkpoints.

That is not the same experience as practising TDD manually, but it preserves the properties I care about.

The third question remains more difficult.

> Does the agent genuinely practise TDD, or does it develop the solution first and create the tests afterwards?

My friend [Victor Perone](https://www.linkedin.com/in/victor-perone-696634a7?utm_source=share_via&utm_content=profile&utm_medium=member_android) introduced me to a few machine-learning concepts.

That alone was enough for me to realize how different this field is from my own.

To answer this question properly, I would need to investigate much more deeply what happens inside an LLM while it appears to perform a TDD cycle.

Anthropic itself is still investigating how language models internally reach their outputs, as shown in [On the Biology of a Large Language Model](https://transformer-circuits.pub/2025/attribution-graphs/biology.html) and [Verbalizable Representations Form a Global Workspace in Language Models](https://transformer-circuits.pub/2026/workspace/index.html).

For now, I can verify the external process.

I can require a failing behavior test before production code changes.

I can inspect the failure.

I can constrain the green implementation.

I can require refactoring only while the suite is green.

I can enforce architectural boundaries and repeatedly validate the feature through its public path.

I still cannot claim to know what happened internally before the agent displayed each step.

## What I actually learned to trust

I did not learn to trust every line generated by an AI agent.

I learned to trust a process with executable constraints.

The agent owns the individual TDD cycles.

The execution plan preserves the destination.

Behavior tests protect what users and callers can observe.

Architectural tests protect the system's boundaries.

Vertical checkpoints prevent small implementation steps from losing the feature.

I remain responsible for reviewing the result and deciding whether it belongs in the codebase.

Delegating TDD did not remove me from software development.

It changed where I participate.
