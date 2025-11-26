package com.eriksandsten.hauppaugechromecast.domain.epg;

public record Event (String id, Boolean live, String time, String title, EventDetails details) {}