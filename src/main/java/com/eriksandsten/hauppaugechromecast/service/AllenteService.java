package com.eriksandsten.hauppaugechromecast.service;

import com.eriksandsten.hauppaugechromecast.domain.Channel;
import com.eriksandsten.hauppaugechromecast.domain.ChannelProgramme;
import com.eriksandsten.hauppaugechromecast.domain.epg.EPG;
import com.eriksandsten.hauppaugechromecast.exception.HttpBadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@Service
public class AllenteService {
    @Value("${allente_channels_api_url}")
    private String CHANNELS_API_URL;
    private WebClientService webClientService;
    private DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Autowired
    public AllenteService(WebClientService webClientService) {
        this.webClientService = webClientService;
    }

    public Map<Channel, List<ChannelProgramme>> currentTVCast;

    public EPG fetchAllenteEpg(String date) {
        validateDateString(date);

        final String url = UriComponentsBuilder
                .fromUriString(CHANNELS_API_URL)
                .queryParam("date", date == null ? LocalDate.now().toString() : date)
                // .queryParam("category-filter", "")
                .build()
                .toUriString();
        return (EPG) webClientService.getExternalData(url, EPG.class).block();
    }

    private void validateDateString(String date) {
        if (date != null) {
            try {
                dateFormatter.parse(date);
            } catch (DateTimeParseException e) {
                throw new HttpBadRequestException(e.getMessage());
            }
        }
    }
}
