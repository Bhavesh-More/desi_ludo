# Challas Aath — How It Works

A complete technical description of the Desi Ludo (Challas Aath) game system, covering backend architecture, frontend structure, and the full request/response lifecycle.

---

## Part 1: The Game Rules (Quick Overview)

**Challas Aath** is a traditional Indian board game played by 2–4 players. Each player has 4 tokens that must travel from their home area, around an outer ring, into an inner ring, and finally to the center. Tokens are moved by throwing **cowrie shells (kawadi)** — each throw produces a value of 0–8:

- **0 mouths up** → value = **4**
- **1 mouth up** → value = **1**
- **2 mouths up** → value = **2**
- **3 mouths up** → value = **3**
- **4 mouths up** → value = **8**
- **4 or 8** grants a **bonus turn**

Tokens can capture opponent tokens by landing on them (except on safe zones). The first player to move all 4 tokens to the center wins.

---

## Part 2: Backend — Crow + C++

### 2.1 Server Entry Point (`main.cpp`)

The server runs on **Crow** (a C++ web framework) at `http://localhost:8080`. It sets up CORS to allow requests from the frontend and defines four REST endpoints.

#### Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/` | Health check. Returns `"Challas Aath backend running"` |
| `POST` | `/api/session/create` | Creates a new game session |
| `GET` | `/api/session/<id>/state` | Returns full game snapshot |
| `POST` | `/api/session/<id>/roll` | Player rolls the shells |
| `POST` | `/api/session/<id>/move` | Player moves a token |

All responses are JSON. All endpoints validate input and return appropriate HTTP status codes (400 for bad input, 404 for session not found, 201 for creation).

---

### 2.2 Session Creation Flow

When the frontend calls `POST /api/session/create`:

```json
// Request body
{ "playerNames": ["Player 1", "Player 2"] }
```

1. `main.cpp` receives the request, parses the `playerNames` array.
2. Validates: must be 2–4 strings, all must be strings.
3. Calls `sessionRegistry.createSession(names)` → `SessionRegistry.cpp`.
4. `SessionRegistry` generates a unique session ID using timestamp:
   ```cpp
   const auto now = std::chrono::high_resolution_clock::now().time_since_epoch().count();
   // session-id looks like: "session-1749999999999"
   ```
5. Creates a new `GameSession` with this ID and the player names.
6. Stores the session in an in-memory map (`unordered_map<string, shared_ptr<GameSession>>`).
7. Returns:
   ```json
   {
     "sessionId": "session-1749999999999",
     "snapshot": { /* full game state */ }
   }
   ```

**Why a session ID?** The frontend stores this string and sends it with every subsequent request so the server knows which game to operate on.

---

### 2.3 The Core Data Model

#### `GameSession` (`orchestration/GameSession.cpp/h`)

The central class. One instance per game. Holds:

- `sessionId` — unique string identifier
- `board` — a `ChallasAathBoard` (5×5 grid)
- `players` — vector of `Player` objects (2–4 players)
- `state` — a `GameState` object tracking turn order, phase, etc.
- `validator` — a `MoveValidator` that checks if moves are legal
- `roller` — a `CowrieRoll` that simulates the shell throws

**Key methods:**

- `rollShells(playerId)` — simulates a kawadi throw, returns roll value, valid moves, and snapshot
- `moveToken(playerId, tokenId)` — executes a token move, handles captures, checks win condition
- `getSnapshot()` — returns the full game state as JSON (board, tokens, players)

---

### 2.4 Token Movement — Deep Dive on `Token.cpp`

`Token` extends `GamePiece` and represents a single game piece.

```cpp
Token::Token(int owner, int tokenNumber)
    : GamePiece(owner * 10 + tokenNumber, -1, -1),  // id = owner*10 + tokenNumber
      tokenId(tokenNumber),
      ownerId(owner),
      pathIndex(-1),        // -1 means "token is in home cell"
      state(TokenState::AT_START) {}
```

**Token States:**
- `AT_START` — token is in the home area, not on the board
- `ACTIVE` — token is on the board, moving along the path
- `FINISHED` — token reached the center

**The `move(int steps)` method:**

```cpp
void Token::move(int steps) {
    if (state == TokenState::AT_START) {
        state = TokenState::ACTIVE;
        pathIndex = 0;  // anchor to relative index 0 (player's own start cell)
    }
    pathIndex += steps;  // now rolls count FROM start, not including it
}
```

Key insight: when a token is **AT_START** and you want to move it, the game doesn't move it forward by `steps` from -1. Instead it first anchors the token at index 0 (the player's own starting cell on the outer ring), then adds `steps`. So if you roll a 3, the token goes to index 3 on that player's route.

**Other methods:**
- `sendHome()` — resets `pathIndex` to -1 and state to `AT_START`. Called when a token is captured.
- `isFinished()` — returns true if state == `FINISHED`
- `isActive()` — returns true if state == `ACTIVE`
- `isAtSafeZone(board)` — checks if the token is on a safe cell (no captures allowed there)

---

### 2.5 Player Configuration — How Each Player Gets a Different Route

When `GameSession` is constructed, it configures each player's route based on how many players there are:

```cpp
enum class RouteSlot {
    NORTH,  // top of the board (row 0 area)
    EAST,   // right side (col 4 area)
    SOUTH,  // bottom (row 4 area)
    WEST    // left side (col 0 area)
};

// For 2 players: NORTH + SOUTH
// For 3 players: NORTH + EAST + WEST
// For 4 players: all four directions
```

The route config maps each player to:
- `startRingIndex` — which cell on the outer ring the player starts counting from
- `innerRingStartIndex` — which cell in the inner ring the player enters at
- `entryRow`, `entryCol` — the cell where the player enters the board

Example: A 2-player game:
- Player 0 (NORTH): starts ring at index 0, enters at row=0, col=3
- Player 1 (SOUTH): starts ring at index 8, enters at row=4, col=1

---

### 2.6 The Board — `ChallasAathBoard`

A 5×5 grid board with a specific path:

**Outer Ring** (16 cells): The main track. All players traverse this.
```
{0,2} → {0,1} → {0,0} → {1,0} → {2,0} → {3,0} → {4,0} → {4,1}
→ {4,2} → {4,3} → {4,4} → {3,4} → {2,4} → {1,4} → {0,4} → {0,3}
```

**Inner Ring** (8 cells): Only accessible after a player has captured at least one opponent token.
```
{1,3} → {2,3} → {3,3} → {3,2} → {3,1} → {2,1} → {1,1} → {1,2}
```

**Center**: Cell {2,2} — the goal.

Total path length = 16 (outer) + 8 (inner) = **24 steps** to reach the center (index 24).

**Safe Zones:** Certain cells are safe — no captures allowed. These are at the four corners and along certain parts of the board.

---

### 2.7 The Roll — `CowrieRoll.cpp`

Simulates throwing 4 cowrie shells. Each shell has a 50% chance of landing "mouth up" (`front`) or "mouth down" (`back`).

```cpp
int CowrieRoll::roll() {
    int mouths = countMouths();  // count how many landed mouth-up (0 to 4)
    if (mouths == 0) return 4;  // all mouths down = 4
    if (mouths == 4) return 8;  // all mouths up = 8
    return mouths;              // 1, 2, or 3 mouths up = 1, 2, or 3
}

bool CowrieRoll::grantsBonus(int value) const {
    return value == 4 || value == 8;  // only 4 or 8 give a bonus turn
}
```

The `lastShellFaces` vector stores which way each shell landed, so the frontend can display shell images.

---

### 2.8 Move Validation — `MoveValidator.cpp`

Before any move is executed, the validator checks:

1. **Range check**: Does the destination fit within the board (index 0–24)?
2. **Center entry**: Can this token enter the center? (Must have exact steps to reach index 24)
3. **Gatekeeper**: Any special blocking rules?
4. **Capture check**: Would landing here capture an opponent's token? (Safe zones don't allow captures)

The `getValidMoves(player, roll, board)` method iterates through all 4 of a player's tokens and returns which ones can legally move with the current roll.

---

### 2.9 Full Game Turn Flow

```
Client                        Server
  |                              |
  |-- POST /api/session/create --→|
  |   {playerNames: [...]}       |
  |←- {sessionId, snapshot} -----|
  |                              |
  |-- POST /api/session/ID/roll -|
  |   {playerId: 0}              |
  |                              | GameSession::rollShells(0)
  |                              |   - roller.roll() → 3
  |                              |   - validator.getValidMoves(player, 3, board)
  |                              |   - state.setBonus(false)
  |←- {roll: 3, shellFaces, -----|
  |      validMoves: [0,2],      |
  |      snapshot}               |
  |                              |
  |-- POST /api/session/ID/move -|
  |   {playerId: 0, tokenId: 0}  |
  |                              | GameSession::moveToken(0, 0)
  |                              |   - validator.canMove(token, 3, board, player)
  |                              |   - validator.wouldCapture(token, 3, board, player)
  |                              |   - token.move(3) → pathIndex = 3
  |                              |   - board.getCellAt().addOccupant(&token)
  |                              |   - state.nextTurn()
  |←- {captured: false, snapshot}|
```

---

## Part 3: Frontend — React + Zustand + Phaser

### 3.1 Tech Stack

- **React** (Vite) — UI layer
- **Zustand** — state management
- **Phaser** — game canvas rendering (board visualization)
- **Framer Motion** — animations
- **Axios** — HTTP client

### 3.2 API Layer (`src/api/gameApi.ts`)

A thin wrapper around Axios. Four functions:

```typescript
createSession(playerNames: string[])  → CreateSessionResponse
getSessionState(sessionId: string)     → GameSnapshot
rollShells(sessionId: string, playerId: number)  → RollResponse
moveToken(sessionId: string, playerId: number, tokenId: number) → MoveResponse
```

All talk to `http://localhost:8080`. Responses typed with TypeScript interfaces.

### 3.3 State Management (`src/store/gameStore.ts`)

A Zustand store holds the entire game state in a single flat object:

```typescript
interface GameState {
    started: boolean              // is game in progress
    players: number               // 2, 3, or 4
    sessionId: string | null      // from backend
    playerOrder: PlayerColor[]    // ["red", "blue", ...]
    activePlayerIndex: number     // whose turn it is
    kawadiValue: number | null    // last roll (0-8)
    shellFaces: ShellFace[]       // ["front", "back", "front", "back"]
    validMoves: number[]          // which tokens can be moved
    isRolling: boolean            // animation in progress
    hasThrownThisTurn: boolean
    turnCount: number
    snapshot: GameSnapshot | null // full board state from backend
    error: string | null
}
```

**Key actions:**

- `startGame(players)` — calls `createSession`, populates all state from response
- `throwKawadiPreview()` — calls `rollShells`, updates `kawadiValue`, `validMoves`, `shellFaces`
- `moveSelectedToken(tokenId)` — calls `moveToken`, updates `snapshot`, clears `validMoves`
- `refreshState()` — polls the server for latest state
- `resetGame()` — returns to initial state

### 3.4 The Game Snapshot — How the Board is Rendered

The backend sends a `GameSnapshot` JSON with:

1. **Board state**: 5×5 grid of cells, each cell listing any tokens on it
2. **Player states**: Each player's 4 tokens with their `pathIndex` and `state`

The frontend `GameBoard.tsx` uses `buildRenderTokens()` in `boardLayout.ts` to transform this into renderable token positions.

**Token positions**: The board image is a 5×5 grid. Each cell has a percentage position (xPct, yPct) calculated relative to the board image dimensions. Tokens at `pathIndex` are mapped to grid coordinates using the same ring/inner logic as the backend.

**Two token layers**:
- Tokens on the board: rendered as colored circles at computed cell positions
- Tokens at home (`AT_START` state): rendered at fixed positions near each player's corner

**Movable tokens**: The frontend highlights tokens in `validMoves` array so the player knows which ones they can click.

### 3.5 Rendering Pipeline

```
GameSnapshot (from backend)
    ↓
buildRenderTokens(snapshot, validMoves)
    ↓
Returns: { tokens, homeTokens, slotMarkers }
    ↓
GameBoard.tsx renders:
    - board image (static PNG)
    - slot markers (start/entry points per player)
    - token-layer (tokens on board with position offsets)
    - home-token-piles (tokens at home per player)
    ↓
Each token button has onClick → moveSelectedToken(tokenId)
```

### 3.6 The Kawadi Throw UI (`KawadiArea.tsx`)

Displays 4 shell images (front or back based on `shellFaces`). When "Throw Kawadi" is clicked:
1. Sets `isRolling: true` → shells animate with rotation
2. Calls `throwKawadiPreview()` → backend rolls
3. Response updates `kawadiValue`, `shellFaces`, `validMoves`
4. Shells stop animating and show final faces
5. Player can now click a highlighted token to move it

### 3.7 Phaser Scene (`phaser/scenes/GameScene.ts`)

A simple Phaser canvas that shows:
- The board image
- 4 player position markers (corner pins with floating animation)
- Small dots marking each cell on the path

Currently a **visual preview only** — does not process game logic. The actual game logic is driven by the React UI components reading from the Zustand store.

---

## Part 4: Data Flow Summary

```
[Browser]
   |
   | StartMenu.tsx: user selects 2/3/4 players, clicks "Start Game"
   |
   ↓
[startGame(players)] → gameStore.ts
   |
   | createSession(["Player 1", "Player 2", ...])
   |
   ↓
[gameApi.ts] → POST http://localhost:8080/api/session/create
   |
   | Backend: SessionRegistry → GameSession created
   | Session ID generated (timestamp-based)
   |
   ↓
[response: {sessionId, snapshot}] → gameStore.ts
   |
   | Zustand state populated
   |
   ↓
[GamePage.tsx renders] → GameBoard + KawadiArea + PlayerIndicator
   |
   | GameBoard reads snapshot → buildRenderTokens → renders tokens
   | KawadiArea shows "Throw Kawadi" button
   |
   | Player clicks "Throw Kawadi"
   |
   ↓
[throwKawadiPreview()] → gameStore.ts
   |
   | rollShells(sessionId, currentPlayerId)
   |
   ↓
[gameApi.ts] → POST http://localhost:8080/api/session/ID/roll
   |
   | Backend: GameSession::rollShells()
   |   - CowrieRoll::roll() → 0-8
   |   - MoveValidator::getValidMoves()
   |   - state.setBonus()
   |   - returns {roll, shellFaces, validMoves, snapshot}
   |
   ↓
[response: {roll, validMoves, snapshot}] → gameStore.ts
   |
   | Zustand: kawadiValue updated, validMoves updated
   |
   ↓
[KawadiArea shows roll value, tokens highlight if movable]
   |
   | Player clicks a highlighted token
   |
   ↓
[moveSelectedToken(tokenId)] → gameStore.ts
   |
   | moveToken(sessionId, currentPlayerId, tokenId)
   |
   ↓
[gameApi.ts] → POST http://localhost:8080/api/session/ID/move
   |
   | Backend: GameSession::moveToken()
   |   - MoveValidator::canMove()
   |   - MoveValidator::wouldCapture()
   |   - Token::move()
   |   - Board cell updated
   |   - If capture: applyCapture → Token::sendHome()
   |   - state.nextTurn()
   |   - returns {captured, snapshot}
   |
   ↓
[response: {captured, snapshot}] → gameStore.ts
   |
   | Zustand: snapshot updated, validMoves cleared
   | turnCount increases
   |
   ↓
[Board re-renders with new token positions]
   | Loop continues...
```

---

## Part 5: Key Files Reference

### Backend

| File | Purpose |
|------|---------|
| `main.cpp` | Crow server, 4 REST endpoints |
| `SessionRegistry.cpp/h` | Creates and stores GameSession objects |
| `GameSession.cpp/h` | Core game logic, turn management, move execution |
| `GameState.cpp/h` | Turn order, phase, last roll, bonus turn tracking |
| `Token.cpp/h` | Individual token: position, state, movement |
| `Player.cpp/h` | Player with 4 tokens, route config, stats |
| `ChallasAathBoard.cpp/h` | 5×5 board with outer/inner ring path |
| `MoveValidator.cpp/h` | Move legality, capture detection, valid moves |
| `CowrieRoll.cpp/h` | Shell throwing simulation (0-8, bonus logic) |
| `GameSnapshot.cpp/h` | Serializable game state for JSON export |

### Frontend

| File | Purpose |
|------|---------|
| `gameApi.ts` | Axios wrappers for all backend calls |
| `gameStore.ts` | Zustand store — all game state |
| `gameTypes.ts` | TypeScript interfaces matching backend DTOs |
| `StartMenu.tsx` | Player count selection, game start |
| `GamePage.tsx` | Main game layout combining board + HUD |
| `GameBoard.tsx` | Renders board, tokens, markers from snapshot |
| `KawadiArea.tsx` | Shell display, roll button, valid moves info |
| `PlayerIndicator.tsx` | Shows whose turn it is |
| `boardLayout.ts` | `buildRenderTokens()` transforms snapshot to render data |
| `GameContainer.tsx` | Mounts Phaser canvas |
| `GameScene.ts` | Phaser scene with board preview |