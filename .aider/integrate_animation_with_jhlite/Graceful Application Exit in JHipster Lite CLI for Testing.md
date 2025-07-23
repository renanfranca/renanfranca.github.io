

# Graceful Application Exit in JHipster Lite CLI for Testing

## Understanding Exit Management in CLI Applications

When building CLI applications with Spring Boot, handling the application exit properly is crucial for maintaining clean application shutdown and reporting accurate exit codes to the calling environment. [JHipster Lite CLI](https://github.com/jhipster/jhipster-lite-cli) provides an elegant solution to this challenge through its exit module.

## The Exit Module Architecture

JHipster Lite CLI uses a clean separation of concerns to handle application exit through two key interfaces:

```java
// Handles exiting the JVM with appropriate exit code
public interface SystemExit {
  void exit(int exitCode);
}

// Obtains exit code from Spring application context
public interface SpringApplicationExit {
  int exit(ApplicationContext context);
}
```

These interfaces are implemented by concrete classes:

```java
@Component
@ExcludeFromGeneratedCodeCoverage(reason = "Not testing actual System exit")
class RealSystemExit implements SystemExit {
  @Override
  public void exit(int exitCode) {
    System.exit(exitCode);
  }
}

@Component
@ExcludeFromGeneratedCodeCoverage(reason = "Not testing actual SpringApplication exit")
class RealSpringApplicationExit implements SpringApplicationExit {
  @Override
  public int exit(ApplicationContext context) {
    return SpringApplication.exit(context);
  }
}
```

## How Exit Is Managed in JHLiteCliApp

The `JHLiteCliApp` class shows how these components are used together:

```java
public static void main(String[] args) {
  SpinnerProgress spinnerProgress = SpinnerProgressProvider.get();
  spinnerProgress.show("Loading JHipster Lite CLI");

  ConfigurableApplicationContext context = new SpringApplicationBuilder(JHLiteCliApp.class)
    .bannerMode(Banner.Mode.OFF)
    .web(WebApplicationType.NONE)
    .lazyInitialization(true)
    .listeners(event -> handleApplicationEvent(event, spinnerProgress))
    .run(args);

  // Get exit components from Spring context
  SystemExit systemExit = context.getBean(SystemExit.class);
  SpringApplicationExit springApplicationExit = context.getBean(SpringApplicationExit.class);

  // Get exit code from Spring context
  int exitCode = springApplicationExit.exit(context);

  // Exit the application with appropriate code
  systemExit.exit(exitCode);
}
```

This two-step process provides several benefits:
1. The exit code is determined by Spring's context, capturing any potential issues during execution
2. The actual system exit is isolated in a dedicated component
3. The code is more testable as we can mock both components

## Testing Without System Exit

Testing code that calls `System.exit()` is challenging as it would terminate the JVM running the tests. The `JHLiteCliAppTest` handles this elegantly by providing mock implementations:

```java
@Configuration
static class TestConfiguration {
  @Bean
  @Primary
  SystemExit systemExit() {
    return mock(SystemExit.class);
  }

  @Bean
  @Primary
  SpringApplicationExit springApplicationExit() {
    return mock(SpringApplicationExit.class);
  }
}
```

By using `@Primary` annotated mock beans, the test configuration ensures that during tests:
1. `SpringApplicationExit` returns a controlled exit code without analyzing the real application state
2. `SystemExit` is called but doesn't actually terminate the JVM

This approach allows comprehensive testing of the application's startup and command execution flow without premature test termination.

## Benefits of This Approach

1. **Separation of Concerns**: Each component has a single responsibility
2. **Testability**: The system exit logic can be easily mocked
3. **Proper Exit Codes**: The application correctly propagates exit codes to the operating system
4. **Clean Shutdown**: Spring's context is properly closed before exiting

This pattern exemplifies how interfaces and dependency injection can make even seemingly difficult-to-test functionality like system exit manageable in tests while maintaining clean production code.

## Some failed attempts

I tried some approaches to prevent the application from exiting when running the tests before I came up with the solution using interfaces, which is perfect for this scenario, where the tests do not need to test the exit code.

### SecurityManager

I tried to use the SecurityManager to prevent the application from exiting when running the tests, but it wasn't a good approach because [SecurityManager is deprecated](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/SecurityManager.html). There is an open source project that uses SecurityManager to prevent the application from exiting called [system-lambda](https://github.com/stefanbirkner/system-lambda).

### ProcessBuilder

I used ProcessBuilder to run the application in another process and capture the console output which I used to implement the test assertions. It works fine but than I realized that jacoco agent couldn't look at this new process created by ProcessBuilder, So It could not generate code coverage for the new process.

<details>
<summary>See the JHLiteCliAppTest implementation using ProcessBuilder</summary>

```java	
package tech.jhipster.lite.cli;

import static org.assertj.core.api.Assertions.assertThat;
import static tech.jhipster.lite.TestProjects.newTestFolder;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

@IntegrationTest
class JHLiteCliAppTest {

  private static final String LOADING_COMPLETE_MESSAGE = "JHipster Lite CLI is ready";
  private static final String COMMAND_SUCCESS_MESSAGE = "Command executed";
  private static final String COMMAND_FAILURE_MESSAGE = "Command failed";
  private static final String VERSION_INFO_PREFIX = "JHipster Lite CLI v";
  private static final String AVAILABLE_JHIPSTER_LITE_MODULES = "Available jhipster-lite modules";
  private static final String MISSING_REQUIRED_OPTIONS = "Missing required options";

  @Nested
  @DisplayName("spinner progress messages")
  class SpinnerProgressMessages {

    @Test
    void shouldShowMessagesInCorrectOrderWhenRunningVersionCommand() throws Exception {
      ProcessBuilder processBuilder = createCommandProcess("--version");
      processBuilder.redirectErrorStream(true);

      Process process = processBuilder.start();
      boolean completed = process.waitFor(30, TimeUnit.SECONDS);
      String output = captureProcessOutput(process);

      assertThat(completed).isTrue();
      System.out.println(output);
      assertThat(output).contains(LOADING_COMPLETE_MESSAGE);
      assertThat(output).contains(COMMAND_SUCCESS_MESSAGE);
      int loadingCompletePosition = output.indexOf(LOADING_COMPLETE_MESSAGE);
      int commandSuccessPosition = output.indexOf(COMMAND_SUCCESS_MESSAGE);
      int versionInfoPosition = output.indexOf(VERSION_INFO_PREFIX);
      assertThat(loadingCompletePosition).isPositive();
      assertThat(commandSuccessPosition).isPositive();
      assertThat(versionInfoPosition).isPositive();
      assertThat(loadingCompletePosition)
        .withFailMessage("'%s' message should appear before '%s'".formatted(LOADING_COMPLETE_MESSAGE, COMMAND_SUCCESS_MESSAGE))
        .isLessThan(commandSuccessPosition);
      assertThat(commandSuccessPosition)
        .withFailMessage("'%s' message should appear before '%s'".formatted(COMMAND_SUCCESS_MESSAGE, VERSION_INFO_PREFIX))
        .isLessThan(versionInfoPosition);
    }

    @Test
    void shouldShowMessagesInCorrectOrderWhenRunningListCommand() throws Exception {
      ProcessBuilder processBuilder = createCommandProcess("list");
      processBuilder.redirectErrorStream(true);

      Process process = processBuilder.start();
      boolean completed = process.waitFor(30, TimeUnit.SECONDS);
      String output = captureProcessOutput(process);

      assertThat(completed).isTrue();
      System.out.println(output);
      assertThat(output).contains(LOADING_COMPLETE_MESSAGE);
      assertThat(output).contains(COMMAND_SUCCESS_MESSAGE);
      int loadingCompletePosition = output.indexOf(LOADING_COMPLETE_MESSAGE);
      int commandSuccessPosition = output.indexOf(COMMAND_SUCCESS_MESSAGE);
      int availableJHipsterLiteModulesPosition = output.indexOf(AVAILABLE_JHIPSTER_LITE_MODULES);
      assertThat(loadingCompletePosition)
        .withFailMessage("'%s' message should appear before '%s'".formatted(LOADING_COMPLETE_MESSAGE, COMMAND_SUCCESS_MESSAGE))
        .isLessThan(commandSuccessPosition);
      assertThat(commandSuccessPosition)
        .withFailMessage("'%s' message should appear before '%s'".formatted(COMMAND_SUCCESS_MESSAGE, AVAILABLE_JHIPSTER_LITE_MODULES))
        .isLessThan(availableJHipsterLiteModulesPosition);
    }

    @Test
    void shouldShowMessagesInCorrectOrderWhenRunningApplyInitCommandWithoutParameters() throws Exception {
      ProcessBuilder processBuilder = createCommandProcess("apply", "init", "--project-path", newTestFolder());
      processBuilder.redirectErrorStream(true);

      Process process = processBuilder.start();
      boolean completed = process.waitFor(30, TimeUnit.SECONDS);
      String output = captureProcessOutput(process);

      assertThat(completed).isTrue();
      System.out.println(output);
      assertThat(output).contains(LOADING_COMPLETE_MESSAGE);
      assertThat(output).contains(COMMAND_FAILURE_MESSAGE);
      int loadingCompletePosition = output.indexOf(LOADING_COMPLETE_MESSAGE);
      int commandFailurePosition = output.indexOf(COMMAND_FAILURE_MESSAGE);
      int missingRequiredOptionsPosition = output.indexOf(MISSING_REQUIRED_OPTIONS);
      assertThat(loadingCompletePosition)
        .withFailMessage("'%s' message should appear before '%s'".formatted(LOADING_COMPLETE_MESSAGE, COMMAND_FAILURE_MESSAGE))
        .isLessThan(commandFailurePosition);
      assertThat(commandFailurePosition)
        .withFailMessage("'%s' message should appear before '%s'".formatted(COMMAND_FAILURE_MESSAGE, MISSING_REQUIRED_OPTIONS))
        .isLessThan(missingRequiredOptionsPosition);
    }

    @Test
    void shouldShowMessagesInCorrectOrderWhenRunningApplyInitCommandWithRequiredParameters() throws Exception {
      ProcessBuilder processBuilder = createCommandProcess(
        "apply",
        "init",
        "--project-path",
        newTestFolder(),
        "--base-name",
        "jhipsterSampleApplication",
        "--project-name",
        "JHipster Sample Application"
      );
      processBuilder.redirectErrorStream(true);

      Process process = processBuilder.start();
      boolean completed = process.waitFor(30, TimeUnit.SECONDS);
      String output = captureProcessOutput(process);

      assertThat(completed).isTrue();
      System.out.println(output);
      assertThat(output).contains(LOADING_COMPLETE_MESSAGE);
      assertThat(output).contains(COMMAND_SUCCESS_MESSAGE);
      int loadingCompletePosition = output.indexOf(LOADING_COMPLETE_MESSAGE);
      int commandSuccessPosition = output.indexOf(COMMAND_SUCCESS_MESSAGE);
      assertThat(loadingCompletePosition)
        .withFailMessage("'%s' message should appear before '%s'".formatted(LOADING_COMPLETE_MESSAGE, COMMAND_SUCCESS_MESSAGE))
        .isLessThan(commandSuccessPosition);
      assertThat(output.trim()).endsWith(COMMAND_SUCCESS_MESSAGE);
    }
  }

  private ProcessBuilder createCommandProcess(String... command) {
    String javaPath = System.getProperty("java.home") + "/bin/java";
    String classpath = System.getProperty("java.class.path");

    List<String> processCommand = new ArrayList<>();
    processCommand.add(javaPath);
    processCommand.add("-cp");
    processCommand.add(classpath);
    processCommand.add(JHLiteCliApp.class.getName());
    processCommand.addAll(Arrays.asList(command));

    return new ProcessBuilder(processCommand);
  }

  private String captureProcessOutput(Process process) throws Exception {
    try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
      return reader.lines().collect(Collectors.joining(System.lineSeparator()));
    }
  }
}
```

</details>




### Rewrite the bytecode

I found an open source project called [junit5-system-exit](https://github.com/tginsberg/junit5-system-exit) that rewrites the bytecode of the application to prevent the application from exiting when running the tests. So the jacoco agent could look at the new bytecode and generate code coverage correctly. But I had to rewrite the bytecode of the application, and I didn't like I,t and in the FAQ section of the project it says:

> ❓ JaCoCo issues a warning - "Execution data for class does not match"
This happens when JaCoCo's Java Agent runs after this one. The instructions above should put this agent after JaCoCo but things change over time, and there are probably more gradle configurations that I have not tested. If you run into this and are confident that you followed the instructions above, please reach out to me with a minimal example and I will see what I can do.

> ❓ JaCoCo coverage is not accurate
Because this Java Agent rewrites bytecode and must run after JaCoCo, there will be discrepancies in the JaCoCo Report. I have not found a way to account for this, but if you discover something please let me know!

So I decided not to take this approach.

