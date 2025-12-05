package com.eriksandsten.hauppaugechromecast.controller;

import com.eriksandsten.hauppaugechromecast.service.AllenteService;
import com.eriksandsten.hauppaugechromecast.domain.Constants;
import com.eriksandsten.hauppaugechromecast.service.ConfigService;
import com.eriksandsten.hauppaugechromecast.service.WebClientService;
import com.eriksandsten.hauppaugechromecast.domain.Channel;
import com.eriksandsten.hauppaugechromecast.domain.epg.EPG;
import com.eriksandsten.hauppaugechromecast.utils.GeneralHelper;
import com.eriksandsten.hauppaugechromecast.utils.I18NHelper;
import com.eriksandsten.hauppaugechromecast.utils.ProcessHelper;
import jakarta.validation.constraints.Pattern;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@Controller
public class MainController {
    private WebClientService webClientService;
    private AllenteService allenteService;
    private ConfigService configService;
    private I18NHelper i18NHelper;
    private GeneralHelper.Helper generalHelper;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;
    @Value("${app.main_left_panel_default_width}")
    private String leftPanelDefaultWidth;

    @Autowired
    public MainController(WebClientService webClientService, AllenteService allenteService, ConfigService configService, I18NHelper i18NHelper, ProcessHelper processHelper) {
        this.webClientService = webClientService;
        this.allenteService = allenteService;
        this.configService = configService;
        this.i18NHelper = i18NHelper;
        this.generalHelper = GeneralHelper.generalHelper(configService, processHelper);
    }

    @GetMapping("/")
    public String home(Model model, @RequestParam(name = "selectedChannel", required = false) final String selectedChannel) {
        if (activeProfile.equals(Constants.PROFILE_DEVELOPMENT)) {
            model.addAttribute("debug", "true");
        }

        String hightlightJSTheme = configService.getValueFromKey("highlight-js-theme", "");
        String mainLeftPanelWidth = configService.getValueFromKey("main-left-panel-width", leftPanelDefaultWidth);

        model.addAttribute("dvbAdapter", generalHelper.getConnectedDVBDevice());
        model.addAttribute("mainLeftPanelWidth", mainLeftPanelWidth);
        model.addAttribute("selectedChannel", selectedChannel);
        model.addAttribute("highlightJsTheme", hightlightJSTheme);
        model.addAttribute("channelsList", Channel.CHANNELS_LIST);
        model.addAttribute("i18nStrings", i18NHelper.getAllStrings());
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
