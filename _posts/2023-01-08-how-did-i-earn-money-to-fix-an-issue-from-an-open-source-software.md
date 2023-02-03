---
layout: post
title: How did I earn money to fix an issue from an Open Source Software (OSS)
description: I am going to share my approach and my own experience and opinion about fixing a bounty issue from the jhipster-lite Open Source Software (OSS)
date: 2023-01-08 05:18:48 -0300
tags: jhipster, jhipster-lite
image: 
permalink: /:categories/:title:output_ext
draft: true

---

I am going to share my approach and my own experience and opinion about fixing a bounty issue from the [jhipster-lite Open Source Software (OSS)](https://github.com/jhipster/jhipster-lite).

## Wich issue to choose

I got stuck for a long time because I couldn't decide which issue I should fix and I didn't have much time to spend fixing an issue. I could only be coding while my baby girl was sleeping.

At first, I created [an issue to fix](https://github.com/jhipster/jhipster-lite/issues/4401) because I was afraid to fail to fix an existing issue. Then I realized that isn't a good idea to implement a front-end feature because my strength is back-end code using spring boot!

After some time, I decided to join together my goal to help the jhipster-lite (jhlite) project by solving an issue with my need to earn money beyond my paycheck. So I started to read the [bounty issues list](https://github.com/jhipster/jhipster-lite/labels/%24%24%20bug-bounty%20%24%24), looking for an issue that demands only backend skills to fix.

In the end, I decided to try to fix this issue: [Add the possibility to comment spring properties in modules
](https://github.com/jhipster/jhipster-lite/issues/2106).

## How should I start to fix an issue?

I started to read the closed issues to understand and look for answers to my questions:

- How an issue was assigned to someone?
- Should I ask for permission to fix it before I start to try to fix it?
- What happens if someone was try to fix the same issue and both didn't ask for permission?

I found all these answers in the [bounty issue instructions](https://www.jhipster.tech/bug-bounties/#how-to-get-the-money):
>
> - Create a Pull Request that fixes a ticket with the `$$ bug-bounty $$` label.
> - In order to close the ticket automatically, you must have one commit message with the `Fix` keyword. For example, `Fix #1234` to close ticket `#1234`.
> - That Pull Request must be merged by someone from the core team. If there are several Pull Requests, the core team member either selects the most recent one or the best one - that’s up to the team member to decide what is best for the project.

In addition, I realized that I was afraid of getting my attempt to fix declined by the reviewer. So I decided to walk over my fear and try to fix and create a pull request as fast as possible to gather feedback (positive or negative) from the reviewer.

## What did help me to fix the issue?

Here I will try to share some of my abilities and background knowledge which gives me the confidence to keep up coding until the issue got merged 😄!

### Learn about the jhipster-lite project

In my case, I need to understand the project to be motivated to contribute to it. Below, I will list some interesting resources to fall in love with jhlite 😊.

- [What is JHipster Lite?](https://www.jhipster.tech/jhipster-lite/)
- Read everything at the jhipster-lite [contributing guide](https://github.com/jhipster/jhipster-lite/blob/main/CONTRIBUTING.md)
- [What is JHipster Lite and why should you care?](https://www.youtube.com/watch?v=dTzGQNOKWug) by [Julien Dubois](https://twitter.com/juliendubois)
  - Excelente content showing how to use jhipster-lite and Julien will guide you through jhlite options. In the end, you will create the demo project and could explore it by yourself! That was so cool!
- [How to contribute to JHipster](https://www.youtube.com/watch?v=O-P58uCWrfI) by [Anthony Viard](https://twitter.com/avdev4j) and [Sohini Pattanayak](https://twitter.com/TheSohini)
  - I learn a lot of tricks with this video which covers how to contribute to jhipster-lite, for example, name my branch using the GitHub issue number `2106-add-comment-spring-properties-in-modules`.
- [Simple WebServices with JHipster Lite](https://www.youtube.com/watch?v=mEECPRZjajI) by [Colin Damon](https://www.linkedin.com/in/colin-damon/)
  - Here you will learn how jhipster lite could be your best friend in coding! This great demo was made by the reviewer of my pull request. "Hi! Colin 👋!".

### Study Hexagonal Architecture

- [Hexagonal architecture (application service flavor)](https://github.com/jhipster/jhipster-lite/blob/main/documentation/hexagonal-architecture.md)
- I cloned the jhipster-lite project and run it in debug mode to learn more about the code base which I am going to change.
- Then I realized that a better approach is to run the implemented tests in debug mode. The test works as a documentation of the functionalities.

### Affinity and joy in implementing Tests

I believe that implementing tests is the way to build great software. The jhipster-lite project is configured to accept only 100% test coverage code. So any change made in this project needs to be tested!

The test code should be as good as the production code, that's not a trivial task. In my opinion, the jhlite project has a high-quality code base and I had to do my best to implement a feature with the best code I could make.

### Know in advance some technologies

- Maven
- Java
  - Jacoco
  - Cucumber
  - JUnit
- Spring Boot
- VS Code
- Prettier
- Sonar
- Git (especially rebase commands)
- GitHub (Actions (CI), Fork, Issues, and Create Pull Request)

## My workflow

I will share my workflow which I used to fix, improve, and refactor the code each time my pull request was reviewed.

### Before pushing my changes to be reviewed

Here is the script I used to keep my branch up to date with the latest version of the jhipster-lite main branch.

```shell
git switch main
git fetch upstream
git rebase upstream/main
git push
git switch <my-branch-name>
git rebase origin/main
npm run prettier:format
```

Then I run the sonar after I finished coding.

```shell
docker compose -f src/main/docker/sonar.yml up -d
./mvnw clean verify sonar:sonar
```

So you can check the result at `http://localhost:9001` to see if you match the 100% code coverage or if you need to fix any code smells.

### Keep the pull request reviewer informed

Every time I pushed some changes I let the reviewer know and I always answers each code review he made.

I preferred to push the changes even though I didn't fully understand what the review wants because in my experience is easier to talk about an implemented code than a hypothetical one.

There is a [Contributor Covenant Code of Conduct](https://github.com/jhipster/jhipster-lite/blob/main/CODE_OF_CONDUCT.md)
> In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to making participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

In my own experience as a contributor, I can say that everyone who I interacted with was kind and genuinely wants the best for the project. I felt that they appreciate my effort to fix an issue and they were cheering me up!

## What was the outcome of this experience?

I am a Windows user, but I am migrating to use Linux (Ubuntu) through wsl 2 because It is faster. On windows took me 5 minutes and 20 seconds to run the command `./mvnw clean verify sonar:sonar`. On Linux, the same command took me 2 minutes and 30 seconds. I found this great YouTube video [How To Run Linux Code on Windows with WSL 2 & VS Code](https://youtu.be/bRW5r7TK6KM) which taught me how to use Linux for coding inside Windows. In addition, my developer experience was lighter and smoothly with VS Code running under Linux.

I enjoyed working on the jhlite project without being pressured and asynchronously! I could code when I have the time on my own passe 👏!

I realized that I am not an expert in the TDD field, I have so much to learn. Here is an interesting article that opens my eyes [The Real Reasons for Doing Test-Driven Development](https://www.codecraftr.nl/why-use-tdd). Thanks to [Colin Damon](https://www.linkedin.com/in/colin-damon/) let me know that I was doing Test First and not TDD and for introducing the concept of [Software Craftsmanship](https://manifesto.softwarecraftsmanship).

Thanks to [Pascal Grimaud](https://twitter.com/pascalgrimaud) for being around and following along on the issue.

## What next

I am planning to continue to contribute to the jhlite project by fixing issues and keep writing blog posts about jhipster in general.

One day, I wish to be part of the [jhipster core team](https://www.jhipster.tech/team/) 😊!
