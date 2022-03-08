---
layout: post
title: My 15+ Reasons to use JHipster
description: You are going to have a bootstrap project with a lot of features and functionality already configured and implemented. I will share with you the JHipster features I like the most.
published: true
date: 2022-03-08 09:00:00 -0300
tags: jhipster
image: /img/postbanners/2022-03-08-cover-my-reasons-to-use-jhipster.jpeg
---
![cover image](/img/postbanners/2022-03-08-cover-my-reasons-to-use-jhipster.jpeg)

## Generating your project using JHipster quick start steps

1. Install [Java](https://adoptopenjdk.net/), [Git](https://git-scm.com/) and [Node.js](https://nodejs.org/)
2. Install JHipster `npm install -g generator-jhipster`
3. Create a new directory and go into it `mkdir myApp && cd myApp`
4. Run JHipster and follow instructions on screen `jhipster`
5. Model your entities with [JDL Studio](https://start.jhipster.tech/jdl-studio/) and download the resulting `jhipster-jdl.jdl` file
6. Generate your entities with `jhipster jdl jhipster-jdl.jdl`

You are going to have a bootstrap project with a lot of features and functionalities already configured and implemented. I will share with you the JHipster features I like the most.

## My 15+ Reasons to use JHipster

1. Update all libraries and framework automatically when upgrading the JHipster version of the project (I upgraded from version 7.1.0 to 7.1.0 smoothly) - [https://www.jhipster.tech/upgrading-an-application/](https://www.jhipster.tech/upgrading-an-application/)
2. Already configured Husky (configure git hooks for automatic tasks) - [https://typicode.github.io/husky](https://typicode.github.io/husky) 
3. Already configured eslint (javascript code analysis and automatic fix) - [https://eslint.org/](https://eslint.org/) 
4. Already configured EditorConfig to maintain consistent coding styles for multiple developers working on the same project across various editors and IDEs - [https://editorconfig.org/](https://editorconfig.org/) 
5. Already configured BrowserSync the time-saving synchronized browser testing - [https://browsersync.io/](https://browsersync.io/) 
6. Already configured Progressive Web App (PWA) to make your web app application installable on Android when opened inside google chrome - [https://blog.ippon.tech/build-a-pwa-in-jhipster/](https://blog.ippon.tech/build-a-pwa-in-jhipster/) 
7. Already configured spring profiles for development and production - [https://www.jhipster.tech/profiles/](https://www.jhipster.tech/profiles/) 
8. When run on dev already generate external IP to access throw your phone or another device on your domestic network
9. Already configured [liquibase](https://www.liquibase.org/). Learn more on [How to Use Liquibase to Update the Schema of Your JHipster Application](https://dev.to/entando/how-to-use-liquibase-to-update-the-schema-of-your-jhipster-application-1cm3) by [@avdev4j](https://twitter.com/avdev4j)
10. Already implemented user management module (registration, login, forgot password, roles)
11. Every generated code has an automatic test implemented (Angular and Spring Boot), so after using the JHipster generator just run `./mvnw verify` and you are ready to go if all tests pass
12. Already built-in internationalization support!! - [https://www.jhipster.tech/development/#internationalization](https://www.jhipster.tech/development/#internationalization)
13. The Angular and Spring Boot code is really easy to read and customize! In addition, there are many “helper” classes to assist you with business logic implementation!
14. Already configured [Cypress](https://www.cypress.io/) for end-to-end tests. [Learn how to use cypress with Anthony Viard](https://www.youtube.com/watch?v=FOWDZpOYIDA)
15. Already implemented a sophisticated error handler - [https://www.jhipster.tech/managing-server-errors/](https://www.jhipster.tech/managing-server-errors/) 
16. Created a useful Readme.md file with instructions to explore and run your generated project.

**I hope you have the time to try out [JHipster](https://www.jhipster.tech/)**. If you have any questions or just want to say something, please, use the comment section 😊