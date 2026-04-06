# Desi Ludo — Complete Project Description

## 1. Project Overview

**Desi Ludo** is a digital adaptation of the traditional Indian board game "Ludo" (also known as _Pachisi_ / _Chaupar_). Instead of a standard six-sided die, the game uses **Kawadi** — a set of four cowrie shells — to determine movement, staying true to the desi (Indian) roots of the game.

The project follows a **client–server architecture**:

- **Frontend** — A React + Phaser 3 single-page application that renders the board, manages UI interactions (player selection, kawadi throws, turn indicators), and animates piece movement.
- **Backend** — A C++ REST API server built with the [Crow](https://crowcpp.org) micro-framework. It acts as the **server-authoritative** game engine: it owns all game rules, validates every move, and returns canonical state to the client.

The frontend and backend communicate over **HTTP/JSON**. The client sends intents (create session, roll kawadi, move piece), and the server computes outcomes and returns results.

---

## 2. Game Rules (Desi Ludo with Kawadi)

### 2.1 Players & Pieces

- 2 to 4 players. Each player is assigned a color: **Red**, **Blue**, **Green**, or **Yellow**.
- Each player has **4 pieces** (tokens). All pieces start in the **Home** area.

### 2.2 Kawadi (Cowrie Shell Dice)

- Four cowrie shells are thrown each turn.
- Each shell lands either **front** (open side up) or **back** (closed side up).
- The **move value** is determined by counting the number of shells that land front-side up:
  - 1 front = move **1** step
  - 2 fronts = move **2** steps
  - 3 fronts = move **3** steps
  - 0 fronts (all backs) = move **4** steps (special roll)
- Certain values (like 4) may grant a **bonus turn** (house rules configurable on server).

### 2.3 Movement

- Pieces travel along a **clockwise ring path** on the board (20 cells in the current layout).
- A piece must be **entered onto the board** from Home before it can move.
- Pieces advance by the kawadi roll value along the path cells.

### 2.4 Capturing

- If a piece lands on a cell occupied by an opponent's piece, the opponent's piece is **sent back Home**.
- Certain cells are **safe squares** — no capture can occur on them.

### 2.5 Winning

- A piece that completes the full path reaches the **Finished** state.
- The first player to move all 4 pieces to Finished **wins the game**.

---

## 3. Tech Stack

| Layer              | Technology             | Purpose                                    |
| ------------------ | ---------------------- | ------------------------------------------ |
| Frontend Framework | React 19               | UI components, pages, state binding        |
| Game Engine        | Phaser 3               | 2D board rendering, piece sprites, animations |
| State Management   | Zustand                | Global game state (turns, players, kawadi)  |
| Styling            | Tailwind CSS 4 + custom CSS | Responsive dark-themed UI              |
| Build Tool         | Vite 7                 | Fast dev server, HMR, production bundling  |
| Language (client)  | TypeScript             | Type-safe frontend code                    |
| Backend Framework  | Crow (C++)             | Lightweight HTTP/JSON REST API             |
| Language (server)  | C++17                  | Server-authoritative game engine           |
| Communication      | HTTP REST + JSON       | Stateless request/response                 |

---

## 4. Project Structure

```
desi_ludo/
├── README.md
│
├── client/                         # Frontend application
│   ├── package.json                # Dependencies & scripts
│   ├── vite.config.ts              # Vite build configuration
│   ├── tsconfig.json               # TypeScript project config
│   ├── index.html                  # SPA entry HTML
│   │
│   ├── public/assets/              # Static game assets
│   │   ├── board/board.png         # Board background image
│   │   ├── pieces/                 # Player token sprites
│   │   │   ├── red.png
│   │   │   ├── blue.png
│   │   │   ├── green.png
│   │   │   └── yellow.png
│   │   └── shells/                 # Kawadi shell images
│   │       ├── shell_front.png
│   │       └── shell_back.png
│   │
│   └── src/
│       ├── main.tsx                # React DOM mount point
│       ├── App.tsx                 # Root component (routes StartMenu ↔ GamePage)
│       ├── index.css               # Global styles, CSS variables, animations
│       ├── App.css                 # (reserved)
│       │
│       ├── api/
│       │   └── gameApi.ts          # HTTP client (mock stubs → backend calls)
│       │
│       ├── types/
│       │   └── gameTypes.ts        # Shared TypeScript interfaces & types
│       │
│       ├── store/
│       │   └── gameStore.ts        # Zustand store (game state + actions)
│       │
│       ├── pages/
│       │   ├── StartMenu.tsx       # Player count selection → start game
│       │   └── GamePage.tsx        # Board + HUD layout during gameplay
│       │
│       ├── components/
│       │   ├── game/
│       │   │   ├── GameContainer.tsx   # Phaser canvas host (mount/destroy lifecycle)
│       │   │   └── KawadiArea.tsx      # Shell throw UI + move value display
│       │   └── ui/
│       │       ├── PlayerIndicator.tsx # Active player display + player chips
│       │       └── Button.tsx          # (reserved for shared button component)
│       │
│       ├── phaser/
│       │   ├── game.ts             # Phaser.Game factory (init/destroy)
│       │   ├── config/
│       │   │   └── gameConfig.ts   # Phaser config (700×700, scenes, physics)
│       │   ├── scenes/
│       │   │   ├── BootScene.ts    # Asset preloading (board, pieces, shells)
│       │   │   └── GameScene.ts    # Board rendering, cell markers
│       │   └── managers/
│       │       ├── PieceManager.ts # Piece spawning, movement tweens, highlighting
│       │       └── PlayerManager.ts# Player creation, turn cycling
│       │
│       └── utils/
│           ├── boardPath.ts        # Board cell grid, 20-cell clockwise path definition
│           └── helpers.ts          # (reserved for utility functions)
│
└── server/                         # Backend application (C++ / Crow)
    ├── BACKEND_SCHEMA.md           # Class design & API schema
    ├── CMakeLists.txt
    ├── main.cpp
    ├── include/
    │   ├── enums/GameEnums.h
    │   ├── models/
    │   │   ├── Piece.h
    │   │   ├── Player.h
    │   │   ├── Board.h
    │   │   ├── Kawadi.h
    │   │   └── GameSession.h
    │   ├── managers/
    │   │   ├── TurnManager.h
    │   │   └── SessionManager.h
    │   └── utils/JsonHelper.h
    └── src/
        ├── models/
        │   ├── Piece.cpp
        │   ├── Player.cpp
        │   ├── Board.cpp
        │   ├── Kawadi.cpp
        │   └── GameSession.cpp
        ├── managers/
        │   ├── TurnManager.cpp
        │   └── SessionManager.cpp
        └── utils/JsonHelper.cpp
```

---

## 5. Frontend — Detailed Breakdown

### 5.1 Entry Point & Routing

The app uses **conditional rendering** (no router library). The Zustand store's `started` flag determines which page is shown:

- `started === false` → **StartMenu** (player selection screen)
- `started === true` → **GamePage** (board + HUD)

**Flow:**

```
main.tsx → App.tsx → StartMenu.tsx  (user picks 2/3/4 players, clicks Start)
                  → GamePage.tsx   (board canvas + sidebar HUD)
```

### 5.2 State Management (Zustand Store)

The `gameStore.ts` is the single source of truth for the UI. It holds:

| State Field        | Type               | Description                                      |
| ------------------ | ------------------ | ------------------------------------------------ |
| `started`          | `boolean`          | Whether the game is in progress                  |
| `players`          | `number`           | Player count (2–4)                               |
| `playerOrder`      | `PlayerColor[]`    | Order of play, e.g. `["red", "blue"]`            |
| `activePlayerIndex`| `number`           | Index into `playerOrder` for current turn        |
| `kawadiValue`      | `number \| null`   | Last roll result (1–4), null if not rolled yet   |
| `shellFaces`       | `ShellFace[]`      | 4-element array of `"front"` / `"back"`          |
| `isRolling`        | `boolean`          | True during throw animation                      |
| `turnCount`        | `number`           | Increments each turn                             |
| `backendMode`      | `"mock" \| "live"` | Whether using local stubs or server API          |

**Actions:**

- `startGame(players)` — Calls API to create session, initializes state.
- `throwKawadiPreview()` — Calls API to roll shells, updates faces/value, advances turn.
- `resetGame()` — Returns to menu with default state.
- `getCurrentPlayer()` — Derives current player color from index.

### 5.3 API Layer

`gameApi.ts` currently contains **mock implementations** that simulate server responses with random data and artificial delays. These are designed to be swapped with real HTTP calls:

| Function                  | Mock Behavior                                    | Future Backend Call        |
| ------------------------- | ------------------------------------------------ | -------------------------- |
| `createSession(playerCount)` | Returns mock session ID + sliced color array  | `POST /api/session`        |
| `throwKawadi()`           | Randomizes 4 shell faces, computes move value    | `POST /api/session/{id}/roll` |

### 5.4 Phaser Game Engine

The Phaser instance is embedded inside React via `GameContainer.tsx`, which mounts a `<div>` and passes it as the Phaser `parent`. The Phaser lifecycle is:

1. **BootScene** — Preloads all image assets (board, 4 colored pieces, 2 shell faces).
2. **GameScene** — Renders the board image centered on a 700×700 canvas, draws cell markers at all 25 grid positions (5×5 grid).

**Managers (Phaser-side):**

- `PieceManager` — Spawns piece sprites at board path positions, handles movement tweens (`advance by N steps`), tint-based highlighting for selectable pieces.
- `PlayerManager` — Creates 2–4 players each with 4 pieces, tracks whose turn it is, cycles to next player.

### 5.5 Board Path System

`boardPath.ts` defines the game board topology:

- A **5×5 grid** maps to canvas coordinates (100px step, origin at 150,150).
- A **20-cell clockwise ring** is defined as the playable path:
  ```
  Top row (left→right):    (0,1) (0,2) (0,3) (0,4) (0,5)
  Right col (top→down):    (1,6) (2,6) (3,6) (4,6) (5,6)
  Bottom row (right→left): (6,5) (6,4) (6,3) (6,2) (6,1)
  Left col (bottom→up):    (5,0) (4,0) (3,0) (2,0) (1,0)
  ```
- Each cell has a unique ID like `"r0-c1"`, row/col coordinates, and canvas x/y position.
- Helper functions: `getBoardPathCell(index)`, `getBoardCellById(id)`.

### 5.6 UI & Styling

The interface follows a **dark premium theme** with CSS custom properties:

- Dark navy backgrounds with radial gradient accents
- Gold accent color (`#f6d88a`) for headings and active elements
- Glass-morphism cards with `backdrop-filter: blur()` and subtle borders
- Responsive layout: single column on mobile, 2-column grid (board + HUD) at 980px+
- Entry animation (`rise-in` keyframe) and shell toss animation (`toss` keyframe)

**Key UI Components:**

- **StartMenu** — Centered card with player count pills (2/3/4), Start button
- **GamePage** — Top bar (title + Back to Menu), board panel (Phaser canvas), HUD sidebar
- **PlayerIndicator** — Shows active player name with color, lists all player chips
- **KawadiArea** — 4-shell image grid, Throw button, move value display

---

## 6. Backend — Detailed Breakdown

### 6.1 Design Philosophy

The backend is **server-authoritative**: all game logic (shell randomization, move validation, capture detection, win checking) runs on the server. The client only sends intents and renders results. This prevents cheating and keeps rules centralized.

### 6.2 Class Hierarchy

```
SessionManager (Singleton)
  └── map<string, GameSession>

GameSession (Facade)
  ├── Board             (composition — path topology & movement rules)
  ├── Kawadi            (composition — shell dice RNG)
  ├── TurnManager       (composition — turn order & bonus turns)
  └── Player[]          (aggregation — 2 to 4 players)
        └── Piece[]     (composition — 4 pieces per player)
```

### 6.3 Core Classes

| Class              | Responsibility |
| ------------------ | -------------- |
| **`Piece`**        | Represents a single token. Tracks state (`Home`/`Active`/`Finished`) and board position. Transitions: `enterBoard()`, `advance()`, `finish()`, `sendHome()`. |
| **`Player`**       | Owns 4 `Piece` objects. Queries: `getActivePieces()`, `getHomePieces()`, `getMovablePieces()`, `hasWon()`. |
| **`Kawadi`**       | Encapsulates the 4-shell dice system. Uses `std::mt19937` for randomization. Computes move value (0 fronts = 4, else count of fronts). Determines bonus turn eligibility. |
| **`Board`**        | Owns the 20-cell path definition. Validates movement (`canMove()`), detects captures (`checkCapture()`), identifies safe squares (`isSafeSquare()`). |
| **`TurnManager`**  | Manages player turn order. Handles `advance()`, `grantBonusTurn()`, `skipCurrentPlayer()`. |
| **`GameSession`**  | Facade that orchestrates all above. Exposes two primary actions: `rollKawadi()` and `movePiece()`. Produces full JSON snapshots via `toJson()`. |
| **`SessionManager`** | Thread-safe Singleton. Creates, retrieves, and removes game sessions by ID. Uses `std::mutex` for concurrent access. |
| **`JsonHelper`**   | Utility namespace to serialize game structs into `crow::json::wvalue` objects. |

### 6.4 Enums

```
PlayerColor  : Red, Blue, Green, Yellow
ShellFace    : Front, Back
PieceState   : Home, Active, Finished
GamePhase    : WaitingToStart, InProgress, Finished
```

### 6.5 OOP Principles

| Principle                | Application |
| ------------------------ | ----------- |
| **Encapsulation**        | All classes hide internal state behind getters; `Kawadi` owns its RNG seed privately |
| **Composition**          | `GameSession` is composed of `Board`, `Kawadi`, `TurnManager`, and `Player` objects |
| **Single Responsibility**| Each class has one job: `Kawadi` rolls, `Board` validates paths, `TurnManager` sequences turns |
| **Singleton**            | `SessionManager` ensures one global session registry with thread safety |
| **Facade**               | `GameSession` provides simple `rollKawadi()` / `movePiece()` methods that internally coordinate 4+ subsystems |

---

## 7. REST API Specification

All endpoints use JSON request/response bodies. The server runs on port **8080**.

### 7.1 Create Session

```
POST /api/session
```

**Request:**

```json
{ "playerCount": 2 }
```

**Response (201):**

```json
{
  "sessionId": "a1b2c3d4-...",
  "playerOrder": ["red", "blue"]
}
```

### 7.2 Roll Kawadi

```
POST /api/session/{sessionId}/roll
```

**Response (200):**

```json
{
  "shellFaces": ["front", "back", "front", "back"],
  "moveValue": 2,
  "bonusTurn": false,
  "movablePieceIds": ["red-0", "red-2"]
}
```

### 7.3 Move Piece

```
POST /api/session/{sessionId}/move
```

**Request:**

```json
{ "pieceId": "red-0", "steps": 2 }
```

**Response (200):**

```json
{
  "movedPieceId": "red-0",
  "newPathIndex": 5,
  "captured": true,
  "capturedPieceId": "blue-1",
  "pieceFinished": false,
  "playerWon": false,
  "gameOver": false,
  "nextPlayerColor": "blue"
}
```

### 7.4 Get Game State

```
GET /api/session/{sessionId}
```

**Response (200):** Full game state JSON (players, pieces, positions, phase, turn count).

### 7.5 Error Responses

```json
{ "error": "session not found" }
```

Status codes: `400` (bad input), `404` (session not found).

---

## 8. Data Flow — Complete Game Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                        GAME LOOP                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. USER opens app                                              │
│     └─ StartMenu renders, user selects 2/3/4 players           │
│                                                                 │
│  2. USER clicks "Start Game"                                    │
│     └─ Client: POST /api/session { playerCount: N }            │
│     └─ Server: creates GameSession, returns sessionId + order  │
│     └─ Store: sets started=true, playerOrder, activeIndex=0    │
│     └─ UI: switches to GamePage, Phaser boots & renders board  │
│                                                                 │
│  3. ACTIVE PLAYER clicks "Throw Kawadi"                         │
│     └─ Client: POST /api/session/{id}/roll                     │
│     └─ Server: Kawadi.roll(), determines movable pieces        │
│     └─ Client: shows shell faces, move value, highlights       │
│        movable pieces on board                                  │
│                                                                 │
│  4. ACTIVE PLAYER selects a piece to move                       │
│     └─ Client: POST /api/session/{id}/move { pieceId, steps }  │
│     └─ Server: validates move, checks capture, checks win      │
│     └─ Client: animates piece tween, removes captured piece    │
│        if any, updates turn indicator                           │
│                                                                 │
│  5. TURN ADVANCES                                               │
│     ├─ If bonus turn → same player goes to step 3              │
│     └─ Else → next player in order, go to step 3               │
│                                                                 │
│  6. GAME ENDS when a player finishes all 4 pieces              │
│     └─ Server: sets gameOver=true, returns winner              │
│     └─ Client: displays win screen                              │
│                                                                 │
│  7. USER clicks "Back to Menu"                                  │
│     └─ Store: resetGame(), returns to StartMenu                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Current Status

### Completed (Frontend)

- Start menu with player count selection (2/3/4)
- Phaser 3 board rendering with cell markers on a 5×5 grid
- Kawadi throw UI with animated shell images and move value display
- Player turn indicator with color-coded chips
- Zustand state management with full game lifecycle (start, throw, reset)
- Mock API layer simulating server responses
- Responsive dark-themed UI with glass-morphism cards
- Asset pipeline: board image, 4 colored piece sprites, 2 shell face images
- PieceManager: spawning, movement tweens, tint highlighting
- PlayerManager: player creation, turn cycling

### Pending (Backend)

- Set up CMake project with Crow dependency
- Implement all model classes (`Piece`, `Player`, `Board`, `Kawadi`, `GameSession`)
- Implement manager classes (`TurnManager`, `SessionManager`)
- Implement JSON serialization (`JsonHelper`)
- Define Crow routes in `main.cpp`
- Connect frontend API layer (`gameApi.ts`) to real backend endpoints

### Pending (Integration)

- Replace mock API stubs with `fetch()` calls to `http://localhost:8080/api/...`
- Add CORS headers on Crow server
- Wire Phaser piece selection → `/move` endpoint
- Implement piece entering board from Home
- Safe squares, home stretch, and full win detection
- Reconnection support via `GET /api/session/{id}`

---

## 10. How to Run

### Frontend

```bash
cd client
npm install
npm run dev          # Starts Vite dev server (default: http://localhost:5173)
```

### Backend (once implemented)

```bash
cd server
mkdir build && cd build
cmake ..
make
./desi_ludo_server   # Starts Crow on http://localhost:8080
```

---

## 11. Dependencies

### Frontend

| Package     | Version  | Purpose                        |
| ----------- | -------- | ------------------------------ |
| react       | ^19.2.0  | UI framework                   |
| react-dom   | ^19.2.0  | DOM rendering                  |
| phaser      | ^3.90.0  | 2D game engine for board       |
| zustand     | ^5.0.11  | Lightweight state management   |
| tailwindcss | ^4.2.1   | Utility-first CSS framework    |
| vite        | ^7.3.1   | Build tool & dev server        |
| typescript  | ~5.9.3   | Type-safe JavaScript           |

### Backend

| Library               | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| Crow                  | C++ HTTP/JSON micro-framework                        |
| nlohmann/json (via Crow) | JSON serialization                                |
| C++17 STL             | `<random>`, `<mutex>`, `<unordered_map>`, `<memory>` |
