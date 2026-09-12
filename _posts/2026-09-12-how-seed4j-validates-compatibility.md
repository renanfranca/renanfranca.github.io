---
layout: post
title: How Seed4J Validates Compatibility
description: How Seed4J uses Renovate, GitHub Actions, and 25 generated project configurations to validate compatibility across modern technology stacks.
date: 2026-09-12 15:17:44 -0300
tags: seed4j
dev_to_tags:
  - opensource
  - githubactions
  - devops
  - security
image: img/postbanners/2026-09-12-cover-how-seed4j-validates-compatibility.png
permalink: /:categories/:title:output_ext
---

![Seed4J module landscape](/img/postbanners/2026-09-12-cover-how-seed4j-validates-compatibility.png)

Today, developing a system usually means working with several frameworks and technologies. Even when you already know a technology well, a question comes up whenever you start a new project: do you use the latest version, or stick with the version you already know?

When you choose the latest version, it does not always work well with the other technologies you were using with the previous one. So compatibility between technologies is still a real challenge.

And what about the project you already created? How often do you update its dependencies? Updating a version always comes with the risk and cost of breaking something. And if something does break, how do you validate that the entire configuration is still working correctly?

These questions, combined with the number of modules, frameworks, and technologies that need to work together, are exactly what Seed4J helps to address.

[![The Seed4J landscape showing modules and their relationships](/img/how-seed4j-validates-compatibility/start-seed4j-landscape.png)](https://start.seed4j.com/)

_The Seed4J module landscape at [start.seed4j.com](https://start.seed4j.com/), captured on September 12, 2026._

Why?

Seed4J uses tools such as Renovate and GitHub Actions to update library versions and, as part of its pipeline, generate many different projects. And I really mean many. It currently generates 25 projects using different stacks and combinations of technologies: Angular, Reactive, Vue, Thymeleaf, Spring Boot, TypeScript, and others.

The [current Renovate configuration](https://github.com/seed4j/seed4j/blob/4eebd07bce14c9a6ac70bace157fcc616133e950/renovate.json) checks for dependency updates daily. Minor updates can be merged automatically, but only after all required status checks pass.

## The 25 configurations in the current CI matrix

The [generation matrix](https://github.com/seed4j/seed4j/blob/4eebd07bce14c9a6ac70bace157fcc616133e950/.github/workflows/github-actions.yml#L222-L279) uses Maven, YAML, npm, Java 25, and the Node.js LTS release by default. Six configurations intentionally change one of those defaults: Gradle for `fullappgradle`, Spring properties for `mariadbapp`, Java 26 early access for `mongodbapp`, pnpm for `typescriptapp` and `vueoauth2app`, and the latest Node.js release for `vuejwtapp`.

| CI configuration   | Main combination                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fullappmaven`     | Maven full stack with Spring Boot MVC, PostgreSQL, JPA, Liquibase, JWT, KiPe, Vue, TiKUI, architecture, quality, and deployment tooling                        |
| `fullappgradle`    | The same full stack built with Gradle and the Node Gradle plugin                                                                                               |
| `oauth2app`        | Spring Boot MVC, OAuth2 account support, OpenAPI, Cucumber, KiPe authorization, and a sample feature                                                           |
| `mysqlapp`         | Spring Boot MVC, MySQL, JPA, Liquibase, JWT, OpenAPI, Cucumber, and sample persistence                                                                         |
| `mariadbapp`       | Spring Boot MVC, MariaDB, JPA, Liquibase, OpenAPI, Ehcache, and Spring properties configuration                                                                |
| `mssqlapp`         | Spring Boot MVC, Microsoft SQL Server, JPA, and OpenAPI                                                                                                        |
| `flywayapp`        | Spring Boot MVC, PostgreSQL, JPA, Flyway, JWT, OpenAPI, Cucumber, and sample persistence                                                                       |
| `eurekaapp`        | Spring Boot MVC, Eureka client, and Spring Cloud                                                                                                               |
| `consulapp`        | Spring Boot MVC and Consul                                                                                                                                     |
| `gatewayapp`       | Spring Boot WebFlux, Netty, Actuator, Eureka, Spring Cloud, and API Gateway                                                                                    |
| `mongodbapp`       | Spring Boot MVC, MongoDB, Mongock, JWT, OpenAPI, Cucumber, and sample persistence on Java 26 early access                                                      |
| `redisapp`         | Spring Boot MVC, Redis, JWT, OpenAPI, and Cucumber                                                                                                             |
| `cassandraapp`     | Spring Boot MVC, Cassandra migrations, JWT, OpenAPI, Cucumber, KiPe authorization, and sample persistence                                                      |
| `neo4japp`         | Spring Boot MVC, Neo4j migrations, JWT, OpenAPI, and Cucumber                                                                                                  |
| `angularjwtapp`    | Spring Boot MVC, Angular, internationalization, Tailwind CSS, TiKUI, JWT, OpenAPI, and Cypress component tests                                                 |
| `reactapp`         | Spring Boot MVC, React, TypeScript, i18next, TiKUI, JWT, OpenAPI, and Cypress component tests                                                                  |
| `vuejwtapp`        | Spring Boot MVC, Vue, Router, internationalization, Pinia, TiKUI, JWT, OpenAPI, Playwright component tests, and Cypress end-to-end tests on the latest Node.js |
| `vueoauth2app`     | Spring Boot MVC, Vue, Router, internationalization, Pinia, TiKUI, Keycloak OAuth2, Playwright component tests, and Cypress end-to-end tests using pnpm         |
| `kafkaapp`         | Spring Boot MVC, Spring for Apache Kafka, and AKHQ                                                                                                             |
| `pulsarapp`        | Spring Boot MVC and Spring for Apache Pulsar                                                                                                                   |
| `reactiveapp`      | Spring Boot WebFlux, Netty, Actuator, and OpenAPI                                                                                                              |
| `angularoauth2app` | Spring Boot MVC, Angular, OAuth2 account support, OpenAPI, and Keycloak                                                                                        |
| `seed4jextension`  | Spring Boot and a Seed4J extension foundation                                                                                                                  |
| `typescriptapp`    | A standalone TypeScript project with Prettier, optional types, and Sonar analysis using pnpm                                                                   |
| `thymeleafapp`     | Spring Boot MVC, Thymeleaf, Tailwind CSS, HTMX, and WebJars                                                                                                    |

The table summarizes each project rather than listing every module. The complete, executable compositions live in [`tests-ci/generate.sh`](https://github.com/seed4j/seed4j/blob/4eebd07bce14c9a6ac70bace157fcc616133e950/tests-ci/generate.sh).

## What happens on `main` and pull requests

On a push to `main`, GitHub Actions starts one generation job for each of the 25 configurations and runs the relevant checks for every generated project. Depending on the project, that can include Maven verification, a Gradle build, JavaScript coverage, Sonar analysis, linting, frontend component tests, supporting Docker services, and application startup.

On a pull request, each matrix job first generates the project from `main` and calculates a content hash. It then generates the same configuration from the pull request branch. That means up to 50 generation executions: 25 from `main` and 25 from the branch. The generated project tests run when the two outputs differ or when a valid `main` baseline is unavailable. The [workflow records this comparison directly](https://github.com/seed4j/seed4j/blob/4eebd07bce14c9a6ac70bace157fcc616133e950/.github/workflows/github-actions.yml#L281-L442).

[![Successful Seed4J GitHub Actions workflow showing 25 completed generation jobs](/img/how-seed4j-validates-compatibility/seed4j-ci-25-generation-jobs.png)](https://github.com/seed4j/seed4j/actions/runs/34088809580)

_Seed4J build [#31249](https://github.com/seed4j/seed4j/actions/runs/34088809580) completed all 25 generation jobs after Renovate updated `lint-staged` to 17.4.1._

It generates projects with these different combinations and runs their tests to verify whether a newly released version breaks anything.

If a new version causes a problem, project contributors can identify the incompatibility and fix it manually. In other cases, they can simply wait for a newer version of the library before updating.

This gives Seed4J a huge advantage: you can add a module or framework to your project already knowing that the configuration actually works. The Seed4J pipeline has already validated the compatibility between those technologies.

That validation has a defined boundary. The pipeline proves the 25 curated compositions exercised by CI; it does not claim that every theoretically possible combination of Seed4J modules has been tested together.

And today, with advances in AI, vulnerabilities are being discovered faster and faster. Updating a library is no longer just about getting a new feature. It is also a way to avoid remaining exposed to a recently discovered vulnerability.

This is already visible in real projects. Google's AI-assisted fuzzing work reported [26 new vulnerabilities in open source projects](https://security.googleblog.com/2024/11/leveling-up-fuzzing-finding-more.html), including CVE-2024-9143 in OpenSSL. Faster discovery makes a reliable dependency update and validation loop even more valuable.

That is the power of Seed4J.

It allows you to focus mainly on programming your business rules. Knowing how to use the technologies is still the developer's responsibility. But all the work involved in configuring the environment correctly and making sure those technologies are compatible is something Seed4J already handles for you, reliably and consistently.

If this perspective was useful, consider giving [Seed4J](https://github.com/seed4j/seed4j) and [Seed4J CLI](https://github.com/seed4j/seed4j-cli) a star 🌟 on GitHub. It helps more people discover the projects and follow their evolution.

## References

- [Seed4J](https://start.seed4j.com/)
- [Seed4J CLI](https://github.com/seed4j/seed4j-cli)
- [Seed4J generation matrix](https://github.com/seed4j/seed4j/blob/4eebd07bce14c9a6ac70bace157fcc616133e950/.github/workflows/github-actions.yml#L222-L279)
- [Seed4J generated project compositions](https://github.com/seed4j/seed4j/blob/4eebd07bce14c9a6ac70bace157fcc616133e950/tests-ci/generate.sh)
- [Seed4J Renovate configuration](https://github.com/seed4j/seed4j/blob/4eebd07bce14c9a6ac70bace157fcc616133e950/renovate.json)
- [Seed4J build #31249](https://github.com/seed4j/seed4j/actions/runs/34088809580)
- [Google Online Security Blog: Leveling Up Fuzzing](https://security.googleblog.com/2024/11/leveling-up-fuzzing-finding-more.html)
