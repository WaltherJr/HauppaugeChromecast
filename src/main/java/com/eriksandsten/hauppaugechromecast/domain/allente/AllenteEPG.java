package com.eriksandsten.hauppaugechromecast.domain.allente;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import java.util.List;

@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class AllenteEPG {
    private final String date;
    private final List<String> categories;
    private final List<Channel> channels;

    public AllenteEPG(String date, List<String> categories, List<Channel> channels) {
        this.date = date;
        this.categories = categories;
        this.channels = channels;
    }
}
