---
layout: post
title: 💨🚀 Accelerate Your Workflow with ChatGPT Prompts 📝 - Ditch the Boilerplate 📃✖️ and Eliminate Duplicates 🔄🚫
description: Discover how ChatGPT prompts can streamline your workflow, eliminate boilerplate code and tackle code duplication. Join the discussion.
date: 2023-07-11 08:00:00 -0300
tags: chatgpt
image: img/postbanners/2023-06-28-cover-chatgpt-prompts.jpeg
permalink: /:categories/:title:output_ext
---

![cover image](https://renanfranca.github.io/img/postbanners/2023-06-28-cover-chatgpt-prompts.jpeg)
<span class="image-references"> Image crafted by <a target="_blank" href="https://www.instagram.com/design.marca/">Geyzon Amaral</a> </span>

In our ever-evolving digital landscape, efficiency is the name of the game. As developers, we're constantly on the hunt for tools and practices that can streamline our workflow and improve the quality of our code. One powerful approach to achieving this is through the use of AI-based prompts, specifically, OpenAI's ChatGPT prompts.

## Unraveling Boilerplate Code

Boilerplate code refers to sections of code that have to be included in many places with little to no alteration. It's often necessary but can bloat our codebase, making it harder to read and maintain. Moreover, the act of constantly typing out these code sections is time-consuming and monotonous.

This is where the beauty of ChatGPT prompts comes into play.

## Harnessing the Power of ChatGPT Prompts

ChatGPT prompts can drastically speed up the development process by automating the generation of boilerplate code. This not only reduces manual typing but also minimizes the risk of errors that often creep in during repetitive tasks like copying and pasting code. I will show you some examples using chatGPT-4.

### A Practical Example: From JSON to Java Class

As the first example, I will introduce a simple prompt for you to get used to it before going to complex prompts.

Imagine you have a JSON that needs to be converted to a Java class. Here's a sample prompt you could use:

**Prompt:** Convert the following JSON to a Typescript object:

```json
{
  "id": 1,
  "name": "John",
  "email": "john@example.com",
  "details": {
    "age": 30,
    "address": "123 Main St"
  }
}
```

With the help of ChatGPT, the output would be:

```ts
interface Details {
  age: number;
  address: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  details: Details;
}

const user: User = {
  id: 1,
  name: "John",
  email: "john@example.com",
  details: {
    age: 30,
    address: "123 Main St",
  },
};
```

With a simple prompt, we managed to convert a JSON object to a Typescript object, significantly reducing the time and effort required for this common task.

Try out this prompt right now: [TS Object from JSON](https://chat.openai.com/share/5e162d6c-489f-4a31-a710-41b484b0d2d5)

### Ditching Boilerplate with Prompts

I like to organize my Vuejs components in different files, for example, a component called Homepage:

- 📂homepage
  - Homepage.component.ts
  - Homepage.html
  - HomepageVue.vue
  - index.ts

The following prompt generates the content of those files for a different component name:

**Prompt**:

In vue 3 js, take into account the organization of this file inside the folder homepage:

```ts
- index.ts:
import HomepageVue from './HomepageVue.vue';

export { HomepageVue };

- HomepageVue.vue:
<template src="./Homepage.html"></template>

<script lang="ts" src="./Homepage.component.ts"></script>

- Homepage.html:

<div>
</div>

- Homepage.component.ts:
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HomepageVue',
});
```

Now you are going to ask me for the name of the new component and replace Homepage with the new component name. After that, you are going to ask for other component names again forever.

**ChatGPT**: Sure, I can assist you with that. To start, what is the name of your new component?

**Prompt**: SignIn

**ChatGPT**:
> Based on your request, your files for the new component "SignIn" should be structured as follows:

- index.ts:

```javascript
import SignInVue from './SignInVue.vue';

export { SignInVue };
```

- SignInVue.vue:

```html
<template src="./SignIn.html"></template>

<script lang="ts" src="./SignIn.component.ts"></script>
```

- SignIn.html:

```html
<div>
</div>
```

- SignIn.component.ts:

```javascript
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SignInVue',
});
```

> Let's continue. What is the next component name you would like to use?

Then I could keep creating new components and copy and paste them into my Vuejs project 😎!

Check this prompt right now: [Generate Vuejs Component](https://chat.openai.com/share/87618651-9bd0-40df-84b1-f2cab05ac399)

### Ditching Duplicates with Prompts

ChatGPT is not just limited to boilerplate code; it can also be employed to identify and refactor duplicated code, another common concern in software development.

Let's say we have a software system for a library. The system has two main functionalities: lending books to library members and restocking returned books.

Below is the code which has a significant amount of duplication and the prompt you could use at the:

**Prompt**:
Remove the duplication from the following Java class:

```java
public class LibrarySystem {

    private List<Book> availableBooks;
    private Map<Member, List<Book>> lentBooks;

    // other necessary code...

    public void lendBook(Member member, Book book) {
        if (availableBooks.contains(book)) {
            // removing the book from the available book list
            availableBooks.remove(book);
            // adding the book to the member's lent books
            List<Book> memberBooks = lentBooks.get(member);
            if (memberBooks == null) {
                memberBooks = new ArrayList<>();
                lentBooks.put(member, memberBooks);
            }
            memberBooks.add(book);
            // generating a due date for returning the book, let's say in two weeks
            LocalDate dueDate = LocalDate.now().plusWeeks(2);
            // printing out a receipt
            System.out.println("Book: " + book.getTitle() + " lent to: " + member.getName() + " Due date: " + dueDate);
            // other necessary code...
        } else {
            System.out.println("The book is not available.");
        }
    }

    public void restockBook(Member member, Book book) {
        if (lentBooks.get(member) != null && lentBooks.get(member).contains(book)) {
            // removing the book from the member's lent books
            lentBooks.get(member).remove(book);
            // adding the book to the available book list
            availableBooks.add(book);
            // calculating and printing out any late fees
            LocalDate dueDate = LocalDate.now().minusWeeks(2); // assuming the book was due two weeks ago
            LocalDate returnDate = LocalDate.now();
            if (returnDate.isAfter(dueDate)) {
                long daysLate = ChronoUnit.DAYS.between(dueDate, returnDate);
                double lateFee = daysLate * 0.50; // assuming the late fee is 50 cents per day
                System.out.println("Late fee for book: " + book.getTitle() + " is: " + lateFee);
            }
            // other necessary code...
        } else {
            System.out.println("The book was not lent to this member.");
        }
    }
}
```

**ChatGPT**:

The duplication in this Java class can be seen in the code that retrieves a member's book list from the map. This code segment is repeated in both methods, `lendBook`, and `restockBook`. To remove this duplication, you can create a helper method, `getMemberBooks`, which takes a `Member` as an argument and returns a `List<Book>`. Here is the refactored code:

```java
public class LibrarySystem {

    private List<Book> availableBooks;
    private Map<Member, List<Book>> lentBooks;

    // other necessary code...

    private List<Book> getMemberBooks(Member member) {
        List<Book> memberBooks = lentBooks.get(member);
        if (memberBooks == null) {
            memberBooks = new ArrayList<>();
            lentBooks.put(member, memberBooks);
        }
        return memberBooks;
    }

    public void lendBook(Member member, Book book) {
        if (availableBooks.contains(book)) {
            // removing the book from the available book list
            availableBooks.remove(book);
            // adding the book to the member's lent books
            List<Book> memberBooks = getMemberBooks(member);
            memberBooks.add(book);
            // generating a due date for returning the book, let's say in two weeks
            LocalDate dueDate = LocalDate.now().plusWeeks(2);
            // printing out a receipt
            System.out.println("Book: " + book.getTitle() + " lent to: " + member.getName() + " Due date: " + dueDate);
            // other necessary code...
        } else {
            System.out.println("The book is not available.");
        }
    }

    public void restockBook(Member member, Book book) {
        List<Book> memberBooks = getMemberBooks(member);
        if (memberBooks.contains(book)) {
            // removing the book from the member's lent books
            memberBooks.remove(book);
            // adding the book to the available book list
            availableBooks.add(book);
            // calculating and printing out any late fees
            LocalDate dueDate = LocalDate.now().minusWeeks(2); // assuming the book was due two weeks ago
            LocalDate returnDate = LocalDate.now();
            if (returnDate.isAfter(dueDate)) {
                long daysLate = ChronoUnit.DAYS.between(dueDate, returnDate);
                double lateFee = daysLate * 0.50; // assuming the late fee is 50 cents per day
                System.out.println("Late fee for book: " + book.getTitle() + " is: " + lateFee);
            }
            // other necessary code...
        } else {
            System.out.println("The book was not lent to this member.");
        }
    }
}
```

By simply running a ChatGPT prompt to identify and refactor duplicated code, we streamlined our code, enhancing readability and maintainability.

This prompt is available here: [Remove Duplication in Java](https://chat.openai.com/share/7986d984-0220-45fb-9ccf-501cb810ecd9)

## Let's Connect and Continue the Discussion 🚀

My journey as a developer is marked by the constant

 pursuit of knowledge and efficiency. I've found the usage of ChatGPT prompts to be a powerful tool for achieving these goals, and I'm excited to share these insights with the community.

To continue this journey together, I extend an invitation to connect with me on Twitter [@renan_afranca](https://www.twitter.com/renan_afranca)🐦 and [LinkedIn](https://www.linkedin.com/in/renan-af)📎. Not only will you stay updated with my latest posts and insights, but it will also pave the way for fruitful discussions and learning opportunities.

## Your Turn 💼

How has your experience been with AI-assisted code generation? Do you see the use of prompts like ChatGPT becoming a staple in software development workflows? How have these prompts impacted your productivity or code quality?

Drop your thoughts 💭 in the comment section below and let's foster a healthy discussion around enhancing developer experiences in our digital era. Looking forward to your valuable input! 🌟
