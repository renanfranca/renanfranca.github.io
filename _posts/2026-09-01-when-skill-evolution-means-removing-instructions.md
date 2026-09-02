---
layout: post
title: When Skill Evolution Means Removing Instructions
description: What ACES, WikiSkill, skill-eval, and my latest agent workflows taught me about evaluating skills, removing obsolete instructions, and moving knowledge into deterministic mechanisms.
date: 2026-09-01 22:24:00 -0300
tags: tales-of-a-dev
image: img/postbanners/2026-09-01-cover-when-skill-evolution-means-removing-instructions.jpg
permalink: /:categories/:title:output_ext
---

![cover image](https://renanfranca.github.io/img/postbanners/2026-09-01-cover-when-skill-evolution-means-removing-instructions.jpg)

## Two papers, one familiar question

I keep having this strange experience lately: I spend time experimenting with something in a very small, practical way, and then a paper appears exploring a remarkably similar question at a much larger scale.

Two recent papers made that happen again.

The first is [“Evaluating Skills, Not Just Agents”](https://arxiv.org/abs/2608.20614), which introduces ACES and Skill Lift: execute the same task with and without a skill and measure the difference.

That connects directly with what I was exploring in [skill-eval](https://github.com/renanfranca/skill-eval).

But my main takeaway from that experiment was actually about the limits of A/B testing.

An A/B comparison gives evidence for that particular model, task, context and harness. It does not prove that a skill is universally good. Change the model and the skill may become less useful, unnecessary, or even harmful.

## Knowledge does not have to become instructions

Then I read Google Research's [“WikiSkill: Compiling Agent Experience into Persistent Knowledge for Skill Evolution”](https://arxiv.org/abs/2608.27454).

And another piece clicked into place.

WikiSkill separates raw experience, accumulated knowledge and the actual executable skill. Experience can keep accumulating outside the skill, while proposed skill changes are validated before being promoted.

Even more interestingly, the paper shows cases where low-level workarounds learned for one model transfer poorly to a stronger model. Instructions that helped the weaker model could constrain the stronger one or cause redundant tool calls.

That is very close to another experiment I did inside [skill-eval](https://github.com/renanfranca/skill-eval).

## Evolving a skill by making it smaller

I tried to “evolve” my `implement-execplan` skill not by adding more instructions, but by removing them.

The original baseline had 228 lines. The adaptive version had 165.

Instead of requiring a large fixed plan structure and continuous updates, the newer version relies more on the model's own capabilities: fewer mandatory sections, conditional information only when useful, fewer plan updates and less routine bookkeeping.

The skill is here:

[implement-execplan/SKILL.md](https://github.com/renanfranca/codex-skills/blob/main/implement-execplan/SKILL.md)

And the case study is here:

[skill-eval: implement-execplan case study](https://github.com/renanfranca/skill-eval/tree/main/docs/case-studies/implement-execplan)

In the first valid comparison, both versions passed the same quality gates, while the smaller version used about 18% fewer candidate input + output tokens.

That is only one observation, not proof that the new version is universally better. The replication was incomplete, and I deliberately documented that limitation.

But it changed how I think about “skill evolution”.

Evolution does not necessarily mean accumulating more rules.

Sometimes the model improved and part of the harness became obsolete.

Sometimes something that used to require an instruction can become a deterministic test, hook or static check and disappear from the skill entirely.

This is also a continuation of something I noticed while gradually giving TDD to an agent. In [When I Entrusted TDD to an AI Agent](https://renanfranca.github.io/when-i-entrusted-tdd-to-an-ai-agent.html), some architectural guidance became much more reliable once it stopped being only an instruction and became executable feedback in the repository.

And sometimes a failure is worth remembering, but not yet worth turning into an instruction. This is where the WikiSkill separation between experience, persistent knowledge and executable skills makes a lot of sense to me.

## I prefer to discover the workflow first

This also changed how I create skills.

I prefer to experience the problem first, work with the model manually, adjust the workflow until I can make it work reliably, and only then consolidate what I learned into a skill.

My latest `implement-approved-plan` skill came from exactly that process:

[implement-approved-plan/SKILL.md](https://github.com/renanfranca/codex-skills/blob/main/implement-approved-plan/SKILL.md)

This one is interesting because the skill itself coordinates a multi-chat workflow inside ChatGPT Desktop.

A dedicated Coordinator keeps the approved plan and controls a set of specialized chats. Each role is created once and then reused throughout the implementation: an Implementer works through TDD, a Committer owns commits, a Validator runs the complete quality gates, a Habit Curator handles mechanically detected design findings, and an independent Structural Reviewer looks for design problems after the implementation is already green.

Conceptually, it looks roughly like this:

```text
Approved Plan
     ↓
Coordinator
     ↓
Implementer
     ↓
Coordinator
     ↓
Committer
     ↓
Coordinator
     ↓
Validator
     ↓
Coordinator
     ↓
Habit Curator
     ↓
Coordinator
     ↓
Structural Reviewer
     ↓
Final Validation
     ↓
PR + CI
     ↓
Ready for Merge
```

The interesting part for me is that these chats do not freely coordinate with each other. The Coordinator is the only one talking to the specialists, and access to the same working tree is serialized through a persistent workflow ledger.

That ledger works almost like a small state machine. It records the current phase, specialist chat IDs, commits, validation gates, Habit state, pull request and CI evidence. It rejects invalid transitions, concurrent ownership of the checkout, premature pull requests and cleanup before GitHub actually confirms that the PR was merged.

The shape is more elaborate than the three nested loops I described in [I Had Already Built Three Agentic Loops Without Naming Them](https://renanfranca.github.io/i-had-already-built-three-agentic-loops-without-naming-them.html), but the underlying idea feels similar: autonomy becomes safer when feedback and exit conditions live in the workflow instead of depending on the model remembering everything.

So the skill is not trying to make one giant agent smarter. It is encoding a workflow I had already been performing manually, while moving as much coordination and validation as possible into deterministic machinery around the model.

PR that introduced it:

[renanfranca/codex-skills#7](https://github.com/renanfranca/codex-skills/pull/7)

And instead of stopping when the `SKILL.md` looked good, I exercised the workflow against a public fixture and a real pull request:

[implement-approved-plan-fixture](https://github.com/renanfranca/implement-approved-plan-fixture)

[implement-approved-plan-fixture#2](https://github.com/renanfranca/implement-approved-plan-fixture/pull/2)

## My current mental model

So my current mental model is becoming something like this:

Experience the problem.

Make the workflow work manually.

Turn deterministic knowledge into deterministic mechanisms.

Keep uncertain experience outside the skill until it earns its place.

Add instructions only for what the model still needs.

And when the model changes, question those instructions again.

No magic skill. No assumption that more instructions mean a better agent.

Just a workflow that keeps adapting as both the model and my understanding of the problem change.