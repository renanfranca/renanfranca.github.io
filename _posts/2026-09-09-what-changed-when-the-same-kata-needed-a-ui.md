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

## The shared behavior is the baseline

All six implementations passed their shared functional checks. That matters here only as a baseline: the Seed4J paths are being compared among implementations that reached the required behavior. The behavior score itself is not the subject of this article.

The [library kata report](https://github.com/renanfranca/seed4j-cli-hangman-kata/blob/main/MODEL_EVALUATION.md) and the [UI kata report](https://github.com/renanfranca/seed4j-cli-hangman-ui-kata/blob/main/MODEL_EVALUATION.md) use complete rubrics with a total of 100 points that also evaluate specification correctness, tests and design. For this comparison, the relevant slice is the Seed4J effectiveness category, worth 35 points:

| Model | Library kata: Seed4J /35 | UI kata: Seed4J /35 |
| ----- | -----------------------: | ------------------: |
| Luna  |                       32 |                  33 |
| Terra |                       35 |                  35 |
| Sol   |                       33 |                  34 |

Those 35 points cover discovery and help, preflight and planning, module choice and order, explicit parameters, history and wrapper usage. The deductions show what the totals summarize:

- **Luna:** In the library kata, the project had no wrapper, costing three points. In the UI kata, the unnecessary `logs-spy` module cost one point, and the `maven-wrapper` commit also included handwritten implementation files, costing another point for commit coherence.
- **Terra:** Both runs earned 35/35 through explicit parameters, valid compositions, appropriate wrappers and coherent module histories.
- **Sol:** In the library kata, selecting `approval-tests` without using it in the final tests cost two points. In the UI kata, the failed application and retry left two `init` history records, costing one point for commit coherence.

These scores do not rank the overall quality of the models or products. They summarize only the observable use of Seed4J CLI and lead into the module choices, commands and feedback below.

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

The mandatory UI widened the available paths. The commands below preserve the arguments and values from the recorded runs, with line breaks added for readability.

### Luna corrected the composition before applying it

Luna's [first plan](https://github.com/renanfranca/seed4j-cli-hangman-ui-kata/blob/4e7a814af62f67bf90120a45516c142da38d543a/CONVERSATION_TRANSCRIPT.md) requested five Spring and Java modules:

```bash
seed4j apply-set \
  maven-java \
  spring-boot \
  spring-boot-tomcat \
  spring-boot-thymeleaf \
  thymeleaf-template \
  --plan \
  --base-name=hangman \
  --project-name='Hangman UI Kata' \
  --package-name=com.example.hangman \
  --server-port=8080 \
  --spring-configuration-format=properties \
  --node-package-manager=npm \
  --indent-size=2 \
  --end-of-line=lf
```

Seed4J rejected the composition without changing the repository:

```text
Preflight: INVALID
Missing modules: init, java-base, logs-spy, spring-boot-mvc-empty
Unused option: --end-of-line
No changes were applied.
```

Luna added the required modules explicitly, removed the unused option and planned again:

```bash
seed4j apply-set \
  init \
  maven-java \
  java-base \
  spring-boot \
  spring-boot-mvc-empty \
  spring-boot-tomcat \
  logs-spy \
  spring-boot-thymeleaf \
  thymeleaf-template \
  --plan \
  --base-name=hangman \
  --project-name='Hangman UI Kata' \
  --package-name=com.example.hangman \
  --server-port=8080 \
  --spring-configuration-format=properties \
  --node-package-manager=npm \
  --indent-size=2
```

This time the preflight was valid. Seed4J resolved the order as `init` → `maven-java` → `java-base` → `spring-boot` → `logs-spy` → `spring-boot-mvc-empty` → `spring-boot-thymeleaf` → `spring-boot-tomcat` → `thymeleaf-template`. Luna applied the same command without `--plan`, then later planned and applied `maven-wrapper`.

### Terra applied a valid composition directly

Terra's [complete plan](https://github.com/renanfranca/seed4j-cli-hangman-ui-kata/blob/428db51ed018f1f2e520dfd30fe0b9a38ca67523/CONVERSATION_TRANSCRIPT.md) was valid on the first attempt:

```bash
seed4j apply-set \
  init \
  prettier \
  typescript \
  react-core \
  --plan \
  --base-name hangmanui \
  --project-name 'Hangman UI' \
  --node-package-manager npm \
  --end-of-line lf \
  --indent-size 2 \
  --project-path .
```

```text
Preflight: VALID
Execution order: init → prettier → typescript → react-core
No changes were applied.
```

Terra applied the same modules and parameters by running the command again without `--plan`.

### Sol recovered after a partial application

Sol's [initial plan](https://github.com/renanfranca/seed4j-cli-hangman-ui-kata/blob/96e4cc13f2ee260921dccbc7f8abbe0a6d7703f7/CONVERSATION_TRANSCRIPT.md) was also valid:

```bash
seed4j apply-set \
  init \
  prettier \
  typescript \
  react-core \
  --project-name 'Hangman UI Kata' \
  --base-name hangman \
  --node-package-manager npm \
  --indent-size 2 \
  --end-of-line lf \
  --project-path . \
  --plan
```

Sol then applied the same composition:

```bash
seed4j apply-set \
  init \
  prettier \
  typescript \
  react-core \
  --project-name 'Hangman UI Kata' \
  --base-name hangman \
  --node-package-manager npm \
  --indent-size 2 \
  --end-of-line lf \
  --project-path .
```

The generated commit hook could not find `lint-staged` while applying `init`. Seed4J stopped the sequence instead of invoking the remaining modules:

```text
init: FAILED
prettier: SKIPPED
typescript: SKIPPED
react-core: SKIPPED
Module set status: PARTIAL_FAILURE
```

After inspecting the partial output and Seed4J history, Sol installed the dependencies, planned again and reapplied the same set:

```bash
npm install

seed4j apply-set \
  init \
  prettier \
  typescript \
  react-core \
  --project-name 'Hangman UI Kata' \
  --base-name hangman \
  --node-package-manager npm \
  --indent-size 2 \
  --end-of-line lf \
  --project-path . \
  --plan

seed4j apply-set \
  init \
  prettier \
  typescript \
  react-core \
  --project-name 'Hangman UI Kata' \
  --base-name hangman \
  --node-package-manager npm \
  --indent-size 2 \
  --end-of-line lf \
  --project-path .
```

These runs exposed two kinds of feedback. Seed4J rejected an invalid composition before mutation, and it stopped a module sequence after the first application failure. The CLI validated dependencies and resolved module order, while each Codex run remained responsible for choosing capabilities, reacting to feedback and implementing the game. The transcripts and Seed4J history preserved those adjustments instead of showing only the finished applications.

## The plan is where collaboration can begin

This experiment does not show that one stack is the correct way to build Hangman or that one model will always make better choices. There was only one run per model, the runs were sequential and there was no control group implementing the same tasks without Seed4J. The shared checks let me compare the required behavior; they do not show that Seed4J made the implementations more correct or caused their differences.

What the records do expose is a useful separation of responsibilities. The specification defined the behavior. Each Codex run chose an architecture and a set of modules, then implemented the game. Seed4J CLI turned the selected modules into an explicit plan containing dependencies, parameters and execution order before the repository changed. During application, it also recorded what happened to each module.

Luna showed why validation before mutation matters: Seed4J rejected an invalid composition and made the missing modules visible. Terra showed the direct path from a valid plan to application. Sol showed the limit of planning: a valid composition can still encounter an environment failure, but the CLI stopped the remaining modules and preserved the partial history.

In a real project, `apply-set --plan` can become the starting point for a conversation with the agent. A developer can question the architecture, replace modules or adjust parameters before approving the transformation. After application, the module history provides a record of the path that was actually taken.

The benefit is not that different architectures are automatically better. It is that architectural freedom becomes reviewable before execution and traceable afterward.

That is what I want to carry from these small katas into larger applications. The single prompt in this experiment deliberately withheld the planning conversation. In real work, the Seed4J plan can support that conversation instead of replacing it. If you want to inspect the evidence rather than only the finished interfaces, both repositories include the prompts, preserved branches, transcripts, scorecards and reproduction notes.

If this experiment made you curious about the approach, consider giving [Seed4J](https://github.com/seed4j/seed4j) and [Seed4J CLI](https://github.com/seed4j/seed4j-cli) a star 🌟 on GitHub. It helps more people discover the projects and follow their evolution.

## References

- [Seed4J](https://seed4j.com/)
- [Seed4J CLI](https://github.com/seed4j/seed4j-cli)
- [Seed4J CLI Hangman Kata](https://github.com/renanfranca/seed4j-cli-hangman-kata)
- [Seed4J CLI Hangman UI Kata](https://github.com/renanfranca/seed4j-cli-hangman-ui-kata)
