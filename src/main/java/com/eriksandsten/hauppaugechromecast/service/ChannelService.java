package com.eriksandsten.hauppaugechromecast.service;

import com.eriksandsten.hauppaugechromecast.domain.Channel;
import com.eriksandsten.hauppaugechromecast.utils.ProcessHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChannelService {
    private static final Logger logger = LoggerFactory.getLogger(ChannelService.class);
    private final ProcessHelper processHelper;
    private static Channel CURRENTLY_ACTIVE_CHANNEL;

    @Autowired
    public ChannelService(ProcessHelper processHelper) {
        this.processHelper = processHelper;
    }

    public Channel getActiveChannel() {
        return CURRENTLY_ACTIVE_CHANNEL;
    }

    public void setActiveChannel(String channelName) {
        // this.CURRENTLY_ACTIVE_CHANNEL = Channel.fromKey(channelName);
        killAllCZapProcesses();
        spawnCZapProcess(channelName);
    }

    private void killAllCZapProcesses() {
        String[] command = {"killall", "czap"};
        processHelper.runCommand(command, logger);
    }

    private void spawnCZapProcess(String channelName) {
        // Need to use the -r flag, else ffmpeg won't work!);
        processHelper.startNewProcessInNewThread(new String[] {"czap", "-r", channelName + "(Com Hem)"}, "[czap]", null);
    }
}
