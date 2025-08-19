- Fix [Add loading animation while the command is executed](https://github.com/seed4j/seed4j-cli/issues/13)

I would like to share a demo video showing the loading animation while using the `jhlite` in a possible real-world situation. As you can see, it already has a nice developer experience:

[<img width="421" height="52" alt="Image" src="https://github.com/user-attachments/assets/7564de88-da35-4d42-880c-3163c421e6f7" />](https://youtu.be/BNsp-5JTHkA)

[<img width="431" height="68" alt="Image" src="https://github.com/user-attachments/assets/79db4461-f6d2-4e84-b780-34f96ef18f43" />](https://youtu.be/BNsp-5JTHkA)

[<img width="428" height="97" alt="Image" src="https://github.com/user-attachments/assets/58f65bcc-c62e-4253-9951-8285959d59f4" />](https://youtu.be/BNsp-5JTHkA)

# [jhlite command line animation use demo (youtube link)](https://youtu.be/BNsp-5JTHkA)

A cool thing about this animation is that you don't mind if it takes a little bit longer because you can see different animations and progress. I included some curious details:

1) The icons on the right represent the technology and architecture used by JHLiteCli. I synchronized the animation, so it feels like you can see what is loading, but it's just an illusion.

2) If the Execute command takes a little bit longer, it shows the bow tie + lightning, which represents jhipster-lite. I designed the animation to match that style. It's not mandatory, but it's nice when synchronized.

At the end, I felt relaxed, and the loading time isn't as bothersome as before. :)

## Spinner Progress Module - Choices

### magic-progress library
I tried to use an existing spinner cli implementation called [magic-progress](https://github.com/lukfor/magic-progress) but I've got an error while running the `jhlite` command:

<img width="994" height="364" alt="Image" src="https://github.com/user-attachments/assets/1d11d0f3-248b-48ec-b087-d585147e5095" />

My first thought was to understand the error looking at the source code of the library, but I didn't find any tests and the project is not maintained anymore (last commit was in Aug 14, 2020).

### progressbar library
I tried to use [progressbar](https://github.com/ctongfei/progressbar) but does not have any spinner animations.

### I decided to implement my own spinner animation as a Spinner Progress Module

<details open>
<summary>Implementation checklist</summary>

#### Spinner Progress Module - Implementation checklist

##### Core Functionality
- [x] Create `SpinnerProgress` interface with essential methods
- [x] Implement basic spinner display with default "Processing" message
- [x] Support custom messages when showing spinner
- [x] Allow updating spinner message while running
- [x] Implement hide functionality to clear spinner without completion
- [x] Add success completion with checkmark symbol (✓) and message
- [x] Add failure completion with x symbol (✗) and message

##### Visual Enhancement
- [x] Implement rotating spinner animation with Unicode braille patterns
- [x] Add ANSI color support (cyan for spinner, green for success, red for failure)
- [x] Create dynamic suffix animations (dots, jhipster-lite ⧓⚡, hexagonal architecture 💎, Spring Boot 🍃)
- [x] Ensure proper line clearing to prevent visual artifacts
- [x] Handle terminal output gracefully (clear line when hiding)

##### Thread Management
- [x] Create daemon thread for animation to prevent blocking application
- [x] Implement proper thread scheduling with fixed rate execution
- [x] Ensure clean shutdown of executor service
- [x] Maintain thread safety with atomic state variables
- [x] Reset animation frames when stopping

##### Error Handling & Edge Cases
- [x] Handle multiple show calls appropriately
- [x] Manage state transitions correctly (show → update → hide/success/failure)
- [x] Gracefully handle operation calls when spinner is not running
- [x] Support concurrent operation in multi-threaded environments
- [x] Prevent memory leaks by proper cleanup of resources

##### Testing
- [x] Test spinner display with default and custom messages
- [x] Verify message updates work correctly
- [x] Confirm success and failure completion displays correctly
- [x] Validate proper spinner state handling
- [x] Test edge cases like multiple show calls and operations when not running

</details>

## Use the SpinnerProgress Module in the JHipster Lite CLI - Implementation Checklist

### ✅ Application Startup Progress Indication
- [x] Show "Loading JHipster Lite CLI" message with spinner animation during startup
- [x] Display "JHipster Lite CLI is ready" success message when application is fully loaded
- [x] Properly sequence startup messages before any command output

### ✅ Command Execution Progress Indicators
- [x] Show "Running command" message with spinner animation during command execution
- [x] Display "Command executed" success message when a command completes successfully
- [x] Show "Command failed" error message when a command fails
- [x] Ensure proper sequencing of progress messages and command output

### ✅ Progress Indication for Different Commands
- [x] Version command (--version)
  - [x] Show loading and success messages in correct order
  - [x] Display version information after success message
- [x] List command (list)
  - [x] Show loading and success messages in correct order
  - [x] Display available modules list after success message
- [x] Apply command (apply)
  - [x] Show loading message during initialization
  - [x] Display success message on successful module application
  - [x] Show failure message when required parameters are missing
  - [x] Maintain correct ordering of progress messages and command output

### ✅ Visual Styling
- [x] Use animated spinner for in-progress operations
- [x] Apply color coding for different message types (loading, success, failure)
- [x] Clear progress indicators when operations complete

Cc: @pascalgrimaud 
