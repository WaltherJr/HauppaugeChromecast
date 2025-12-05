package com.eriksandsten.hauppaugechromecast.utils;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class I18NHelperTest {

    @Test
    void testBuildCapitalizedString() {
        assertEquals("Aktuella kanal-program", I18NHelper.buildCapitalizedString("current", "channel", "-", "programmes"));
        assertEquals("Video URL:", I18NHelper.buildCapitalizedString("video", "url", ":"));
        assertEquals("Valt språk", I18NHelper.buildCapitalizedString("chosen", "language"));
        assertEquals("Valt språk", I18NHelper.buildCapitalizedString("chosen", "language"));
        assertEquals("Test av video-ström", I18NHelper.buildCapitalizedString("testing", "of", "video", "-[locale=sv-SE]", "stream{2}"));
    }
}
