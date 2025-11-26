package com.eriksandsten.hauppaugechromecast.domain.epg;

import java.util.List;

public record Channel(String id, String icon, String name, List<Event> events) {}
