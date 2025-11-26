package com.eriksandsten.hauppaugechromecast.controller;

import com.eriksandsten.hauppaugechromecast.repository.HauppaggeChromecastRepository;
import com.eriksandsten.hauppaugechromecast.service.AllenteService;
import com.eriksandsten.hauppaugechromecast.domain.Constants;
import com.eriksandsten.hauppaugechromecast.service.WebClientService;
import com.eriksandsten.hauppaugechromecast.domain.Channel;
import com.eriksandsten.hauppaugechromecast.domain.epg.EPG;
import jakarta.validation.constraints.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import reactor.core.publisher.Mono;

@Controller
public class MainController {

    private WebClientService webClientService;
    private AllenteService allenteService;
    private HauppaggeChromecastRepository hauppaggeChromecastRepository;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    public MainController(WebClientService webClientService, AllenteService allenteService, HauppaggeChromecastRepository hauppaggeChromecastRepository) {
        this.webClientService = webClientService;
        this.allenteService = allenteService;
        this.hauppaggeChromecastRepository = hauppaggeChromecastRepository;
    }

    @GetMapping("/db")
    public String getDBValue() {
        return hauppaggeChromecastRepository.test();
    }

    @GetMapping("/")
    public String home(Model model, @RequestParam(name = "selectedChannel", required = false) final String selectedChannel) {
        if (activeProfile.equals(Constants.PROFILE_DEVELOPMENT)) {
            model.addAttribute("debug", "true");
        }

        model.addAttribute("selectedChannel", selectedChannel);
        model.addAttribute("channelsList", Channel.CHANNELS_LIST);

        return "home";
    }

    @GetMapping(value = "/chromecast-info", produces = "application/json")
    @ResponseBody
    public String fetchChromecastInfo(@RequestParam(name = "chromecast-info-url", required = true) final String infoUrl) {
        Mono<String> info = webClientService.getExternalData(infoUrl, String.class);
        return info.block();
        // return Map.of("name", "John!");
    }

    @GetMapping(value = "/allente-epg", produces = "application/json")
    @ResponseBody
    public EPG fetchAllenteEpg(@RequestParam @Pattern(regexp = "^[0-9]{4}-[0-9]{2}-[0-9]{2}$") final String date) {
        return allenteService.fetchAllenteEpg(date);
    }
}
