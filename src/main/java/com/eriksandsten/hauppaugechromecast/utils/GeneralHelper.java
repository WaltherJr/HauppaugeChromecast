package com.eriksandsten.hauppaugechromecast.utils;

import com.eriksandsten.hauppaugechromecast.domain.DVBDevice;
import com.eriksandsten.hauppaugechromecast.domain.DVBDeviceBuilder;
import com.eriksandsten.hauppaugechromecast.service.ConfigService;
import com.eriksandsten.hauppaugechromecast.service.WebClientService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Configuration
public class GeneralHelper {
    @Bean(name = "generalHelper")
    public static Helper generalHelper(ConfigService configService, ProcessHelper processHelper) {
        return new Helper(configService, processHelper);
    }

    public static class Helper {
        private static final Logger logger = LoggerFactory.getLogger(GeneralHelper.class);
        private final ConfigService configService;
        private final ProcessHelper processHelper;
        private static final WebClientService<String> webClientService = new WebClientService<>();
        private static final Pattern p = Pattern.compile("<select id=\"theme-selector\">(.+?)</select>", Pattern.DOTALL);

        public Helper(ConfigService configService, ProcessHelper processHelper) {
            this.configService = configService;
            this.processHelper = processHelper;
        }

        public DVBDevice getConnectedDVBDevice() {
            String dvbFrontendOutput = processHelper.runCommand(new String[]{"dvb-fe-tool"}, logger, "src/main/cpp/dvb-utils");
            return new DVBDeviceBuilder(dvbFrontendOutput).build();
        }

        public String enumerateHighlightJSThemes() {
            String setTheme = configService.getValueFromKey("highlight-js-theme", null);
            String html = webClientService.getExternalData("https://highlightjs.org/examples", String.class).block();
            Matcher m = p.matcher(html);

            if (m.find()) {
                String noOptionsSelected = m.group(1).replaceAll(" selected=\"\"", "");
                return setTheme != null ? selectSetTheme(noOptionsSelected, setTheme) : noOptionsSelected;
            } else {
                return "";
            }
        }

        private String selectSetTheme(String html, String themeName) {
            return html.replaceFirst(">" + themeName + "</option>", " selected>" + themeName + "</option>");
        }
    }
}
