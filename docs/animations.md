# Animation Strategy

MiniGamesWF uses React Native `Animated` for the shared web and Android path.

- Use `useNativeDriver: true` for transform and opacity loops.
- Prefer `Animated.loop(Animated.sequence([...]))` for ambient drift, bobbing, pulse, and small feedback.
- Stop every long-running animation in the `useEffect` cleanup.
- Do not animate layout values such as width, height, padding, or border radius.
- Color animation is reserved for web-only or non-native-driver cases; use it sparingly.
- Lottie is intentionally postponed until final motion assets exist. The current production path is lightweight `Animated` primitives.

Current implemented animations:

- Ambient background drift and floating character bobbing.
- Results celebration burst.
- Active player pulse in gameplay.
