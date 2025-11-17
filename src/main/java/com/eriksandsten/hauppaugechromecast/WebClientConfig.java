package com.eriksandsten.hauppaugechromecast;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.json.JsonMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    public static WebClient.Builder defaultWebClientBuilder(WebClient.Builder webClientBuilder) {
        return webClientBuilder.codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024));
    }

    @Bean
    public JsonMapper jsonMapper() {
        return JsonMapper.builder()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, true) // TODO: Not working, FIX!
                .build();
    }
}
