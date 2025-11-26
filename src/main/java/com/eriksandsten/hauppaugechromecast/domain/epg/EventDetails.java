package com.eriksandsten.hauppaugechromecast.domain.epg;

import java.util.List;

public record EventDetails (
     String title, String image, String description, Integer season, Integer episode, List<String> categories, String duration
) {}
