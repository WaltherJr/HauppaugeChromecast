package com.eriksandsten.hauppaugechromecast.controller;

import com.eriksandsten.hauppaugechromecast.service.ChannelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChannelController {

    @Autowired
    private ChannelService channelService;

    @PutMapping("/current-channel")
    public void setCurrentChannel(@RequestParam(name = "requested-channel", required = true) String requestedChannel) {
    }


    @GetMapping("/current-channel")
    public String getCurrentChannel() {
        return "";
    }
}
