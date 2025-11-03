package com.eriksandsten.hauppaugechromecast.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class WebClientService<T> {

    @Autowired
    private WebClient.Builder webClientBuilder;

    public Mono<T> getExternalData(String url, Class<T> responseType) {
        return webClientBuilder.baseUrl(url)
                .build()
                .get()
                .retrieve()
                .bodyToMono(responseType);
    }
}
