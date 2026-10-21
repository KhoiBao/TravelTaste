package com.reviewdiadiem.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

public class SlugUtil {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");

    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }
        String normalized = Normalizer.normalize(input.trim().replace('đ', 'd').replace('Đ', 'D'), Normalizer.Form.NFD);
        String noDiacritics = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String lower = noDiacritics.toLowerCase();
        String noSpace = WHITESPACE.matcher(lower).replaceAll("-");
        String slug = NONLATIN.matcher(noSpace).replaceAll("-");
        slug = slug.replaceAll("-{2,}", "-");
        return slug.replaceAll("^-|-$", "");
    }

    public static String removeAccents(String input) {
        if (input == null) {
            return "";
        }
        String normalized = Normalizer.normalize(input.replace('đ', 'd').replace('Đ', 'D'), Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "").toLowerCase();
    }
}
