---
layout: post
title: What Six Codex Runs Taught Me About Tool Design
description: How six Codex runs followed different decision paths through the same Seed4J CLI, and why good agent tools may need to constrain variability rather than eliminate it.
date: 2026-09-06 16:40:00 -0300
tags: seed4j
image: img/postbanners/2026-09-06-cover-what-six-codex-runs-taught-me-about-tool-design.jpg
permalink: /:categories/:title:output_ext
---

![cover image](https://renanfranca.github.io/img/postbanners/2026-09-06-cover-what-six-codex-runs-taught-me-about-tool-design.jpg)

## The score was not the most interesting result

In [From an Empty Repository to a Java Kata, One Module at a Time](https://renanfranca.github.io/from-an-empty-repository-to-a-java-kata-one-module-at-a-time.html), I followed one Codex run as it discovered Seed4J CLI, selected modules, planned their composition and built the foundation for a String Calculator kata.

That post follows the Sol `xhigh` run. I had already repeated the same task with six model and reasoning effort configurations, but I kept the comparison in the background so I could focus on one complete execution.

When I returned to the six runs, the comparison changed what I thought the experiment was about.

The detailed evaluation gives Sol `xhigh` 98 points, Luna `xhigh` 95 and Terra `xhigh` 91. Those scores are useful for comparing the resulting artifacts against one rubric. But they compress something I now find more interesting: all three implementations satisfy the required behavior, while the runs reach that result through visibly different paths.

The kata stopped being the main object of the experiment.

The way each run used the same tool became the object.

## What I mean by a decision trajectory

I am not trying to infer the model's private reasoning. The transcripts do not expose it, and I do not need it for this comparison.

There is already a lot I can observe:

- which commands a run executes before changing the repository;
- which modules it inspects as candidates;
- which inspected modules it leaves out;
- whether it creates one complete plan or several smaller plans;
- how tool or environment feedback changes the next action;
- which capabilities it delegates to Seed4J;
- what it verifies after generation.

I think of that visible sequence as a decision trajectory.

The experiment contained six independent Codex runs. Codex was the coding agent. Sol, Terra and Luna were the models selected for those runs, and `low`, `medium`, `high` and `xhigh` were reasoning effort configurations. Four runs used Sol at different effort levels; the other two used Terra and Luna at `xhigh`.

Every run started from the same commit and specification, received the same short prompt in Brazilian Portuguese, and used Seed4J CLI v0.0.4 with Seed4J 2.2.0. All six discovered the active runtime, generated a read-only plan before applying modules, retained a Maven Wrapper and left a project that passed both its native build and the same external functional validation.

The shared result makes the differences in the paths easier to see.

## Three paths through the same CLI

The three `xhigh` runs provide the cleanest narrative comparison because the reasoning effort stays fixed while the selected model changes.

### Sol xhigh anticipated the foundation

The Sol `xhigh` run inspected `init`, `maven-java`, `maven-wrapper` and `jacoco-with-min-coverage-check`, then placed all four modules into one `apply-set` plan.

Its visible trajectory looked roughly like this:

```text
goal → candidate capabilities → one composition → plan → execution
```

This run anticipated that the project should have its own Maven launcher and an enforced coverage gate before attempting the kata implementation.

It also exposed an important division of responsibility. The run requested the modules in this order:

```text
init
maven-java
maven-wrapper
jacoco-with-min-coverage-check
```

Seed4J executed them in this order:

```text
init
maven-java
jacoco-with-min-coverage-check
maven-wrapper
```

The run chose the capabilities. Seed4J validated the composition and resolved how to materialize it.

### Terra xhigh adapted to feedback

The Terra `xhigh` run began with a smaller composition: `init` and `maven-java`. It planned those modules, applied them and inspected the generated project.

Then it tried to use the global Maven command. The environment returned `mvn: command not found`.

The next visible message said:

> The environment has Java 25, but does not have `mvn`.

That sentence is my English translation of the original Brazilian Portuguese message in the [Terra transcript](https://github.com/renanfranca/seed4j-cli-string-calculator-kata/blob/9001fe863565408ac3c9622b3b9e7e3edb7786f6/CONVERSATION_TRANSCRIPT.md).

The run then inspected `maven-wrapper`, generated an individual plan, applied the module and continued through `./mvnw`.

Its trajectory was different:

```text
initial composition → environment feedback → new capability → plan → execution
```

Calling this merely a mistake would hide the useful part. In this run, a missing environmental capability produced feedback, and that feedback changed the composition. The final project still recorded the wrapper through the same Seed4J history and commit mechanism.

### Luna xhigh explored and kept the scaffold small

The Luna `xhigh` run inspected a broader group of candidates. In addition to `init`, `maven-java` and `apply-set`, it inspected `java-base` and `spring-boot`.

After that exploration, its visible message stated that the specification required incremental TDD in Java but did not require a framework or application structure. The run chose a minimal Maven project with JUnit 5 and left `java-base` and `spring-boot` out of the composition.

It later inspected `maven-wrapper` and planned the final set:

```text
candidate exploration → minimal boundary → composition → plan → execution
```

This is not evidence that Luna generally explores more or that it is inherently more disciplined about scope. It is evidence that this particular run inspected two plausible capabilities and did not apply them.

## The other runs left signals too

The remaining Sol runs reinforce the point that a score or final file tree does not describe the complete interaction.

| Run         | Candidate signal                                                 | Initial applied set                        | Later change                                         |
| ----------- | ---------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------- |
| Sol low     | Inspected `jqwik`, but did not select it                         | `init`, `maven-java`, `maven-wrapper`      | None                                                 |
| Sol medium  | Inspected `checkstyle`, but did not select it                    | `init`, `maven-java`, JaCoCo gate, wrapper | None                                                 |
| Sol high    | Inspected the four modules it selected                           | `init`, `maven-java`, JaCoCo gate, wrapper | None                                                 |
| Sol xhigh   | Inspected the four modules it selected                           | `init`, `maven-java`, wrapper, JaCoCo gate | Seed4J changed the effective peer order              |
| Terra xhigh | Did not inspect the wrapper before the initial application       | `init`, `maven-java`                       | Added the wrapper after global Maven was unavailable |
| Luna xhigh  | Inspected `java-base` and `spring-boot`, but did not select them | `init`, `maven-java`, `maven-wrapper`      | None                                                 |

This table does not rank the trajectories. It gives me a vocabulary for comparing them: discovery breadth, candidate rejection, planning granularity, proactive composition, reaction to feedback and delegation to the tool.

## The skill constrained the protocol, not every decision

All six runs had the same repository-local [Seed4J CLI skill](https://github.com/renanfranca/seed4j-cli-string-calculator-kata/blob/38ebbcbfab95f5725b1c22b1d4701fb6222cab6b/.agents/skills/seed4j-cli/SKILL.md).

The skill defines an operating protocol:

1. discover the CLI, runtime and catalog;
2. infer candidate modules from the task;
3. inspect the active help for those modules;
4. plan before mutation;
5. execute the validated composition;
6. verify the generated result and Git state.

That protocol explains part of the consistency across the runs. Every one of them discovered the runtime and catalog. Every one produced a plan before applying modules. Every successful module left history and a commit.

But the skill did not prescribe the exact module set for the kata. It did not say that JaCoCo was mandatory. It did not tell the run whether to inspect Spring Boot, when to add the Maven Wrapper or whether to construct one large plan.

That left a meaningful decision surface for each run:

- the run selected the capabilities it wanted;
- the skill guided how to interact with the tool safely;
- Seed4J validated dependencies and parameters, calculated execution order, changed files, updated module history and created commits.

This separation is more interesting to me than trying to put every correct decision into the skill.

## The tool reduced the space of decisions that had to be right

Without a project generator, a coding run building the same foundation might need to choose Maven plugin versions, write the POM, create the wrapper, configure JaCoCo, place files correctly, preserve project history and decide how to divide infrastructure changes into commits.

With Seed4J, the request can be closer to a set of capabilities:

```text
Java with Maven
Maven Wrapper
coverage gate
```

The tool then turns that explicit intent into deterministic transformations.

This does not make module selection irrelevant. A run can still omit a useful capability, add one the task does not need or choose parameters poorly. Seed4J also cannot guarantee that the kata implementation itself will be well designed.

What it can do is narrow the area in which those choices operate. Once a valid capability is selected, the run does not also need to reproduce all of the low-level configuration behind it from memory.

The models can take different routes through discovery and planning without every difference becoming a different manually written build configuration.

## This connects to how I think about skills and loops

In [When Skill Evolution Means Removing Instructions](https://renanfranca.github.io/when-skill-evolution-means-removing-instructions.html), I argued that deterministic knowledge should move into deterministic mechanisms whenever possible. A skill can become smaller when a test, hook or tool can enforce what used to depend on an instruction.

In [I Had Already Built Three Agentic Loops Without Naming Them](https://renanfranca.github.io/i-had-already-built-three-agentic-loops.html), I described autonomy becoming safer when feedback and exit conditions live in the environment instead of depending on the model remembering them.

Seed4J gives me another concrete example of both ideas.

The skill does not contain a static catalog or teach the model how to write every generated file. It sends the run to the active CLI. The plan provides feedback before mutation. The runtime validates the composition. The module history and Git commits make the result inspectable afterward.

The model still decides. But it decides inside a workflow with explicit feedback and deterministic boundaries.

## What this experiment does not show

This was one kata, one prompt, one host and one run per model and effort configuration. The runs were sequential, so later executions may have benefited from warmer caches. Their transcript formats and omission policies also differ, which limits direct comparisons of presentation and completeness.

There was no control group implementing the kata without Seed4J. I therefore cannot claim that Seed4J made the runs faster, cheaper or more correct than another approach.

Most importantly, these trajectories do not establish stable model personalities. I can say that the Terra `xhigh` run added the wrapper reactively. I cannot conclude from one run that Terra is a reactive model. I can say that the Sol `xhigh` run anticipated the coverage gate. I cannot conclude that Sol always plans infrastructure better.

The [detailed experiment report](https://github.com/renanfranca/seed4j-cli-string-calculator-kata/blob/main/MODEL_EVALUATION.md) keeps the full protocol, commands, scores and limitations.

## A principle I want to test again

These six runs do not prove a general rule about agent tools. They make one design principle concrete enough for me to keep testing.

Different runs can explore different candidates, compose at different moments and react differently to feedback. A tool does not necessarily need to normalize all of that behavior. It can preserve room for judgment while making dependencies, ordering, parameter resolution, history and mutation more predictable.

> A good agent tool may not need to eliminate model variability. It may need to constrain where that variability can cause damage.

## References

- [Seed4J](https://seed4j.com/)
- [Seed4J CLI](https://github.com/seed4j/seed4j-cli)
- [Seed4J CLI String Calculator Kata](https://github.com/renanfranca/seed4j-cli-string-calculator-kata/)
- [Detailed experiment report](https://github.com/renanfranca/seed4j-cli-string-calculator-kata/blob/main/MODEL_EVALUATION.md)
- [Sol xhigh transcript](https://github.com/renanfranca/seed4j-cli-string-calculator-kata/blob/3d179c56b288f0fcbc0c62ee94b5af3152887136/AUDITORIA-CONVERSA.md)
- [Terra xhigh transcript](https://github.com/renanfranca/seed4j-cli-string-calculator-kata/blob/9001fe863565408ac3c9622b3b9e7e3edb7786f6/CONVERSATION_TRANSCRIPT.md)
- [Luna xhigh transcript](https://github.com/renanfranca/seed4j-cli-string-calculator-kata/blob/7ad4d48b311ff664c2f8e4b012151513cad15916/CONVERSATION_TRANSCRIPT.md)
- [OpenAI model catalog](https://developers.openai.com/api/docs/models)
