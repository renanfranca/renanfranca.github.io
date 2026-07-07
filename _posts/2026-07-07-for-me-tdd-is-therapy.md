---
layout: post
title: For Me, TDD Is Therapy
description: How TDD gave me a systematic way to work through the anxiety and uncertainty of software development—and how AI agents brought some of that anxiety back.
date: 2026-07-07 15:00:00 -0300
tags: tales-of-a-dev
image: img/postbanners/2026-07-07-cover-for-me-tdd-is-therapy.jpg
permalink: /:categories/:title:output_ext
---

![cover image](https://renanfranca.github.io/img/postbanners/2026-07-07-cover-for-me-tdd-is-therapy.jpg)

## The anxiety I recognized

While watching the podcast [How Kent Beck Shapes the Software Engineering Industry](https://youtu.be/ddHQQtjIOpw?t=4785&is=ZgGjff_muSzUlo6c), I heard Kent Beck describe the anxiety he felt while developing software and how Test-Driven Development helped him deal with it.

I immediately recognized that feeling.

I have felt it since my first contact with programming in 2006, during my Computer Science degree.

I never knew exactly where to begin an implementation.

The process was always different. It was highly intuitive and depended heavily on my mood, motivation, and confidence on that particular day.

Sometimes I would spend too much time thinking about the best place to start. Other times I would begin somewhere almost randomly and hope that the implementation would eventually reveal its shape.

There was no process I could trust.

## When working code was not enough

The uncertainty was so intense that, when something I implemented worked on the first try, I did not trust it.

A successful result was not enough to convince me.

I needed to deliberately break the production code and repeat the manual test. Only after watching the behavior fail could I feel confident that my manual verification was actually exercising the change.

Otherwise, I was left with uncomfortable questions:

- Did the implementation really work?
- Was my manual test actually exercising the changed behavior?
- Did it work for the reason I expected?
- Was there some accidental condition making everything appear correct?

I did not have a reliable way to move from uncertainty to confidence.

## For me, TDD is therapy

For me, TDD is therapy.

That is what I believe.

Not because TDD removes uncertainty from software development. It does not.

It gives me a systematic process for moving through that uncertainty.

I do not need to discover the entire implementation before I begin. I only need to identify the next observable behavior and express it as a test.

Then I watch it fail.

I implement enough to make it pass.

I refactor while keeping the behavior protected.

And then I repeat the cycle.

This process gives me somewhere to begin and tells me what to do next.

On my best days, it gives structure to my ideas.

On my worst days, it allows me to remain productive even when motivation and confidence are low.

That is my main reason for practising TDD.

The other benefits matter: executable documentation, regression protection, simpler designs, shorter feedback loops, and the confidence to refactor.

But my primary motivation is more personal.

TDD gives me a process I can follow when my intuition is not enough.

## How I started practising TDD

I started deliberately practising TDD in December 2022 while contributing to the open source project now known as [Seed4j](https://seed4j.com/).

In [How did I earn money to fix an issue from an Open Source Software?](https://renanfranca.github.io/how-did-i-earn-money-to-fix-an-issue-from-an-open-source-software.html), I described some of that first experience.

At the time, Seed4j was still called JHipster Lite.

That contribution also taught me an important distinction. I initially believed I was doing TDD, but I was actually writing tests before the implementation without necessarily allowing the tests to guide the design.

I was doing *test first*.

Learning that distinction did not discourage me. It gave me a clearer direction.

Since then, TDD has become much more than writing tests before production code. It has become the process through which I investigate a problem, discover behavior, make design decisions, and build confidence incrementally.

Two books were especially important in shaping how I understand this process:

- *Test-Driven Development: By Example*, by Kent Beck;
- *TDD*, by Jason Gorman.

## The explanation I grew tired of repeating

Before adopting this process, I grew tired of repeatedly explaining the same thing to people who assigned me a task:

> This change is simple. What takes time is manually testing the entire system to ensure that nothing has been broken.

The code change might require only a few lines.

The real cost came afterwards.

I needed to navigate through the application, recreate scenarios, remember which related features might be affected, and manually verify that an apparently unrelated behavior had not changed.

Then I needed to repeat much of that work after every adjustment.

Without automated tests, even a simple change carried a large and mostly invisible validation cost.

TDD did not merely help me write the change. It helped me build the mechanism through which I could safely change it again.

## When the team does not want TDD

I respect teams that do not want to work with TDD.

I think it is unfortunate, but I accept it.

I introduce the idea once. I explain why I believe it would help. If the team decides not to adopt it, I do not turn the subject into a permanent argument.

Life goes on.

However, for my own implementations, I still prefer to work through tests.

When necessary, I create a private fork and maintain a branch containing the tests. I write the tests and implement the change there. Then I open the pull request containing only the production code expected by the project.

This is not my preferred outcome. I would rather have the tests maintained alongside the implementation so that the entire team could benefit from them.

But even when a project has insufficient test coverage, abandoning my process makes the work more difficult for me.

The private branch allows me to preserve the feedback loop I need to implement the change with confidence.

## AI agents brought the anxiety back

AI agents changed my development workflow significantly.

They can explore a codebase, propose a plan, implement changes, execute tests, refactor code, and document decisions much faster than I could do all of those things alone.

But they also introduced new forms of anxiety.

I started asking myself:

> Am I limiting the AI agent by requiring it to work through TDD?

> How can I reproduce the TDD feedback loop when working with an AI agent?

> Does the agent genuinely practise TDD, or does it develop the solution first and create the tests afterwards?

That final question bothers me the most.

An agent can produce a test and production code in the same implementation. The final diff may look exactly like the result of TDD.

But the final diff does not reveal the process.

Did the test fail before the implementation existed?

Did that failure provide useful information?

Did the test guide a design decision?

Was only enough code written to satisfy the next behavior?

Or did the agent first construct the complete solution and then create tests that confirmed what it had already built?

The resulting repository may contain the same files, but the development process is not the same.

## The process still matters

In [When Plan Mode Was No Longer Enough](https://renanfranca.github.io/when-plan-mode-was-no-longer-enough.html), I described how execution plans and smaller milestones helped me reduce the volume of code I needed to review after working with an agent.

That approach gave me more control over the size of each change.

But it did not reproduce the TDD experience.

A milestone can still contain production code, tests, and refactoring created together. It can be small enough to review while still hiding the sequence through which the design emerged.

This matters to me because TDD is not valuable only because of the tests left behind.

The sequence matters.

The feedback matters.

The small decisions made after each failure matter.

Most importantly, the process changes how I think while implementing the solution.

For years, TDD gave me a way to manage the anxiety of not knowing where to begin.

Now AI agents are forcing me to examine that process more carefully than ever.

I need to understand which parts of TDD must remain visible, which parts can be delegated, and how I can know whether an agent is following the process rather than merely reproducing its final appearance.

I will explore those questions in my next post.
