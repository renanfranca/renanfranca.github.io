---
layout: post
title: Stepping into Vue Enhancing the User Experience in JHipster Lite
description: My journey into Vue.js and Hexagonal Architecture while enhancing the user experience in JHipster Lite
date: 2023-05-21 16:55:48 -0300
tags: jhipster-lite
image: img/postbanners/vue_jhipster_hexagonal_architecture_cover.jpeg
permalink: /:categories/:title:output_ext
draft: true
---

![cover image](https://yourwebsite.github.io/img/postbanners/vue_jhipster_hexagonal_architecture_cover.jpeg)

# Stepping into Vue - Enhancing the User Experience in JHipster Lite

Greetings everyone! Today I'm thrilled to delve into my recent adventure into the world of Vue.js while working on the JHipster Lite project on GitHub. I took the plunge into this popular JavaScript framework to solve an issue, and in the process, learnt a great deal about the framework and Hexagonal Architecture. So, let's dive right in!

## The Issue at Hand

Firstly, I would like to address the problem that kick-started my Vue journey. In [Issue #3371](https://github.com/jhipster/jhipster-lite/issues/3371), I noticed that module properties were resetting every time a user navigated to another page. This could prove tiresome for users as they would need to redefine their preferences every time they switched pages. This prompted me to propose a solution: persist the module properties across pages.

## My First Steps with Vue

To address this issue, I found myself working with Vue.js for the first time. I embarked on this journey while creating the [Pull Request #6091](https://github.com/jhipster/jhipster-lite/pull/6091), titled "Share module properties between landscape and patch screens". I made numerous code changes to enable the module properties to be shared between screens.

My first foray into Vue was both exciting and challenging. Vue's reactivity model and component architecture were different from what I was used to, but I quickly found them to be powerful tools for creating interactive user interfaces. I learned how to use Vue directives, computed properties, and component lifecycle hooks to create responsive and efficient components.

## Hexagonal Architecture Challenges

An interesting challenge I faced during this development was maintaining the principles of Hexagonal Architecture while programming the front-end. There were instances where I made mistakes that contradicted the architectural concepts, but I was fortunate to have a code reviewer who pointed out these discrepancies and clearly guided me on what should be done.

I have come to appreciate the value of Hexagonal Architecture in isolating the application's core logic from external concerns. The experience also underscored the importance of clear and open communication in collaborative development.

## Making Improvements

The first major shift came with the introduction of a new interface, `ModuleParametersRepository`, defining a contract for classes looking to implement a repository for storing and retrieving module parameters. Following this, an implementation of this interface was created, the `LocalStorageModuleParametersRepository`, designed to persist module parameters in the browser's local storage. These additions were made as a response to [Issue #3371](https://github.com/jhipster/jhipster-lite/issues/3371) and were put into action in the [Pull Request #6091](https://github.com/jhipster/jhipster-lite/pull/6091).

To confirm everything works as expected, a suite of tests was also included, located at `src/test/javascript/spec/module/secondary/LocalStorageModuleParametersRepository.spec.ts`. These tests check if the module parameters are correctly stored and retrieved from local storage.

Further modifications were made to several files, including `src/main/webapp/app/main.ts`, `src/main/webapp/app/module/primary/landscape/Landscape.component.ts`, and `src/main/webapp/app/module/primary/modules-patch/ModulesPatch.component.ts`. In these files, direct references to `moduleParameters` were replaced with an injection of `ModuleParametersRepository`. This change ensures the module parameters' values are persisted in the browser's local storage. Whenever a module property is updated or deleted, these changes are stored in the module parameters repository. In addition, when applying new modules, the module parameters' values are fetched directly from the module parameters repository.

Even though these changes may seem small, they have a considerable impact on the modularity and scalability of the code, enabling better management of the application's state and dealing with more complex scenarios. Crucially, they enhance the user experience, as the module parameters no longer reset when navigating to a new page. This solution addresses the problem outlined in [Issue #3371](https://github.com/jhipster/jhipster-lite/issues/3371), where module properties were resetting each time a user navigated to a new page, which was proving to be quite bothersome.

## Conclusion

These changes have the potential to significantly enhance the user experience in JHipster Lite. With the module properties now persisting across pages, users no longer need to redefine their preferences every time they navigate to a different page.

However, please note that these changes are still under review and may not be final. I eagerly look forward to feedback from the community and am ready to make any necessary adjustments.

For a comprehensive understanding of the changes, I recommend reviewing the code directly on GitHub. Stay tuned for more updates on JHipster Lite's development!

---

I hope you found this post useful and interesting. If you have any questions or comments, please feel free to drop them below. Until next time, happy coding!
