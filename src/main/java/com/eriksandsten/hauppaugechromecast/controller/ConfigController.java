package com.eriksandsten.hauppaugechromecast.controller;

import com.eriksandsten.hauppaugechromecast.domain.ConfigValue;
import com.eriksandsten.hauppaugechromecast.service.ConfigService;
import org.hibernate.validator.constraints.Length;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
public class ConfigController {
    private final ConfigService configService;

    @Autowired
    public ConfigController(ConfigService configService) {
        this.configService = configService;
    }

    @GetMapping(value = "/config", produces = "application/json")
    public ConfigValue getApplicationConfigValue(@RequestParam @Length(max=512) String key, @RequestParam(required = false) @Length(max=512) String defaultValue) {
        return new ConfigValue(key, configService.getValueFromKey(key, defaultValue));
    }

    @PatchMapping(value = "/config", produces = "application/json")
    public void setApplicationConfigValue(@RequestBody ConfigValue configValue) {
        configService.setValueByKey(configValue.key(), configValue.value());
    }
}
