---
layout: post
title: From an Empty Repository to a Java Kata, One Module at a Time
description: Using the String Calculator kata as a small training ground to learn how a coding agent can discover and compose a Java project with Seed4J CLI.
date: 2026-09-04 16:28:00 -0300
tags: seed4j
image: img/postbanners/2026-09-04-cover-from-an-empty-repository-to-a-java-kata-one-module-at-a-time.jpg
permalink: /:categories/:title:output_ext
---

![cover image](https://renanfranca.github.io/img/postbanners/2026-09-04-cover-from-an-empty-repository-to-a-java-kata-one-module-at-a-time.jpg)

## A small project to learn Seed4J CLI

I wanted a small project to learn how to use Seed4J CLI, but with a slightly different constraint: I wanted to learn it the same way I expect to use it in real projects, together with a coding agent.

[Seed4J](https://seed4j.com/) is a modular code generator. Instead of generating one fixed project, it applies named transformations, called modules, that add or configure one capability at a time.

The Seed4J CLI makes that approach available from the command line. The repository also contains a project-local skill for the coding agent. That skill is a set of instructions that helps the agent discover and operate the CLI; it is not a Seed4J module.

So I created a repository around the classic String Calculator kata. It is a small testing exercise in which an `add` function starts with simple string inputs and gradually supports more rules, such as multiple numbers and custom delimiters.

The starting point is intentionally minimal: a specification for the kata and the Seed4J CLI skill installed locally for the agent.

The original prompt was written in Brazilian Portuguese:

> implement o kata utilizando o seed4j cli tool já instalado como apoio.

For readability, I translated it to English:

> Implement the kata using the already-installed Seed4J CLI tool as support.

From there, the agent has to inspect the active CLI and decide how to compose the project.

I later repeated the same task across six model and reasoning configurations. Their differences are documented in the detailed experiment report linked below. To keep this post focused, it follows the `string-calculator-sol-xhigh` run, which used the Sol model with `xhigh` reasoning effort.

## Let the agent discover the CLI

The agent starts by discovering the command-line client, the Seed4J version behind it, and the modules available to it:

    seed4j --version && seed4j --help
    seed4j list

The command-line client and the Seed4J generator it invokes are versioned separately. This run used Seed4J CLI v0.0.4 with Seed4J 2.2.0.

From the available modules, the agent identifies four capabilities that seem useful and inspects their parameters:

    seed4j apply-set --help
    seed4j apply init --help
    seed4j apply maven-java --help
    seed4j apply maven-wrapper --help
    seed4j apply jacoco-with-min-coverage-check --help

The module names describe four separate transformations:

- `init` establishes the common project foundation: project metadata, repository conventions, development tooling, and a record of the Seed4J modules applied. It does not create the Java application.
- `maven-java` adds the Java and Maven build, including the testing dependencies.
- `maven-wrapper` adds a project-local Maven launcher, so the build does not depend on a separately installed Maven version.
- `jacoco-with-min-coverage-check` turns code coverage into a build requirement.

The `apply-set` command composes several modules and resolves a valid execution order. Before changing the repository, the agent uses `--plan` to preview the resolved modules and parameters without applying them:

    seed4j apply-set init maven-java maven-wrapper jacoco-with-min-coverage-check --plan --project-path . --project-name 'String Calculator Kata' --base-name stringCalculator --package-name com.renanfranca.stringcalculator --node-package-manager npm --end-of-line lf --indent-size 2

The plan is valid and Seed4J resolves the execution order as:

    init
    maven-java
    jacoco-with-min-coverage-check
    maven-wrapper

Notice that this is not exactly the order requested by the agent. It asked for `maven-wrapper` before `jacoco-with-min-coverage-check`, but Seed4J resolved the effective order from the module dependencies.

After reviewing the plan, the agent applies exactly the same composition without `--plan`.

Seed4J applies the modules sequentially and creates one commit for each successful module.

Once Seed4J finishes, the repository has a common project foundation, a Java 25 Maven build with testing libraries, an enforced coverage threshold, and a project-local Maven launcher. Seed4J stops at that foundation; it does not generate the String Calculator. From there, the agent writes the kata in one production class and one test class. Running `./mvnw verify` executes 13 behavior tests and enforces 100% line and branch coverage with JaCoCo.

What interested me was not the generated files alone. It was watching the agent discover the available capabilities, select the modules it needed, and let Seed4J resolve and record the composition one module at a time.

## The kata is not the thing I am trying to learn

I chose a familiar kata precisely because its implementation was not the variable I wanted to study. It gives me a small, controlled problem where I can watch an AI agent discover Seed4J, choose modules, inspect their parameters, preview the resulting composition, and use those modules to turn an almost empty repository into a Java project.

Instead of asking the agent to manually recreate all the project setup, I can watch it decide which capabilities it needs and let Seed4J apply the corresponding transformations.

The repository records this experiment, including the commands executed by the agents, the modules they selected, the resulting projects, and their Seed4J module history.

What I can observe here is how the agents use Seed4J under this setup. Because every run uses Seed4J, this experiment does not tell me whether Seed4J makes an agent faster, cheaper, or better than another scaffolding approach.

## A small training ground

For me, this makes the kata a small training ground for a larger question: how should I use Seed4J together with AI coding agents in real projects?

I do not think this kata answers that question. It gives me a controlled place to observe the interaction, learn what information the agent needs, and make the next experiment more concrete.

## Reproduction note

I used Codex in the ChatGPT desktop app with Full Access enabled so Seed4J could write its per-module commits to `.git` without approval interruptions. In Codex CLI, the equivalent is running `codex --yolo`. Because that bypasses approvals and sandboxing, it should only be used in a controlled or externally isolated environment.

## References

- [Seed4J](https://seed4j.com/)
- [Seed4J CLI](https://github.com/seed4j/seed4j-cli)
- [Seed4J CLI String Calculator Kata](https://github.com/renanfranca/seed4j-cli-string-calculator-kata/)
- [Sol xhigh implementation](https://github.com/renanfranca/seed4j-cli-string-calculator-kata/tree/string-calculator-sol-xhigh)
- [Detailed experiment report](https://github.com/renanfranca/seed4j-cli-string-calculator-kata/blob/main/MODEL_EVALUATION.md)
- [Codex sandbox and permissions](https://learn.chatgpt.com/docs/sandboxing)
