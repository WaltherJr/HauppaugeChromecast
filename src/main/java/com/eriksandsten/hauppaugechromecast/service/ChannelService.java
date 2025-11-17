package com.eriksandsten.hauppaugechromecast.service;

import com.eriksandsten.hauppaugechromecast.domain.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

@Service
public class ChannelService {
    private static final Logger logger = LoggerFactory.getLogger(ChannelService.class);
    private static Channel CURRENTLY_ACTIVE_CHANNEL;

    public Channel getActiveChannel() {
        return CURRENTLY_ACTIVE_CHANNEL;
    }

    public void setActiveChannel(String channelName) {
        // this.CURRENTLY_ACTIVE_CHANNEL = Channel.fromKey(channelName);
        killAllCZapProcesses();
        spawnCZapProcess(channelName);
    }

    private void killAllCZapProcesses() {
        String[] command = { "killall", "czap" };

        try {
            ProcessBuilder builder = new ProcessBuilder(command);
            builder.redirectErrorStream(true); // Merge stdout and stderr
            Process process = builder.start();

            // Capture output
            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }

            int exitCode = process.waitFor();
            logger.info("'killall czap' exited with code: {}", exitCode);

        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }

    private void spawnCZapProcess(String channelName) {
        final String[] command = { "czap", "-r", channelName + "(Com Hem)" }; // Need to use the -r flag, else ffmpeg won't work!

        logger.info("Starting czap with channel '{}'", channelName);
        try {
            ProcessBuilder builder = new ProcessBuilder(command);
            builder.redirectErrorStream(true); // Merge stdout and stderr
            Process process = builder.start();

            new Thread(() -> {
                try (BufferedReader r = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                    String line;
                    while ((line = r.readLine()) != null) {
                        System.out.println("[czap] " + line);
                    }
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }).start();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
