package com.eriksandsten.hauppaugechromecast.utils;

import org.slf4j.Logger;
import org.springframework.stereotype.Component;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.concurrent.ExecutorService;
import java.util.stream.Collectors;

@Component
public class ProcessHelper {
    public String runCommand(String[] command, Logger logger) {
        return runCommand(command, logger, null);
    }

    public String runCommand(String[] command, Logger logger, String workingDir) {
        String commandString = String.join(" ", command);

        try {
            ProcessBuilder builder = new ProcessBuilder(command);

            if (workingDir != null) {
                builder.directory(new File(workingDir));
            }
            builder.redirectErrorStream(true); // Merge stdout and stderr
            Process process = builder.start();
            int exitCode = process.waitFor();
            String stdOutput = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            logger.info("\"" + commandString + "\" exited with code: {}", exitCode);
            return stdOutput;

        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            return null;
        }
    }

    public void startNewProcessInNewThread(String[] command, String processPrefix, ExecutorService executorService) {
        try {
            ProcessBuilder builder = new ProcessBuilder(command);
            builder.redirectErrorStream(true); // Merge stdout and stderr
            Process process = builder.start();

            if (executorService != null) {
                executorService.submit(createRunnable(processPrefix, process));
            } else {
                new Thread(createRunnable(processPrefix, process)).start();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private Runnable createRunnable(String processPrefix, Process process) {
        return () -> {
            try (BufferedReader r = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = r.readLine()) != null) {
                    System.out.println(processPrefix + " " + line);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        };
    }
}
