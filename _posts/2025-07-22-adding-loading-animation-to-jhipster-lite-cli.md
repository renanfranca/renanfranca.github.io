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

![jhlite --version without animation](https://renanfranca.github.io/img/adding-loading-animation-jhlite-cli/jhlite-version-no-animation.gif)

## The Solution: A Hexagonal ProgressStatus

I created a loading animation module that follows the hexagonal architecture principles that JHipster Lite is known for. Here's a demo of what I implemented:

![jhlite --version loading animation](https://renanfranca.github.io/img/adding-loading-animation-jhlite-cli/jhlite-version-loading-animation.gif)

## Exploring Available Libraries

Before implementing my own solution, I explored existing libraries:

1. **[magic-progress](https://github.com/lukfor/magic-progress)**: I tried using this library but encountered errors when running the `jhlite` command. Looking at the source code, I found no tests, and the project hadn't been maintained since August 2020.

2. **[progressbar](https://github.com/ctongfei/progressbar)**: This library didn't have spinner animations, which was a key requirement for our user experience.

Given these limitations, I decided to implement a custom solution that would perfectly fit our needs.

## The ProgressStatus Module

I created a `ProgressStatus` module following hexagonal architecture principles:

### Hexagonal Architecture Implementation

```bash
├── domain
│   └── ProgressStatus.java
├── infrastructure
│   └── primary
│       └── SpinnerProgressStatus.java
└── package-info.java
```
The code follows a clean hexagonal architecture pattern:

1. **Domain Layer (Port)** - The `ProgressStatus` interface defines the core contract
   <details>
    
    <summary>ProgressStatus.java - (click to expand)</summary>
    
    ```java
    package tech.jhipster.lite.cli.shared.progressstatus.domain;
    
    public interface ProgressStatus {
    void show();
    void show(String message);
    void update(String message);
    void hide();
    void success(String message);
    void failure(String message);
    }
    ```
   </details>

2. **Infrastructure Layer (Adapter)** - The `SpinnerProgressStatus` class implements the interface for spinner animation
    <details>
    
    <summary>SpinnerProgressStatus.java - (click to expand)</summary>
    
    ```java
    package tech.jhipster.lite.cli.shared.progressstatus.infrastructure.primary;
    
    import java.util.Arrays;
    import java.util.concurrent.Executors;
    import java.util.concurrent.ScheduledExecutorService;
    import java.util.concurrent.TimeUnit;
    import java.util.concurrent.atomic.AtomicBoolean;
    import java.util.stream.Stream;
    import tech.jhipster.lite.cli.shared.generation.domain.ExcludeFromGeneratedCodeCoverage;
    import tech.jhipster.lite.cli.shared.progressstatus.domain.ProgressStatus;
    
    class SpinnerProgressStatus implements ProgressStatus {
    
        private static final String ANSI_RESET = "\u001B[0m";
        private static final String ANSI_GREEN = "\u001B[32m";
        private static final String ANSI_RED = "\u001B[31m";
        private static final String ANSI_CYAN = "\u001B[36m";
        private static final String CLEAR_LINE = "\r\033[K";
        private static final String[] SPINNER_FRAMES = { "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" };
        private static final String DOT = ". ";
        private static final String DOUBLE_DOT = ".. ";
        private static final String TRIPLE_DOT = "... ";
        private static final String EMPTY = " ";
        private static final String LIGHTNING = "...%s⧓%s⚡ ".formatted(ANSI_CYAN, ANSI_RESET);
        private static final String LIGHTNING_DIAMOND = "...%s⧓%s⚡ 💎 ".formatted(ANSI_CYAN, ANSI_RESET);
        private static final String LIGHTNING_DIAMOND_LEAF = "...%s⧓%s⚡ 💎 🍃 ".formatted(ANSI_CYAN, ANSI_RESET);
    
        private static final String[] SUFFIX_ANIMATION_FRAMES = createSuffixAnimationFrames();
    
        private ScheduledExecutorService executor;
        private final AtomicBoolean running = new AtomicBoolean(false);
        private String currentMessage = "";
        private int frameIndex = 0;
        private int suffixFrameIndex = 0;
    
        private static String[] createSuffixAnimationFrames() {
            // @formatter:off
            String[] firstSequence = {
                    DOT, DOT,
                    DOUBLE_DOT, DOUBLE_DOT,
                    TRIPLE_DOT, TRIPLE_DOT,
                    LIGHTNING, LIGHTNING, LIGHTNING, LIGHTNING,
                    TRIPLE_DOT, TRIPLE_DOT,
                    DOUBLE_DOT, DOUBLE_DOT,
                    DOT, DOT,
                    EMPTY, EMPTY
            };
    
            String[] secondSequence = {
                    DOT, DOT,
                    DOUBLE_DOT, DOUBLE_DOT,
                    TRIPLE_DOT, TRIPLE_DOT,
                    LIGHTNING, LIGHTNING,
                    LIGHTNING_DIAMOND, LIGHTNING_DIAMOND,
                    LIGHTNING_DIAMOND_LEAF, LIGHTNING_DIAMOND_LEAF, LIGHTNING_DIAMOND_LEAF, LIGHTNING_DIAMOND_LEAF,
                    TRIPLE_DOT, TRIPLE_DOT,
                    DOUBLE_DOT, DOUBLE_DOT,
                    DOT, DOT,
                    EMPTY, EMPTY
            };
    
            return Stream.concat(Arrays.stream(firstSequence), Arrays.stream(secondSequence))
                    .toArray(String[]::new);
            // @formatter:on
        }
    
        @Override
        public void show() {
            show("Processing");
        }
    
        @Override
        public void show(String message) {
            if (running.compareAndSet(false, true)) {
                currentMessage = message;
    
                renderFrameSync();
    
                executor = Executors.newSingleThreadScheduledExecutor(r -> {
                    Thread thread = new Thread(r, "spinner-animation");
                    thread.setDaemon(true);
                    return thread;
                });
                executor.scheduleAtFixedRate(this::renderFrame, 0, 120, TimeUnit.MILLISECONDS);
            } else {
                update(message);
            }
        }
    
        @Override
        public void update(String message) {
            currentMessage = message;
    
            renderFrameSync();
        }
    
        @Override
        public void hide() {
            stopSpinner();
        }
    
        private boolean stopSpinner() {
            if (running.compareAndSet(true, false)) {
                executor.shutdown();
                System.out.print(CLEAR_LINE);
                frameIndex = 0;
                suffixFrameIndex = 0;
                return true;
            }
            return false;
        }
    
        @Override
        public void success(String message) {
            displayResult(ANSI_GREEN, "✓", message);
        }
    
        private void displayResult(String color, String symbol, String message) {
            if (stopSpinner()) {
                System.out.println(color + symbol + ANSI_RESET + " " + message);
            }
        }
    
        @Override
        public void failure(String message) {
            displayResult(ANSI_RED, "✗", message);
        }
    
        @ExcludeFromGeneratedCodeCoverage(reason = "Rendering logic is difficult to test")
        private void renderFrameSync() {
            renderSpinner(false);
        }
    
        @ExcludeFromGeneratedCodeCoverage(reason = "Rendering logic is difficult to test")
        private void renderSpinner(boolean updateFrame) {
            if (running.get()) {
                if (updateFrame) {
                    frameIndex = (frameIndex + 1) % SPINNER_FRAMES.length;
                    suffixFrameIndex = (suffixFrameIndex + 1) % SUFFIX_ANIMATION_FRAMES.length;
                }
                String frame = SPINNER_FRAMES[frameIndex];
                String suffix = SUFFIX_ANIMATION_FRAMES[suffixFrameIndex];
                System.out.print(CLEAR_LINE + ANSI_CYAN + frame + ANSI_RESET + " " + currentMessage + suffix);
            }
        }
    
        @ExcludeFromGeneratedCodeCoverage(reason = "Rendering logic is difficult to test")
        private void renderFrame() {
            renderSpinner(true);
        }
    }
    ```
    
    </details>

This separation allows us to:
- Keep the core logic independent of visual animation implementation
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
executor.scheduleAtFixedRate(this::renderFrame, 0, 120, TimeUnit.MILLISECONDS);
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

#### 6. Rendering Animation Logic

```java
private void renderSpinner(boolean updateFrame) {
 if (running.get()) {
   if (updateFrame) {
     frameIndex = (frameIndex + 1) % SPINNER_FRAMES.length;
     suffixFrameIndex = (suffixFrameIndex + 1) % SUFFIX_ANIMATION_FRAMES.length;
   }
   String frame = SPINNER_FRAMES[frameIndex];
   String suffix = SUFFIX_ANIMATION_FRAMES[suffixFrameIndex];
   System.out.print(CLEAR_LINE + ANSI_CYAN + frame + ANSI_RESET + " " + currentMessage + suffix);
 }
}
```

## The Little Details That Matter

A cool thing about this animation is that you don't mind if operations take a little longer because you can see different animations and progress indicators. I included some curious details:

1) The icons on the right represent the technology and architecture used by JHLiteCli. I synchronized the animation so it feels like you can see what is loading, but it's just an illusion.

2) If the Execute command takes a little bit longer, it shows the bow tie + lightning, which represents jhipster-lite. I designed the animation to match that style.

At the end, I felt the loading time isn't as bothersome as before. The user experience is much more relaxed and engaging.

## Usage Example

Here's you can see a test case on how ProgressStatus works:

```java
@Test
void shouldShowSuccessMessage(CapturedOutput output) {
   ProgressStatus progressStatus = new SpinnerProgressStatus();
   progressStatus.show("Operation in progress");

   progressStatus.success("Completed successfully");

   assertThat(output.toString()).contains("✓").contains("Completed successfully");
}
```

<details>
<summary>ProgressStatusTest.java - (click to expand)</summary>

```java
package tech.jhipster.lite.cli.shared.progressstatus.infrastructure.primary;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import tech.jhipster.lite.cli.UnitTest;
import tech.jhipster.lite.cli.shared.progressstatus.domain.ProgressStatus;

@UnitTest
@ExtendWith(OutputCaptureExtension.class)
class ProgressStatusTest {

   private static final String CLEAR_LINE = "\r\033[K";

   @Nested
   @DisplayName("spinner display")
   class SpinnerDisplay {

      @Test
      void shouldDisplaySpinnerWithMessage(CapturedOutput output) {
         ProgressStatus progressStatus = new SpinnerProgressStatus();

         progressStatus.show("Loading test data");

         assertThat(output.toString()).contains("Loading test data");
         progressStatus.hide();
      }

      @Test
      void shouldDisplaySpinnerWithDefaultMessage(CapturedOutput output) {
         ProgressStatus progressStatus = new SpinnerProgressStatus();

         progressStatus.show();

         assertThat(output.toString()).contains("Processing");
         progressStatus.hide();
      }
   }

   @Nested
   @DisplayName("spinner updates")
   class SpinnerUpdates {

      @Test
      void shouldUpdateSpinnerMessage(CapturedOutput output) {
         ProgressStatus progressStatus = new SpinnerProgressStatus();
         progressStatus.show("Initial message");

         progressStatus.update("Updated message");

         assertThat(output.toString()).contains("Updated message");
         progressStatus.hide();
      }
   }

   @Nested
   @DisplayName("spinner completion")
   class SpinnerCompletion {

      @Test
      void shouldShowSuccessMessage(CapturedOutput output) {
         ProgressStatus progressStatus = new SpinnerProgressStatus();
         progressStatus.show("Operation in progress");

         progressStatus.success("Completed successfully");

         assertThat(output.toString()).contains("✓").contains("Completed successfully");
      }

      @Test
      void shouldShowFailureMessage(CapturedOutput output) {
         ProgressStatus progressStatus = new SpinnerProgressStatus();
         progressStatus.show("Operation in progress");

         progressStatus.failure("Operation failed");

         assertThat(output.toString()).contains("✗").contains("Operation failed");
      }

      @Test
      void shouldHideSpinnerWithoutCompletionMessage(CapturedOutput output) {
         ProgressStatus progressStatus = new SpinnerProgressStatus();
         progressStatus.show("Operation in progress");

         progressStatus.hide();

         assertThat(output).endsWith(CLEAR_LINE).doesNotContain("✓ ").doesNotContain("✗ ");
      }
   }

   @Nested
   @DisplayName("spinner state handling")
   class SpinnerStateHandling {

      @Test
      void shouldHandleMultipleShowCalls(CapturedOutput output) {
         ProgressStatus progressStatus = new SpinnerProgressStatus();
         progressStatus.show("First message");

         progressStatus.show("Second message");

         assertThat(output.toString()).contains("Second message");
         progressStatus.hide();
      }

      @Test
      void shouldHandleSuccessWhenNotRunning(CapturedOutput output) {
         ProgressStatus progressStatus = new SpinnerProgressStatus();

         progressStatus.success("Success without running");

         assertThat(output.toString()).doesNotContain("✓").doesNotContain("Success without running");
      }

      @Test
      void shouldHandleFailureWhenNotRunning(CapturedOutput output) {
         ProgressStatus progressStatus = new SpinnerProgressStatus();

         progressStatus.failure("Failure without running");

         assertThat(output.toString()).doesNotContain("✗").doesNotContain("Failure without running");
      }

      @Test
      void shouldHandleHideWhenNotRunning(CapturedOutput output) {
         ProgressStatus progressStatus = new SpinnerProgressStatus();

         String outputBefore = output.toString();
         progressStatus.hide();
         String outputAfter = output.toString();

         assertThat(outputAfter).isEqualTo(outputBefore);
      }
   }
}
```

</details>

## Benefits Beyond Aesthetics

This implementation provides several benefits:

1. **Improved User Experience**: Users now have visual feedback during operations
2. **Reduced Perceived Wait Time**: The animation makes waiting feel shorter
3. **Clear Operation Status**: Success and failure states are clearly indicated
4. **Architectural Consistency**: The solution follows JHipster's hexagonal architecture principles

## What next?

I am going to share how I integrated the ProgressStatus module into the JHipster Lite CLI for:

1. **Application Startup**: Shows "Loading JHipster Lite CLI" during initialization
2. **Command Execution**: Displays progress during command running
3. **Command Completion**: Shows success or failure messages with appropriate colors

The animation is now active for all major commands:
- Version command (--version)
- List command (list)
- Apply command (apply)

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
