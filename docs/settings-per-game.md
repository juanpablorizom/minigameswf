# Per-game settings check

Room settings are rendered from `src/ui/gameSettings/GameSettingsRegistry.tsx` by the selected `gameId`.

Manual QA:

1. Select multiple games in a room.
2. Open room settings.
3. Expand each game card one at a time.
4. Confirm the expanded card only shows settings for that game.
5. Change Impostor theme and confirm Troll keeps its own category value.

Shared option lists are allowed when the saved value still lives under each game's own `settings.games[gameId]` branch.
