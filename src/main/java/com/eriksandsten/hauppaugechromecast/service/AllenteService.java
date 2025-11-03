package com.eriksandsten.hauppaugechromecast.service;

import com.eriksandsten.hauppaugechromecast.domain.Channel;
import com.eriksandsten.hauppaugechromecast.domain.ChannelProgramme;
import com.eriksandsten.hauppaugechromecast.domain.allente.AllenteEPG;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class AllenteService {
    @Value("${allente_channels_api_url}")
    private String CHANNELS_API_URL;
    private WebClientService webClientService;

    @Autowired
    public AllenteService(WebClientService webClientService) {
        this.webClientService = webClientService;
    }

    public Map<Channel, List<ChannelProgramme>> currentTVCast;

    public AllenteEPG fetchAllenteEpg() {
        final String url = UriComponentsBuilder
                .fromUriString(CHANNELS_API_URL)
                .queryParam("date", LocalDate.now().toString())
                // .queryParam("category-filter", "")
                .build()
                .toUriString();
        return (AllenteEPG) webClientService.getExternalData(url, AllenteEPG.class).block();
    }
}
