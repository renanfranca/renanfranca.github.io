---
layout: post
title: What Changed When the Same Kata Needed a UI
description: I ran the same Hangman kata with three Codex models and Seed4J CLI, then made the UI mandatory. The behavior stayed consistent; the engineering choices became visible.
date: 2026-09-09 15:08:00 -0300
tags: seed4j
image: img/postbanners/2026-09-09-cover-what-changed-when-the-same-kata-needed-a-ui.jpg
permalink: /:categories/:title:output_ext
---

![Three Hangman interfaces produced with Codex and Seed4J CLI](/img/postbanners/2026-09-09-cover-what-changed-when-the-same-kata-needed-a-ui.jpg)

## The next question needed a visible result

I began this exploration in [From an Empty Repository to a Java Kata, One Module at a Time](https://renanfranca.github.io/from-an-empty-repository-to-a-java-kata-one-module-at-a-time.html), following one Codex run from an almost empty repository to a Java project and a String Calculator implementation. Seed4J CLI gave the agent modules it could inspect and combine into the project foundation.

I then [compared six Codex runs](https://renanfranca.github.io/what-six-codex-runs-taught-me-about-tool-design.html). Their paths through the same workflow varied, but all finished as compact Java libraries.

For the next step, I wanted differences that were visible without reading a module history or scorecard. Hangman was useful because its original specification allowed either a game library or a playable interface.

For the [first Hangman experiment](https://github.com/renanfranca/seed4j-cli-hangman-kata), Luna, Terra and Sol received the same prompt:

> Implement the specification in SPEC.md using the already-installed Seed4J CLI tool as support.

The specification described the user interface as optional. All three runs satisfied the shared library behavior, but none delivered a playable version of the game.

That result raised a more focused question: what would change if a working interface became mandatory? For the [second Hangman experiment](https://github.com/renanfranca/seed4j-cli-hangman-ui-kata), I kept the game rules and models, then changed the requirement in both the specification and the prompt:

> Implement the specification in SPEC.md. A functional user interface of your choice is a mandatory deliverable. Use the already-installed Seed4J CLI tool as support.

One mandatory deliverable looked like a small change. In practice, it added decisions about interaction, rendering, styling, application state and browser validation to the existing choices of language, build and tests.

## The controlled parts stayed controlled

Both experiments used Luna, Terra and Sol with `xhigh` reasoning effort. Every run started from its experiment's frozen base, received the same prompt as the other runs in that repository and used the same Seed4J skill, which was stored in the repository alongside the experiment.

The environment also stayed the same: Seed4J CLI 0.0.4, Seed4J runtime 2.2.0 and the same host. Each implementation was preserved on its own branch before evaluation.

This does not make the experiment large enough to describe how a model behaves in general. It does make the six resulting snapshots easier to compare.

## The single prompt was a stress test

One clarification matters here: this is not how I would recommend working with a coding agent. Each run received one implementation prompt. There was no later conversation to plan the work or provide architectural direction. That deliberately removed one of the most valuable parts of agent collaboration: discussing options before changing the repository.

I used that constraint as a stress test for the Seed4J CLI workflow. I wanted to observe how an agent would discover the active module catalog, choose capabilities and react to plan or environment feedback when the human provided almost no guidance beyond the specification. This setup describes what happened under low collaboration; it does not estimate how much Seed4J improved the result.

In a real project, I would plan with the agent first. The agent could inspect `seed4j list`, consult the help for relevant modules and use `apply-set --plan` to examine the proposed operations without changing the project. It could then turn the available capabilities into concrete questions. A valid Seed4J plan could have combined a Spring Boot backend and a Vue frontend, for example, before we refined boundaries, tests and interaction together.

So this experiment is not evidence that one prompt is enough. It asks a narrower question: what paths do agents take through Seed4J when the planning conversation is intentionally withheld?

## The common behavior survived the added freedom

All three library implementations passed the same ten functional requirements and three public contract checks. When the UI became mandatory, all three new implementations passed the shared domain harness and the complete browser journey, including correct, incorrect, invalid and duplicate guesses, followed by both winning and losing states.

The scores below come from the frozen rubric inside each repository. They include Seed4J usage, specification behavior, tests, design and reproducibility.

| Model | Library kata            | UI kata                                       | UI stack selected         |
| ----- | ----------------------- | --------------------------------------------- | ------------------------- |
| Luna  | Behavior passed, 84/100 | Domain and browser behavior passed, 89.99/100 | Spring Boot and Thymeleaf |
| Terra | Behavior passed, 97/100 | Domain and browser behavior passed, 99.06/100 | React and Vite            |
| Sol   | Behavior passed, 95/100 | Domain and browser behavior passed, 98.50/100 | React and Vite            |

The scores are not evidence that adding a UI improved any model. The two rubrics evaluate different scopes. What matters here is simpler: every implementation reached the shared behavioral target, while the engineering paths became much easier to see.

## One requirement, three products

Luna composed a Java application with Spring Boot and Thymeleaf. Terra and Sol both selected TypeScript, React and Vite, yet they still produced different layouts, game flows and visual identities.

The screenshots below show the real winning state from each preserved implementation. They are not mockups created for this post.

| Luna                                                                                                                                                                                                                                | Terra                                                                                                                                                                                                                       | Sol                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![Luna Spring Boot and Thymeleaf Hangman winning state](/img/what-changed-when-the-same-kata-needed-a-ui/luna-xhigh-won.png)](https://github.com/renanfranca/seed4j-cli-hangman-ui-kata/tree/main/evidence/screenshots/luna-xhigh) | [![Terra React and Vite Hangman winning state](/img/what-changed-when-the-same-kata-needed-a-ui/terra-xhigh-won.png)](https://github.com/renanfranca/seed4j-cli-hangman-ui-kata/tree/main/evidence/screenshots/terra-xhigh) | [![Sol React and Vite Hangman winning state](/img/what-changed-when-the-same-kata-needed-a-ui/sol-xhigh-won.png)](https://github.com/renanfranca/seed4j-cli-hangman-ui-kata/tree/main/evidence/screenshots/sol-xhigh) |

What interested me most was not the visual variation itself. It was that Seed4J CLI gave the agents a common way to discover, validate and apply different combinations of modules while they worked toward the same functional target. Luna used ten modules around Spring Boot and Thymeleaf; Terra and Sol used four around TypeScript and React. The resulting products were not identical, but all three passed the shared domain checks and the complete browser journey.

## Seed4J made those choices inspectable

In every run, Codex first discovered the active CLI and module catalog, inspected relevant module help and produced a plan for inspection before applying any changes.

For the library kata, that led to compact Java and Maven foundations. Luna selected `init` and `maven-java`. Terra added `maven-wrapper` after the environment showed that global Maven was unavailable. Sol also selected `approval-tests`, although its final tests did not use that capability.

The mandatory UI widened the available paths. The compositions recorded in the Seed4J history were:

- **Luna:** `init` → `maven-java` → `java-base` → `spring-boot` → `logs-spy` → `spring-boot-mvc-empty` → `spring-boot-thymeleaf` → `spring-boot-tomcat` → `thymeleaf-template`, followed by `maven-wrapper`.
- **Terra and Sol:** `init` → `prettier` → `typescript` → `react-core`.

The CLI validated dependencies and resolved module order, while each Codex run remained responsible for choosing the capabilities and implementing the game.

The plans also provided useful feedback. Luna corrected an invalid initial Spring composition before mutation. Sol recovered from a failed initialization hook and replanned the same React set. Those events remained visible in the transcripts and Seed4J history instead of disappearing behind the final screenshots.

## Reproducible does not have to mean identical

I did not learn that one stack is the correct way to build Hangman, or that one of these models will always make better choices. There was only one run per model, the runs were sequential, and there was no control group implementing the same tasks without Seed4J.

What I could observe was more useful to my current exploration: a deterministic tool can preserve dependencies, plans, parameters, module history and commits without forcing every agent toward the same product.

The behavior stayed comparable. The decisions stayed visible. The results still had room to be different.

That combination makes me want to keep using small katas as a training ground for larger applications. If you want to inspect the evidence rather than only the finished interfaces, both repositories include the prompts, preserved branches, transcripts, scorecards and reproduction notes.

If this experiment made you curious about the approach, consider giving [Seed4J](https://github.com/seed4j/seed4j) and [Seed4J CLI](https://github.com/seed4j/seed4j-cli) a star 🌟 on GitHub. It helps more people discover the projects and follow their evolution.

## References

- [Seed4J](https://seed4j.com/)
- [Seed4J CLI](https://github.com/seed4j/seed4j-cli)
- [Seed4J CLI Hangman Kata](https://github.com/renanfranca/seed4j-cli-hangman-kata)
- [Seed4J CLI Hangman UI Kata](https://github.com/renanfranca/seed4j-cli-hangman-ui-kata)
