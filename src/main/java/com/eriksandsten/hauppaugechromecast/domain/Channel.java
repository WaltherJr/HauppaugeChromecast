package com.eriksandsten.hauppaugechromecast.domain;

import java.util.ArrayList;
import java.util.List;

public class Channel {
    private final String key;
    private final String name;
    private final String imageUrl;

    public static final List<Channel> CHANNELS_LIST = new ArrayList<>();
    static { CHANNELS_LIST.add(new Channel("SVT1", "SVT1", "https://new.static.tv.nu/47578019?forceFit=1&height=100&quality=50&width=100")); CHANNELS_LIST.add(new Channel("SVT2", "SVT2", "https://new.static.tv.nu/47578022?forceFit=1&height=100&quality=50&width=100")); CHANNELS_LIST.add(new Channel("TV3", "TV3", "https://new.static.tv.nu/47578023?forceFit=1&height=100&quality=50&width=100")); CHANNELS_LIST.add(new Channel("TV4", "TV4", "https://new.static.tv.nu/47578024?forceFit=1&height=100&quality=50&width=100")); CHANNELS_LIST.add(new Channel("KANAL_5", "Kanal 5", "")); }

    public Channel(String key, String name, String imageUrl) {
        this.key = key;
        this.name = name;
        this.imageUrl = imageUrl;
    }

    public String getKey() {
        return key;
    }

    public String getName() {
        return name;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public static Channel fromKey(String key) {
        return CHANNELS_LIST.stream().filter(channel -> channel.getKey().equals(key)).findFirst().orElse(null);
    }

    public static Channel fromName(String name) {
        return CHANNELS_LIST.stream().filter(channel -> channel.getName().equals(name)).findFirst().orElse(null);
    }
}
