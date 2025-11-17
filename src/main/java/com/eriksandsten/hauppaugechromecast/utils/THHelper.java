package com.eriksandsten.hauppaugechromecast.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.Locale;

@Component
public class THHelper {
    private static MessageSource messageSource;

    @Autowired
    public THHelper(MessageSource messageSource) {
        THHelper.messageSource = messageSource;
    }

    public static String i18n(String... words) {
        final Locale currentLocale = LocaleContextHolder.getLocale();

        final var wordsTranslated = new java.util.ArrayList<>(Arrays.stream(words).
        map(word -> {
            try {
                return messageSource.getMessage(word, new Object[]{}, currentLocale);
            } catch (NoSuchMessageException e) {
                return word; // Return the word non-translated, as-is
            }
        }).toList());

        final String firstWord = wordsTranslated.getFirst();
        wordsTranslated.set(0, firstWord.substring(0, 1).toUpperCase() + firstWord.substring(1));
        return String.join(" ", wordsTranslated);
    }
}
