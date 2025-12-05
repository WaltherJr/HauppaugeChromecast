package com.eriksandsten.hauppaugechromecast.domain;

import java.util.Arrays;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DVBDeviceBuilder {
    private final String supportedDeliverySystemsStr = "Supported delivery systems:";
    private final String capabilitiesStr = "capabilities:";

    private final Pattern deviceNameAndFileNameRegex = Pattern.compile("Device (?<deviceName>.+) \\((?<deviceFileName>.+)\\)");
    private final Pattern capabilitiesAndDeliverySystemsRegex = Pattern.compile("( {2,}[\\[\\]A-Z0-9/_]+\\n)+", Pattern.DOTALL);
    private final Pattern currentDeliverySystemRegex = Pattern.compile("Current v5 delivery system: (?<systemName>[A-Z0-9/_]+)");

    private final String dvbFrontendOutput;
    private final DVBDevice dvbDevice;

    public DVBDeviceBuilder(String dvbFrontendOutput) {
        this.dvbFrontendOutput = dvbFrontendOutput;
        this.dvbDevice = new DVBDevice();
    }

    public DVBDevice build() {
        setDeviceNameAndFileName();
        setCurrentDeliverySystem();
        setSupportedDeliverySystems();
        setDeviceCapabilities();

        return dvbDevice;
    }

    void setDeviceNameAndFileName() {
        final Matcher m = deviceNameAndFileNameRegex.matcher(dvbFrontendOutput);

        if (m.find()) {
            dvbDevice.setName(m.group("deviceName"));
            dvbDevice.setFilename(m.group("deviceFileName"));
        }
    }

    void setCurrentDeliverySystem() {
        final Matcher m = currentDeliverySystemRegex.matcher(dvbFrontendOutput);

        if (m.find()) {
            dvbDevice.setCurrentDeliverySystem(m.group("systemName"));
        }
    }

    private void setSupportedDeliverySystems() {
        int start = dvbFrontendOutput.indexOf(supportedDeliverySystemsStr) + supportedDeliverySystemsStr.length();
        Matcher m = capabilitiesAndDeliverySystemsRegex.matcher(dvbFrontendOutput);

        if (m.find(start)) {
            final String allMatches = m.toMatchResult().group(0);
            dvbDevice.setSupportedDeliverySystems(Arrays.asList(allMatches.trim().split("\\s+")));
        }

    }

    private void setDeviceCapabilities() {
        int start = dvbFrontendOutput.indexOf(capabilitiesStr) + capabilitiesStr.length();
        Matcher m = capabilitiesAndDeliverySystemsRegex.matcher(dvbFrontendOutput);

        if (m.find(start)) {
            final String allMatches = m.toMatchResult().group(0);
            dvbDevice.setCapabilities(Arrays.asList(allMatches.trim().split("\\s+")));
        }

    }
}
