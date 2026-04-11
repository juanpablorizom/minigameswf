# JUNTADA MVP Architecture

## Folder structure

- `src/bootstrap`
  App startup and global providers.
- `src/navigation`
  Route names, flow order, and top-level navigator composition.
- `src/state`
  Shared UI/app state for the shell MVP.
- `src/data`
  Mock fixtures that stand in for backend and multiplayer responses.
- `src/ui/components`
  Reusable presentational building blocks such as cards, buttons, badges, and screen wrappers.
- `src/ui/screens`
  Screen-level compositions for welcome, lobby, private room, game selection, settings, gameplay, and results.

## Navigation structure

- `welcome`
  Entry and lightweight login.
- `lobby`
  Main social landing area.
- `room`
  Private room overview and host control entry point.
- `chooseGames`
  Game selection flow.
- `roomSettings`
  Host pacing and room configuration flow.
- `gameplay`
  Active round surface.
- `results`
  End-of-session summary and replay loop.

The current navigator uses a local screen-flow model instead of a routing dependency. That keeps the MVP small while preserving a clean upgrade path to a real stack navigator later.

## Data flow

1. Mock fixtures live in `src/data/mockData.ts`.
2. `AppFlowProvider` owns the current screen, user profile, selected games, and room settings.
3. `AppNavigator` reads state and maps it to the current screen.
4. Screens remain presentational and receive state/actions from the app flow layer.
5. Future backend and socket data can replace the mock layer without rewriting screen composition.

## State management

Use one app-level context for shell state during MVP:

- user profile
- current screen
- room draft
  selected mini games
  room settings

This is enough for UI flow, avoids prop drilling across the app shell, and does not prematurely introduce a heavier store.

Future multiplayer state should be added in a separate session domain rather than mixed into generic UI state:

- `RoomSessionProvider`
  live players, ready states, host actions, room code, connection state
- `GameplaySessionProvider`
  active round, timer, prompts, answers, scores, realtime events

That split keeps shell state stable while multiplayer logic grows independently.

## Scalability path

When real services arrive, keep the boundaries:

- `src/data`
  replace mock data with API adapters and serializers
- `src/state`
  keep UI flow and local draft state
- `src/features` (future)
  introduce feature modules only when a domain becomes large enough to justify them

The intended next step is not more abstraction. It is to keep the presentational screens intact and swap the mock-backed state/actions with real room and gameplay services.
