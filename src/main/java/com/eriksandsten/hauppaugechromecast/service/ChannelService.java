package com.eriksandsten.hauppaugechromecast.service;

import com.eriksandsten.hauppaugechromecast.domain.Channel;
import org.springframework.stereotype.Service;

@Service
public class ChannelService {
    private static Channel CURRENTLY_ACTIVE_CHANNEL;

    public Channel getActiveChannel() {
        return CURRENTLY_ACTIVE_CHANNEL;
    }

    public void setActiveChannel(String channelKey) {
        this.CURRENTLY_ACTIVE_CHANNEL = Channel.fromKey(channelKey);
    }
}
