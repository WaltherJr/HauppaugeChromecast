package com.eriksandsten.hauppaugechromecast.domain;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class DVBDeviceBuilderTest {
    private static final String dvbFrontendOutput = """
Device Silicon Labs Si2168 (/dev/dvb/adapter0/frontend0) capabilities:
     CAN_2G_MODULATION
     CAN_FEC_1_2
     CAN_FEC_2_3
     CAN_FEC_3_4
     CAN_FEC_5_6
     CAN_FEC_7_8
     CAN_FEC_AUTO
     CAN_GUARD_INTERVAL_AUTO
     CAN_HIERARCHY_AUTO
     CAN_INVERSION_AUTO
     CAN_MULTISTREAM
     CAN_MUTE_TS
     CAN_QAM_16
     CAN_QAM_32
     CAN_QAM_64
     CAN_QAM_128
     CAN_QAM_256
     CAN_QAM_AUTO
     CAN_QPSK
     CAN_TRANSMISSION_MODE_AUTO
DVB API Version 5.12, Current v5 delivery system: DVBT
Supported delivery systems:
    [DVBT]
     DVBT2
     DVBC/ANNEX_A
Frequency range for the current standard:
From:            48.0 MHz
To:               870 MHz
Step:            62.5 kHz
""";

    private static final List<String> expectedCapabilities;

    static {
        expectedCapabilities = new ArrayList<>();
        expectedCapabilities.addAll(Arrays.asList("""
CAN_2G_MODULATION
CAN_FEC_1_2
CAN_FEC_2_3
CAN_FEC_3_4
CAN_FEC_5_6
CAN_FEC_7_8
CAN_FEC_AUTO
CAN_GUARD_INTERVAL_AUTO
CAN_HIERARCHY_AUTO
CAN_INVERSION_AUTO
CAN_MULTISTREAM
CAN_MUTE_TS
CAN_QAM_16
CAN_QAM_32
CAN_QAM_64
CAN_QAM_128
CAN_QAM_256
CAN_QAM_AUTO
CAN_QPSK
CAN_TRANSMISSION_MODE_AUTO
                """.trim().split("\\s+")));
    }

    @Test
    void testBuilder() {
        DVBDevice device = new DVBDeviceBuilder(dvbFrontendOutput).build();

        Assertions.assertEquals("Silicon Labs Si2168", device.getName());
        Assertions.assertEquals("/dev/dvb/adapter0/frontend0", device.getFilename());
        Assertions.assertEquals(expectedCapabilities, device.getCapabilities());
        Assertions.assertEquals("DVBT", device.getCurrentDeliverySystem());
        Assertions.assertEquals(List.of("[DVBT]", "DVBT2", "DVBC/ANNEX_A"), device.getSupportedDeliverySystems());
    }
}
