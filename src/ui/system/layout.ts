export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999
} as const;

export const layout = {
  maxWidth: 1040,
  compactWidth: 760,
  sectionGap: spacing.xl,
  groupGap: spacing.md,
  controlGap: spacing.sm,
  cardPadding: spacing.lg,
  screenPaddingX: spacing.lg,
  screenPaddingTop: spacing.lg,
  screenPaddingBottom: spacing.xxl
} as const;

export const controls = {
  minHeight: 56,
  compactMinHeight: 48,
  buttonPaddingY: 10,
  buttonPaddingX: 20,
  inputPaddingY: 14,
  inputPaddingX: 18,
  iconSize: 20
} as const;
