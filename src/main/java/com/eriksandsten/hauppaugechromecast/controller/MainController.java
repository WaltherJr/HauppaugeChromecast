package com.eriksandsten.hauppaugechromecast.controller;

import com.eriksandsten.hauppaugechromecast.service.AllenteService;
import com.eriksandsten.hauppaugechromecast.domain.Constants;
import com.eriksandsten.hauppaugechromecast.service.WebClientService;
import com.eriksandsten.hauppaugechromecast.domain.Channel;
import com.eriksandsten.hauppaugechromecast.domain.allente.AllenteEPG;
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
    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    public MainController(WebClientService webClientService, AllenteService allenteService) {
        this.webClientService = webClientService;
        this.allenteService = allenteService;
    }

    @GetMapping("/")
    public String home(Model model, @RequestParam(name = "activeChannel", required = false) String activeChannel){
        if (activeProfile.equals(Constants.PROFILE_DEVELOPMENT)) {
            model.addAttribute("debug", "true");
        }

        model.addAttribute("activeChannel", activeChannel);
        model.addAttribute("channelsList", Channel.CHANNELS_LIST);

        return "home";
    }

    @GetMapping(value = "/chromecast-info", produces = "application/json")
    @ResponseBody
    public String fetchChromecastInfo(@RequestParam(name = "chromecast-info-url", required = true) String infoUrl) {
        Mono<String> info = webClientService.getExternalData(infoUrl, String.class);
        return info.block();
        // return Map.of("name", "John!");
    }

    @GetMapping(value = "/allente-epg", produces = "application/json")
    @ResponseBody
    public AllenteEPG fetchAllenteEpg() {
        return allenteService.fetchAllenteEpg();
    }
}
