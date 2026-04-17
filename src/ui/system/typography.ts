export const typography = {
  micro: 12,
  caption: 13,
  body: 16,
  bodyLarge: 18,
  section: 22,
  title: 34,
  hero: 48
} as const;

export const textStyles = {
  hero: {
    fontSize: typography.hero,
    lineHeight: 54,
    letterSpacing: -1.1,
    fontWeight: '800' as const
  },
  title: {
    fontSize: typography.title,
    lineHeight: 40,
    letterSpacing: -0.8,
    fontWeight: '800' as const
  },
  section: {
    fontSize: typography.section,
    lineHeight: 28,
    letterSpacing: -0.4,
    fontWeight: '700' as const
  },
  body: {
    fontSize: typography.body,
    lineHeight: 24,
    letterSpacing: -0.1,
    fontWeight: '500' as const
  },
  bodyStrong: {
    fontSize: typography.body,
    lineHeight: 22,
    letterSpacing: -0.1,
    fontWeight: '700' as const
  },
  caption: {
    fontSize: typography.caption,
    lineHeight: 18,
    letterSpacing: 0,
    fontWeight: '600' as const
  }
} as const;

export const textRoles = {
  textPrimary: 'Main content and headings.',
  textSecondary: 'Supporting descriptions and secondary explanations.',
  textMuted: 'Hints, placeholders, and low-priority metadata.'
} as const;
