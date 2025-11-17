package com.eriksandsten.hauppaugechromecast.controller;

import com.eriksandsten.hauppaugechromecast.domain.Channel;
import com.eriksandsten.hauppaugechromecast.domain.Image;
import com.eriksandsten.hauppaugechromecast.service.ChannelService;
import com.eriksandsten.hauppaugechromecast.utils.ImageHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
public class ChannelController {
    private final ChannelService channelService;

    @Autowired
    public ChannelController(ChannelService channelService) {
        this.channelService = channelService;
    }

    @PutMapping("/current-channel")
    public void setCurrentChannel(@RequestBody UpdateCurrentChannelRequest request) {
        channelService.setActiveChannel(request.channelName());
    }

    @GetMapping("/programme-image")
    public Image getProgrammeImage(@RequestParam String imageUrl) {
        return ImageHelper.fetchImage(imageUrl);
    }

    @GetMapping("/current-channel")
    public Channel getCurrentChannel() {
        return channelService.getActiveChannel();
    }
}
