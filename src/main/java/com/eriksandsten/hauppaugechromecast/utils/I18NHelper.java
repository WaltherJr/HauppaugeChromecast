package com.eriksandsten.hauppaugechromecast.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class I18NHelper {
    static MessageSource messageSource;
    private static Pattern dslRegex = Pattern.compile("^(.+)\\[([^]]+)]$");

    @Autowired
    public I18NHelper(MessageSource messageSource) {
        I18NHelper.messageSource = messageSource;
    }

    public static String buildString(String... words) {
        return joinStrings(buildWordList(words), " ");
    }

    public static String buildStringWithoutDelimiter(String... words) {
        return joinStrings(buildWordList(words), "");
    }

    private static List<String> buildWordList(String... words) {
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
        return wordsTranslated;
    }

    private static void handleSingleWord(AtomicInteger i, List<String> words, Deque<String> queue, String currentWord) {
        if ("-".equals(currentWord)) {
            if (i.get() == words.size() - 1) {
                throw new IllegalArgumentException("Can't end with a \"-\" or \":\"");
            } else {
                queue.add(queue.removeLast() + "-" + words.get(i.get() + 1));
                i.set(i.incrementAndGet());
            }

        } else if (":".equals(currentWord)) {
            queue.add(queue.removeLast() + ":"); // TODO:
            i.set(i.incrementAndGet());

        } else {
            queue.add(currentWord);
        }
    }

    private static String joinStrings(List<String> words, String delimiter) {
        Deque<String> queue = new ArrayDeque<>();

        for (AtomicInteger i = new AtomicInteger(0); i.get() < words.size(); i.getAndIncrement()) {
            final String currentWord = words.get(i.get());

            if (currentWord.endsWith("]")) {
                // Could be a complex word with parameters
                Matcher m = dslRegex.matcher(currentWord);

                if (m.matches()) {
                    final String newCurrentWord = m.group(1);
                    final Map<String, String> wordParams = extractWordParams(m);

                    for (Map.Entry<String, String> param : wordParams.entrySet()) {
                        if (handleWordParameter(param)) {
                            // Include the word
                            handleSingleWord(i, words, queue, newCurrentWord);
                        }
                    }
                }
            } else {
                // Simple word
                handleSingleWord(i, words, queue, currentWord);
            }
        }

        return String.join(delimiter, queue);
    }

    private static Map<String, String> extractWordParams(Matcher matcher) {
        String[] parts = matcher.group(2).split("=");
        Map<String, String> wordParams = new HashMap<>();

        if (parts.length % 2 != 0) {
            throw new IllegalArgumentException("Key-value is not matched in DSL");
        }

        for (int j = 0; j < parts.length; j += 2) {
            wordParams.put(parts[j], parts[j + 1]);
        }

        return wordParams;
    }

    private static boolean handleWordParameter(Map.Entry<String, String> param) {
        if (param.getKey().equals("locale")) {
            return handleLocaleParam(param.getValue());
        } else {
            return true;
        }
    }

    private static boolean handleLocaleParam(String paramValue) {
        // TODO: Should be able to say "[locale=!sv-SE]" etc.
        final Locale currentLocale = LocaleContextHolder.getLocale();
        return currentLocale.toLanguageTag().equals(paramValue);
    }
}
