package com.eriksandsten.hauppaugechromecast.domain.allente;

public record Event (
    String id, Boolean live, String time, String title, EventDetails details
) {}