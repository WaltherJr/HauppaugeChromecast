package com.eriksandsten.hauppaugechromecast.domain;

import java.util.List;

public class DVBDevice {
    private String name;
    private String filename;
    private List<String> capabilities;
    private String currentDeliverySystem;
    private List<String> supportedDeliverySystems;
    private FrequencyRange frequencyRange;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public List<String> getCapabilities() {
        return capabilities;
    }

    public void setCapabilities(List<String> capabilities) {
        this.capabilities = capabilities;
    }

    public String getCurrentDeliverySystem() {
        return currentDeliverySystem;
    }

    public void setCurrentDeliverySystem(String currentDeliverySystem) {
        this.currentDeliverySystem = currentDeliverySystem;
    }

    public List<String> getSupportedDeliverySystems() {
        return supportedDeliverySystems;
    }

    public void setSupportedDeliverySystems(List<String> supportedDeliverySystems) {
        this.supportedDeliverySystems = supportedDeliverySystems;
    }

    public FrequencyRange getFrequencyRange() {
        return frequencyRange;
    }

    public void setFrequencyRange(FrequencyRange frequencyRange) {
        this.frequencyRange = frequencyRange;
    }
}
