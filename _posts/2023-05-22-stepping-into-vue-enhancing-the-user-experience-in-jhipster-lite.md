---
layout: post
title: Stepping into Vue - Enhancing the User Experience in JHipster Lite
description: My journey into Vue.js and Hexagonal Architecture while enhancing the user experience in JHipster Lite
date: 2023-05-21 16:55:48 -0300
tags: jhipster-lite
image: img/postbanners/vue_jhipster_hexagonal_architecture_cover.jpeg
permalink: /:categories/:title:output_ext
draft: true
---

![cover image](https://renanfranca.github.io/img/postbanners/2023-01-08-cover-how-did-i-earn-money.jpeg)

<!-- ![cover image](https://yourwebsite.github.io/img/postbanners/vue_jhipster_hexagonal_architecture_cover.jpeg) -->

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

These following changes have significantly improved the user experience by maintaining the state of module properties across different pages. The use of a repository for managing module parameters has also enhanced the efficiency and reliability of the code.

### Part I: ModuleParametersRepository.ts and LocalStorageModuleParametersRepository.ts

I created two TypeScript files: `ModuleParametersRepository.ts` and `LocalStorageModuleParametersRepository.ts`.

In `ModuleParametersRepository.ts`, I introduced an interface `ModuleParametersRepository`:

```typescript
import { ModuleParameterType } from "@/module/domain/ModuleParameters";

export interface ModuleParametersRepository {
  store(map: Map<string, ModuleParameterType>): void;
  get(): Map<string, ModuleParameterType>;
}
```

This interface provides a contract for storing and retrieving module parameters. The `store` method accepts a map of type `ModuleParameterType` and doesn't return anything, while the `get` method returns a map of the same type.

In `LocalStorageModuleParametersRepository.ts`, I implemented the `ModuleParametersRepository` interface:

```typescript
import { ModuleParametersRepository } from "../domain/ModuleParametersRepository";
import { ModuleParameterType } from "../domain/ModuleParameters";

export class LocalStorageModuleParametersRepository
  implements ModuleParametersRepository
{
  private readonly STORAGE_KEY = "moduleParameters";
  private readonly localStorage: Storage;

  constructor(localStorage: Storage) {
    this.localStorage = localStorage;
  }
  store(map: Map<string, ModuleParameterType>): void {
    this.localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify(Array.from(map.entries()))
    );
  }

  get(): Map<string, ModuleParameterType> {
    const storedValue = this.localStorage.getItem(this.STORAGE_KEY);
    if (storedValue) {
      return new Map(JSON.parse(storedValue));
    }
    return new Map<string, ModuleParameterType>();
  }
}
```

In this class, I defined a `STORAGE_KEY` constant for identifying the storage location and a `localStorage` property of type `Storage`. The constructor accepts a `Storage` object and assigns it to `localStorage`.

The `store` method takes a map of `ModuleParameterType`, converts it into a string using `JSON.stringify`, and stores this string in `localStorage` using the `setItem` method. The `get` method retrieves the stored string from `localStorage` using the `getItem` method, parses it back into a map using `JSON.parse`, and returns it. If no stored value is found, it returns a new, empty map.

### Part II: Main.ts

The first change I made was to add a new import at the top of the `main.ts` file. I imported the `LocalStorageModuleParametersRepository` class from the `./module/secondary/LocalStorageModuleParametersRepository` file. This class is responsible for storing the module properties in the browser's local storage.

```javascript
import { LocalStorageModuleParametersRepository } from "./module/secondary/LocalStorageModuleParametersRepository";
```

Next, I created a new instance of `LocalStorageModuleParametersRepository`, passing `localStorage` as an argument. This allows the class to access the browser's local storage to store and retrieve the module properties.

```javascript
const moduleParametersRepository = new LocalStorageModuleParametersRepository(
  localStorage
);
```

Finally, I added `moduleParametersRepository` to the Vue application context. This allows any Vue component to access the repository and, therefore, the module properties.

```javascript
app.provide("moduleParameters", moduleParametersRepository);
```

These changes allow module properties to be persistently stored, improving the user experience when navigating between pages. Moreover, the implementation of `LocalStorageModuleParametersRepository` allows other parts of the application to easily access the module properties, making the code more modular and easier to maintain.

### Part III: Landscape.component.ts

In the recent update to the Landscape component of the JHipster Lite project, a significant change was made to improve the management of module parameters. The original code used a local reference, `valuatedModuleParameters`, to store the parameters of the modules. This was replaced with a more robust solution: a repository pattern.

The `ModuleParametersRepository` was imported at the top of the file, and an instance of it was injected into the component. This repository is responsible for managing the module parameters, providing a more centralized and consistent way to handle these values. This change can be seen in the following lines:

```javascript
import { ModuleParametersRepository } from '@/module/domain/ModuleParametersRepository';
...
const moduleParameters = inject('moduleParameters') as ModuleParametersRepository;
const moduleParametersValues = ref(moduleParameters.get());
```

The `moduleParametersValues` reference now points to the values retrieved from the repository, and any changes to these values are stored back into the repository. This can be seen in the `updateProperty` and `deleteProperty` methods:

```javascript
const updateProperty = (property: ModuleParameter): void => {
  moduleParametersValues.value.set(property.key, property.value);
  moduleParameters.store(moduleParametersValues.value);
};

const deleteProperty = (key: string): void => {
  moduleParametersValues.value.delete(key);
  moduleParameters.store(moduleParametersValues.value);
};
```

This new approach ensures that the module parameters are consistently managed across different parts of the application, reducing the risk of inconsistencies and bugs. It also makes the code more maintainable and easier to understand, as the responsibility of managing the module parameters is clearly defined and encapsulated within the `ModuleParametersRepository`.

### Part IV: ModulesPatch.component.ts

Starting with the import section, I introduced `ModuleParametersRepository` from the domain of the module. This repository is designed to manage the module parameters, providing a more efficient way to handle them.

```javascript
import { ModuleParametersRepository } from "@/module/domain/ModuleParametersRepository";
```

In the `defineComponent` function, I replaced the `moduleParameters` ref with an injection of `moduleParameters` from the `ModuleParametersRepository`. This allows the component to directly access the repository, improving the efficiency of data retrieval. I also introduced `moduleParametersValues` as a ref, which gets the current state of the module parameters from the repository.

```javascript
const moduleParameters = inject('moduleParameters') as ModuleParametersRepository;
const moduleParametersValues = ref(moduleParameters.get());
```

In the `isNotSet` function, I changed the source of the value from `moduleParameters.value.get(propertyKey)` to `moduleParametersValues.value.get(propertyKey)`. This ensures that the function checks the current state of the module parameters.

```javascript
const value = moduleParametersValues.value.get(propertyKey);
```

In the `updateProperty` and `deleteProperty` functions, I updated the state of the module parameters in the repository after every change. This ensures that the repository always holds the most recent state of the module parameters.

```javascript
const updateProperty = (property: ModuleParameter): void => {
  moduleParametersValues.value.set(property.key, property.value);
  moduleParameters.store(moduleParametersValues.value);
};

const deleteProperty = (key: ModulePropertyKey): void => {
  moduleParametersValues.value.delete(key);
  moduleParameters.store(moduleParametersValues.value);
};
```

In the function that applies a module, I replaced `moduleParameters.value` with `moduleParametersValues.value` as the source of parameters. This ensures that the most recent state of the module parameters is used when applying a module.

```javascript
parameters: moduleParametersValues.value,
```

In the function that handles project history properties, I updated the state of the module parameters in the repository after setting each unknown property. This ensures that the repository is updated with any new properties that are discovered.

```javascript
moduleParametersValues.value.set(property.key, property.value);
moduleParameters.store(moduleParametersValues.value);
```

Finally, in the return statement of the `defineComponent` function, I replaced `moduleParameters` with `moduleParametersValues`. This ensures that the component always provides the most recent state of the module parameters.

```javascript
moduleParametersValues,
```

## Conclusion

These changes have the potential to significantly enhance the user experience in JHipster Lite. With the module properties now persisting across pages, users no longer need to redefine their preferences every time they navigate to a different page.

However, please note that these changes are still under review and may not be final. I eagerly look forward to feedback from the community and am ready to make any necessary adjustments.

For a comprehensive understanding of the changes, I recommend reviewing the code directly on GitHub. Stay tuned for more updates on JHipster Lite's development!

---

I hope you found this post useful and interesting. If you have any questions or comments, please feel free to drop them below. Until next time, happy coding!

```

```