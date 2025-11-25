package com.eriksandsten.hauppaugechromecast.utils;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class I18NHelperTest {

    @Test
    void testBuildString() {
        assertEquals("Aktuella kanal-program", I18NHelper.buildString("current", "channel", "-", "programmes"));
        assertEquals("Video URL:", I18NHelper.buildString("video", "url", ":"));
        assertEquals("Valt språk", I18NHelper.buildString("chosen", "language"));
        assertEquals("Valt språk", I18NHelper.buildString("chosen", "language"));
        assertEquals("Test av video-ström", I18NHelper.buildString("test{2}", "of", "video", "-[locale=sv-SE]", "stream{2}"));
    }
}
