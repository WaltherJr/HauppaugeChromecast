package com.eriksandsten.hauppaugechromecast.service;

import com.eriksandsten.hauppaugechromecast.WebClientConfig;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class WebClientService<T> {
    public Mono<T> getExternalData(String url, Class<T> responseType) {
        return WebClientConfig.defaultWebClientBuilder(WebClient.builder())
                .baseUrl(url)
                .build()
                .get()
                .retrieve()
                .bodyToMono(responseType);
    }
}
