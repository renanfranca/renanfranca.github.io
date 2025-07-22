---
layout: post
title: Adding a Loading Animation to JHipster Lite CLI
description: How I implemented a spinner animation for the JHipster Lite CLI to enhance the user experience
date: 2025-07-22 10:30:00 -0300
tags: java-cli
image: img/postbanners/2025-07-22-cover-adding-loading-animation-jhlite-cli.jpg
permalink: /:categories/:title:output_ext
---

![cover image](https://renanfranca.github.io/img/postbanners/2025-07-22-cover-adding-loading-animation-jhlite-cli.jpg)

Have you ever run a command-line application and found yourself staring at a blank screen, wondering if it's still working or if it's frozen? That's exactly the problem I set out to solve for the JHipster Lite CLI project. In this post, I'll share how I implemented a loading animation to enhance the user experience while commands are executing.

## The Problem: Waiting in the Dark

When running commands in the JHipster Lite CLI, users had no visual feedback during operations that took more than a few seconds. This led to uncertainty - is the application still running? Is it stuck? Should I cancel and try again?

I wanted to fix [this issue](https://github.com/jhipster/jhipster-lite-cli/issues/13) by adding a loading animation that would provide visual feedback during command execution.

![no animation](https://renanfranca.github.io/img/adding-loading-animation-jhlite-cli/jhlite-version-no-animation.gif)

## The Solution: A Hexagonal Spinner

I created a loading animation module that follows the hexagonal architecture principles that JHipster Lite is known for. Here's a demo of what I implemented:

![no animation](https://renanfranca.github.io/img/adding-loading-animation-jhlite-cli/jhlite-version-loading-animation.gif)

## Exploring Available Libraries

Before implementing my own solution, I explored existing libraries:

1. **[magic-progress](https://github.com/lukfor/magic-progress)**: I tried using this library but encountered errors when running the `jhlite` command. Looking at the source code, I found no tests, and the project hadn't been maintained since August 2020.

2. **[progressbar](https://github.com/ctongfei/progressbar)**: This library didn't have spinner animations, which was a key requirement for our user experience.

Given these limitations, I decided to implement a custom solution that would perfectly fit our needs.

## The SpinnerProgress Module

I created a `SpinnerProgress` module following hexagonal architecture principles:

### Hexagonal Architecture Implementation

The code follows a clean hexagonal architecture pattern:

1. **Domain Layer (Port)** - The `SpinnerProgress` interface defines the core contract
2. **Infrastructure Layer (Adapter)** - The `ConsoleSpinnerProgress` class implements the interface for console environments

This separation allows us to:
- Keep the core logic independent of UI implementation
- Easily test with mock implementations
- Add new progress indicator types without changing core logic

### Key Features

#### 1. Animated Unicode Spinner
The spinner uses Unicode braille patterns for a smooth rotating animation:

```java
private static final String[] SPINNER_FRAMES = { "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" };
```

#### 2. Color-Coded Messages
The animation implements ANSI color support:
- Cyan for in-progress operations
- Green for success messages
- Red for failure notifications

#### 3. Asynchronous Animation
The spinner runs in a daemon thread to avoid blocking the main application:

```java
executor = Executors.newSingleThreadScheduledExecutor(r -> {
  Thread thread = new Thread(r, "spinner-animation");
  thread.setDaemon(true);
  return thread;
});
```

#### 4. Thread-Safe Operation
The implementation uses atomic operations for thread safety:

```java
private final AtomicBoolean running = new AtomicBoolean(false);
```

#### 5. Rich Animation Sequences
I added sophisticated animation cycles including:
- Progressive dots (. .. ...)
- JHipster-lite symbols (⧓⚡)
- Hexagonal architecture symbol (💎)
- Spring Boot symbol (🍃)

## The Little Details That Matter

A cool thing about this animation is that you don't mind if operations take a little longer because you can see different animations and progress indicators. I included some curious details:

1) The icons on the right represent the technology and architecture used by JHLiteCli. I synchronized the animation so it feels like you can see what is loading, but it's just an illusion.

2) If the Execute command takes a little bit longer, it shows the bow tie + lightning, which represents jhipster-lite. I designed the animation to match that style.

At the end, I felt the loading time isn't as bothersome as before. The user experience is much more relaxed and engaging.

## Usage Example

Here's how you can use the SpinnerProgress in your own code:

```java
SpinnerProgress spinner = new ConsoleSpinnerProgress();

spinner.show("Loading application...");
try {
    loadApplication();
    spinner.update("Processing configuration...");
    processConfiguration();
    spinner.success("Application started successfully");
} catch (Exception e) {
    spinner.failure("Failed to start application: " + e.getMessage());
}
```

## Implementation in JHipster Lite CLI

I integrated the SpinnerProgress module into the JHipster Lite CLI for:

1. **Application Startup**: Shows "Loading JHipster Lite CLI" during initialization
2. **Command Execution**: Displays progress during command running
3. **Command Completion**: Shows success or failure messages with appropriate colors

The animation is now active for all major commands:
- Version command (--version)
- List command (list)
- Apply command (apply)

## Benefits Beyond Aesthetics

This implementation provides several benefits:

1. **Improved User Experience**: Users now have visual feedback during operations
2. **Reduced Perceived Wait Time**: The animation makes waiting feel shorter
3. **Clear Operation Status**: Success and failure states are clearly indicated
4. **Architectural Consistency**: The solution follows JHipster's hexagonal architecture principles

## Conclusion

Adding a loading animation to the JHipster Lite CLI might seem like a small enhancement, but it significantly improves the user experience. By following hexagonal architecture principles, I was able to create a solution that's not only visually appealing but also maintainable, testable, and extensible.

This project demonstrates how proper architectural design can benefit even UI components. The next time you're working on a command-line application, consider how you might enhance the user experience with similar feedback mechanisms.

Lastly, let me extend an invitation to join me on my journey 🚀 in the realm of software development. I share my insights, experiences, and valuable resources on [LinkedIn](https://www.linkedin.com/in/renan-af) 📎. Following me on these platforms not only keeps you updated on my latest posts and projects 📬 but also opens doors to vibrant discussions and learning opportunities. I look forward to connecting with you! 💼

## Feedback

**If you like those projects, please, considering give it a star 🌟 to support us and enhanced both repository's visibility 🤩!**

<!-- Place this tag where you want the button to render. --> <a class="github-button" href="https://github.com/jhipster/jhipster-lite" data-color-scheme="no-preference: dark; light: light; dark: dark;" data-show-count="true" data-size="large" aria-label="Star jhipster-jhipster-lite on GitHub">•⭐ jhipster-lite</a>

<!-- Place this tag where you want the button to render. --> <a class="github-button" href="https://github.com/jhipster/jhipster-lite-cli" data-color-scheme="no-preference: dark; light: light; dark: dark;" data-show-count="true" data-size="large" aria-label="Star jhipster/jhipster-lite-cli on GitHub">•⭐ jhipster-lite-cli</a>
<!-- Place this tag in your head or just before your close body tag. -->
<script async defer src="https://buttons.github.io/buttons.js"></script>
