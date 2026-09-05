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

So I created a repository around the classic String Calculator kata. The starting point is intentionally minimal: a specification for the kata and the Seed4J CLI skill installed locally for the agent.

The original prompt was written in Brazilian Portuguese:

> implement o kata utilizando o seed4j cli tool já instalado como apoio.

For readability, I translated it to English:

> Implement the kata using the already-installed Seed4J CLI tool as support.

From there, the agent has to inspect the active CLI and decide how to compose the project.

## Let the agent discover the CLI

In the `Sol xhigh` run, the agent starts by discovering the CLI and its active runtime:

    seed4j --version && seed4j --help
    seed4j list

At the time of this experiment, that reported Seed4J CLI v0.0.4 with Seed4J 2.2.0 as the active runtime.

Then it investigates the command for applying a module set and the modules that seem useful:

    seed4j apply-set --help
    seed4j apply init --help
    seed4j apply maven-java --help
    seed4j apply maven-wrapper --help
    seed4j apply jacoco-with-min-coverage-check --help

Before changing the repository, it asks Seed4J to plan the complete composition:

    seed4j apply-set init maven-java maven-wrapper jacoco-with-min-coverage-check --plan --project-path . --project-name 'String Calculator Kata' --base-name stringCalculator --package-name com.renanfranca.stringcalculator --node-package-manager npm --end-of-line lf --indent-size 2

The plan is valid and Seed4J resolves the execution order as:

    init
    maven-java
    jacoco-with-min-coverage-check
    maven-wrapper

Notice that this is not exactly the order requested by the agent. It asked for `maven-wrapper` before `jacoco-with-min-coverage-check`, but Seed4J resolved the effective order from the module dependencies.

The agent then applies exactly the same composition without `--plan`:

    seed4j apply-set init maven-java maven-wrapper jacoco-with-min-coverage-check --project-path . --project-name 'String Calculator Kata' --base-name stringCalculator --package-name com.renanfranca.stringcalculator --node-package-manager npm --end-of-line lf --indent-size 2

Seed4J applies the modules sequentially and creates one commit for each successful module.

This is what made the kata interesting to me.

## The kata is not the thing I am trying to learn

The String Calculator itself is intentionally familiar. The goal is not to learn the kata. It is to have a small, controlled problem where I can watch an AI agent discover Seed4J, choose modules, inspect their parameters, preview the resulting composition, and use those modules to turn an almost empty repository into a Java project.

Seed4J is designed to build a project incrementally, applying only what is needed. In this experiment, instead of asking the agent to manually recreate all the project setup, the agent can decide which capabilities it needs and let Seed4J apply the known transformations.

The repository records this experiment, including the commands executed by the agents, the modules they selected, the resulting projects, and their Seed4J module history.

The runs did not all choose the same modules or follow the same sequence. I later repeated the task across six model and reasoning configurations, and that variation became part of the experiment. The commands above are specifically from the `string-calculator-sol-xhigh` run.

What I can observe here is how the agents use Seed4J under this setup. Because every run uses Seed4J, this experiment does not tell me whether Seed4J makes an agent faster, cheaper, or better than another scaffolding approach.

## A small training ground

For me, this makes the kata a small training ground for a larger question: how should I use Seed4J together with AI coding agents in real projects?

I do not think this kata answers that question. It gives me a controlled place to observe the interaction, learn what information the agent needs, and make the next experiment more concrete.

## References

- [Seed4J](https://seed4j.com/)
- [Seed4J CLI](https://github.com/seed4j/seed4j-cli)
- [Seed4J CLI String Calculator Kata](https://github.com/renanfranca/seed4j-cli-string-calculator-kata/)
- [Sol xhigh implementation](https://github.com/renanfranca/seed4j-cli-string-calculator-kata/tree/string-calculator-sol-xhigh)
- [Detailed experiment report](https://github.com/renanfranca/seed4j-cli-string-calculator-kata/blob/main/MODEL_EVALUATION.md)
