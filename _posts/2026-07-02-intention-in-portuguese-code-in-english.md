---
layout: post
title: Intention in Portuguese, Code in English
description: How I started talking to Codex CLI in Portuguese while keeping open-source code, documentation, and project conventions in English.
date: 2026-07-02 19:00:00 -0300
tags: tales-of-a-dev
image: img/postbanners/2026-07-02-cover-intention-in-portuguese-code-in-english.jpg
permalink: /:categories/:title:output_ext
---

![cover image](https://renanfranca.github.io/img/postbanners/2026-07-02-cover-intention-in-portuguese-code-in-english.jpg)

## From English prompts to Portuguese intention

I am Brazilian, and my native language is Portuguese.

Since the launch of ChatGPT, I got used to interacting with it in English. At the time, it was not just a preference. I clearly felt that the responses were better, and it also made my work easier when I wanted to generate code, documentation, method names, tests, and examples for my open-source projects.

Because most of the projects I contribute to use English as the standard language, using English with the AI felt natural.

But something changed.

Today, when I use Codex CLI for programming, I talk to it almost exclusively in Portuguese.

Even when the repository is in English.

Even when the documentation is in English.

Even when the generated code must follow English naming conventions.

And this still feels a little amazing to me.

## Talking informally to the agent

The interesting part is not only the language itself.

The interesting part is how informal the interaction became.

When I am working on a feature, I usually talk to the AI agent in Portuguese, in a very natural way. I describe what I want, what I am worried about, what I think should be done first, and sometimes what I do not want it to do.

In many cases, before implementing the feature, the agent creates a Markdown document with the implementation steps.

That document is also written in Portuguese. 😀

[Later, I want to share more details about how I usually get that document created, because this small step has become an important part of my workflow.](https://renanfranca.github.io/when-plan-mode-was-no-longer-enough.html)

But even with that planning document in Portuguese, the implementation itself remains aligned with the project.

Method names are in English.

Tests are in English.

Feature documentation is in English.

The code follows the repository language, not the language I used to describe my intention.

## The repository defines the language of the work

After looking more carefully at what makes this possible, my conclusion is simple:

I provide the intention in Portuguese.

Codex reads the repository.

It sees that [`AGENTS.md`](https://github.com/seed4j/seed4j-cli/blob/main/AGENTS.md) is entirely in English.

It understands that the project is standardized in English.

Then it applies my request using the language of the project.

That means the agent is not just translating my words directly into files. It is reading the surrounding context and adapting the output to the conventions that already exist there.

This is the part that I find fascinating.

The conversation can happen in one language, while the work product follows another language.

The [seed4j-cli](https://github.com/seed4j/seed4j-cli) is the project I am working on, where I have experienced everything I mentioned 😀

## Intention is not implementation

This made me think about the difference between intention and implementation.

When I talk to the agent in Portuguese, I am not asking it to make the project Portuguese.

I am using my native language to express intent with more precision, less friction, and more comfort.

The repository still has its own language.

The code still has its own conventions.

The documentation still has its own audience.

The agent becomes the bridge between those layers.

And maybe this is one of the reasons why working with AI agents feels different from only asking a chatbot to generate snippets. The agent is not only answering a question. It is operating inside a context.

## Why this matters to me

For a long time, I associated “better AI results” with “using English.”

That still may be true in many situations.

But with an agent working inside a repository, the situation becomes more nuanced.

The quality of the result does not depend only on the language of the prompt. It also depends on the quality of the repository context, the project conventions, the instructions, the tests, and the way the agent is asked to reason before changing code.

This is a very different experience.

I can think in Portuguese.

I can explain the intention in Portuguese.

I can ask questions in Portuguese.

But the final result can still respect an English-based open-source project.

That feels like a small but important shift in how I work.

## A question for other developers

I am still experimenting with this, but I am curious if other people are doing something similar.

Do you interact with an AI agent in a language other than English, even when the project itself uses English as its standard language?

And if you do, does the agent preserve the project language well?

I would love to hear how other developers are handling this.
