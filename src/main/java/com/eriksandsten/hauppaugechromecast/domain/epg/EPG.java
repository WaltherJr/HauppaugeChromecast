package com.eriksandsten.hauppaugechromecast.domain.epg;

import java.util.List;

public record EPG (String date, List<String> categories, List<Channel> channels) {}