package com.eriksandsten.hauppaugechromecast.service;

import com.eriksandsten.hauppaugechromecast.repository.JsonRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.MissingNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ConfigService {
    private final JsonRepository configRepository = new JsonRepository("app-config.json");

    public String getValueFromKey(String key, String defaultValue) {
        JsonNode node = configRepository.getValueFromKey(key);
        return node instanceof MissingNode ? defaultValue : node.asText();
    }

    public String setValueByKey(String key, String value) {
        return configRepository.setValueByKey(key, value);
    }
}
