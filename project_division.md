# Project Division — Challas Aath (Desi Ludo)

Actual division based on **what is currently implemented**. Three contributors, each owning a distinct vertical slice.

---

## Contributor 1 — Frontend + Crow Connection Layer

**Scope:** Everything the player sees in the browser AND the REST API endpoints that feed it.

### What exists and is already working

**Frontend (React):**
- `StartMenu.tsx` — player count selector (2/3/4 players)
- `gameStore.ts` — Zustand store with `startGame`, `throwKawadiPreview`, `moveSelectedToken`, `resetGame`
- `gameApi.ts` — Axios calls to `localhost:8080`
- `gameTypes.ts` — TypeScript interfaces matching backend DTOs
- `GamePage.tsx` — main layout assembling GameBoard + KawadiArea + PlayerIndicator

**Backend (Crow endpoints):**
- `main.cpp` — Crow server on port 8080, CORS enabled, 4 REST endpoints
- `SessionRegistry.cpp/h` — creates sessions with timestamp-based ID, stores in map

### What this person built and must own going forward

**Frontend UI Components:**
- `components/game/GameBoard.tsx` — renders board image, token positions from snapshot, clickable tokens
- `components/game/KawadiArea.tsx` — shell images (front/back), roll button, valid moves display, roll value
- `components/ui/PlayerIndicator.tsx` — shows whose turn, player list with active highlight
- `components/game/GameContainer.tsx` — mounts Phaser canvas to DOM

**Board Layout:**
- `utils/boardLayout.ts` — `buildRenderTokens(snapshot, validMoves)` transforms backend snapshot into renderable token data (board tokens + home tokens + slot markers)
- `utils/boardPath.ts` — board path coordinates for Phaser (boardPath array, boardBoxCenters)

**Phaser Integration:**
- `phaser/scenes/BootScene.ts` — loads board + piece images (`board.png`, `redPiece`, `bluePiece`, `greenPiece`, `yellowPiece`)
- `phaser/scenes/GameScene.ts` — shows board image, cell dots, floating corner markers (preview only, NOT connected to gameStore yet)
- `phaser/managers/PieceManager.ts` — spawn pieces, highlight, move via tween
- `phaser/managers/PlayerManager.ts` — create players, track current turn
- `phaser/config/gameConfig.ts` — Phaser config (700×700, arcade physics)
- `phaser/game.ts` — `initGame()` returns Phaser.Game instance

**Crow REST Endpoints (in `main.cpp`):**
- `POST /api/session/create` — validate playerNames array, call `sessionRegistry.createSession()`, return `{sessionId, snapshot}`
- `GET /api/session/<id>/state` — return current snapshot from session registry
- `POST /api/session/<id>/roll` — parse body for `playerId`, call `session->rollShells()`, return `{roll, shellFaces, validMoves, snapshot}`
- `POST /api/session/<id>/move` — parse body for `playerId` + `tokenId`, call `session->moveToken()`, return `{captured, snapshot}`

**Session Management:**
- `SessionRegistry.cpp/h` — `createSession()` generates timestamp-based session ID, stores `shared_ptr<GameSession>`, `getSession()` looks up by ID

**DTO for JSON serialization:**
- `dto/GameSnapshot.cpp/h` — `toJson()` serializes full game state. Must produce fields that frontend expects: `sessionId`, `currentPlayerId`, `lastRoll`, `bonusTurn`, `winnerId`, `phase`, `validMoves`, `boardState[]`, `playerStates[]`

### What still needs to be done (Contributor 1's job)

1. **Connect GameScene to Zustand store** — Phaser canvas shows static preview. Must subscribe to `gameStore` snapshot and render live token positions using `buildRenderTokens` output
2. **Token movement animation in Phaser** — when `moveSelectedToken` succeeds, animate the token in Phaser via `PieceManager.movePiece()`
3. **Highlight valid moves in Phaser** — call `PieceManager.highlightPieces()` with tokens matching indices in `validMoves`
4. **Shell animation sync** — `KawadiArea` animates shells while rolling. After response, show final faces. Also update Phaser scene when roll happens
5. **Board assets** — ensure `/assets/board/board.png` and `/assets/pieces/*.png` exist. Create placeholder assets if missing
6. **Error response format** — ensure all endpoints return JSON error responses with consistent format (e.g., `{"error": "message"}`) not plain text

### What Contributor 1 should NOT touch
- `backend/entities/Token.cpp/h` — game logic for token movement
- `backend/entities/Player.cpp/h` — player route config, kill tracking
- `backend/entities/ChallasAathBoard.cpp/h` — board path, safe zones
- `backend/logic/MoveValidator.cpp/h` — move legality, capture detection
- `backend/logic/CowrieRoll.cpp/h` — shell roll simulation
- `backend/orchestration/GameSession.cpp/h` — rollShells/moveToken internal logic
- `backend/state/GameState.cpp/h` — turn order, phase, bonus tracking

---

## Contributor 2 — Game Entities + State + Session Infrastructure

**Scope:** The physical game world — tokens, players, board geometry, and the data structures that represent a live game session.

### What exists and is already working
- `Token.cpp/h` — movement, state transitions, `sendHome()`, `isFinished()`, `isActive()`, `isAtSafeZone()`
- `Player.cpp/h` — 4 tokens, route config per player count, inner ring unlock on kill, `finishedCount`
- `ChallasAathBoard.cpp/h` — 5×5 grid, outer ring (16 cells), inner ring (8 cells), safe zones
- `GameState.cpp/h` — current player tracking, phase, last roll, bonus turn, winner ID
- `SessionRegistry.cpp/h` — session creation + lookup

### What this person built and must own going forward

**Token (`Token.cpp/h`):**
- Constructor: `Token(owner, tokenNumber)` sets `ownerId`, `tokenId` (0-3), `pathIndex = -1`, `state = AT_START`
- `move(steps)`: if AT_START → set state=ACTIVE, pathIndex=0+steps. else → pathIndex += steps
- `sendHome()`: resets pathIndex to -1, state to AT_START, position to (-1,-1)
- `isFinished()`: true when state == FINISHED
- `isActive()`: true when state == ACTIVE
- `isAtSafeZone(board)`: checks if pathIndex cell is marked safe on the board

**Player (`Player.cpp/h`):**
- Constructor: creates 4 Token objects (owner*10+tokenId as piece id)
- `setRoute(startIndex, innerStartIndex, entryRow, entryCol)`: configures per-slot routing (NORTH/EAST/SOUTH/WEST)
- `unlockInnerRing()`: sets `hasKilled = true` — player can now enter inner ring
- `canEnterInnerRing()`: returns `hasKilled`
- `incrementFinished()`: increments `finishedCount`
- `allFinished()`: true when finishedCount == 4

**Board (`ChallasAathBoard.cpp/h`):**
- `ChallasAathBoard(size)`: builds a 5×5 grid board
- `buildPath()`: constructs outer ring (16 cells) + inner ring (8 cells) path for all players
- `isValidCell(r, c)`: true if cell is within the 5×5 grid
- `isSafeZone(r, c)`: true for cells where captures are not allowed
- `getSafeZoneIndices()`: returns list of path indices that are safe

**Game State (`GameState.cpp/h`):**
- Constructor: takes `totalPlayers`, initializes `currentPlayerId=0`, `phase=WAITING`
- `nextTurn()`: if `bonusTurnPending` → clear it and stay. else → `currentPlayerId = (currentPlayerId + 1) % playerCount`
- `setBonus(bool)`: sets `bonusTurnPending` when roll is 4 or 8
- `setWinner(id)`: sets winnerId and transitions phase to FINISHED
- `setPhase(newPhase)`: directly sets game phase
- `setLastRoll(value)`: stores last roll value
- `getCurrentPlayer()`, `getPhase()`, `getLastRoll()`, `hasBonusTurn()`, `getWinnerId()`, `isFinished()`

**Session Registry (`SessionRegistry.cpp/h`):**
- `generateSessionId()`: timestamp-based string like `"session-1749999999999"`
- `createSession(playerNames)`: creates new `GameSession`, stores in map, returns shared_ptr
- `getSession(sessionId)`: looks up session from map, returns nullptr if not found

### What still needs to be done (Contributor 2's job)

1. **3-player and 4-player routes** — verify `slotForPlayer()` and `routeConfig()` in `GameSession.cpp` produce correct start indices for all player counts
2. **Safe zone cell definitions** — verify `ChallasAathBoard::isSafeZone()` returns correct cells. These must match the frontend's board layout assumptions
3. **Board path consistency** — backend path cells (outer ring 16 + inner ring 8 = 24 steps to center) must align with what `boardLayout.ts` computes for token positions. If the backend resolves pathIndex to a different cell than the frontend expects, tokens will appear in the wrong place
4. **GameState turn tracking** — ensure `currentPlayerId` correctly advances through all active players and respects bonus turn flag

### What Contributor 2 should NOT touch
- `backend/logic/MoveValidator.cpp/h` — move legality and capture rules
- `backend/logic/CowrieRoll.cpp/h` — roll simulation
- `backend/orchestration/GameSession.cpp/h` — orchestration logic (depends on Contributor 3's validator and roll logic)
- Any frontend React components or Zustand store

---

## Contributor 3 — Game Rules Engine + Session Orchestration

**Scope:** The game rules — how moves are validated, how rolls work, how sessions orchestrate the full turn

### What exists and is already working
- `MoveValidator.cpp/h` — `canMove()`, `wouldCapture()`, `getValidMoves()`, `resolveRouteCell()`
- `CowrieRoll.cpp/h` — 4 shells, 50/50 distribution, returns 0–8, bonus on 4 or 8
- `GameSession.cpp/h` — `rollShells()`, `moveToken()`, `applyCapture()`, `advanceTurn()`, `checkWinCondition()`, `getSnapshot()`
- `dto/GameSnapshot.cpp/h` — `toJson()` serializes full game state

### What this person built and must own going forward

**Roll Logic (`CowrieRoll.cpp/h`):**
- Constructor: seeds RNG with current time, uses `bernoulli_distribution(0.5)` for 50/50
- `countMouths()`: flips 4 shells, stores "front" or "back" per shell in `lastShellFaces`
- `roll()`: counts mouths up. 0 mouths → 4, 4 mouths → 8, else returns count (1-3)
- `grantsBonus(value)`: returns true only for 4 or 8
- `getLastShellFaces()`: returns vector of "front"/"back" strings for frontend shell display

**Move Validation (`MoveValidator.cpp/h`):**
- `resolveRouteCell(player, routeIndex)`: maps a player's relative pathIndex to absolute grid (row,col). Outer ring uses `kOuterRingCells`, inner ring uses `kInnerRingCells`, center returns {2,2}
- `canMove(token, steps, board, player)`: checks destination <= 24 (center), exact roll needed for center entry, no gatekeeper blocks
- `wouldCapture(token, steps, board, player)`: if destination not safe zone and cell has opponent token → return that token pointer. else nullptr
- `getValidMoves(player, roll, board)`: iterates 4 tokens, returns indices of tokens where `canMove` is true

**Game Session (`GameSession.cpp/h`):**
- Constructor: builds players with route configs based on player count (2→NORTH+SOUTH, 3→NORTH+EAST+WEST, 4→all four)
- `rollShells(playerId)`: validates it's the current player → calls `roller.roll()` → calls `validator.getValidMoves()` → stores shell faces → returns `{roll, shellFaces, validMoves, snapshot}`
- `moveToken(playerId, tokenId)`: validates playerId matches current player → validates tokenId in validMoves → calls `validator.canMove()` → checks `validator.wouldCapture()` → executes move: updates token pathIndex, board cell occupancy → if capture → `applyCapture()` → checks win condition → advances turn (or not if bonus) → returns `{captured, snapshot}`
- `applyCapture(target, attacker)`: removes target from board cell, calls `target.sendHome()`, calls `attacker.unlockInnerRing()`, sets bonus turn
- `advanceTurn()`: calls `state.nextTurn()`
- `checkWinCondition()`: returns playerId if all 4 tokens finished, else -1
- `getSnapshot()`: builds full GameSnapshot — board cells with occupants, player states with token data, current player, last roll, valid moves, winner

**Game Snapshot DTO (`dto/GameSnapshot.cpp/h`):**
- `toJson()`: produces JSON with `sessionId`, `currentPlayerId`, `lastRoll`, `bonusTurn`, `winnerId`, `phase`, `validMoves`, `boardState[]`, `playerStates[]`
- Field names must match exactly what `GameBoard.tsx`'s `buildRenderTokens()` and `gameTypes.ts` expect

### What still needs to be done (Contributor 3's job)

1. **Inner ring gatekeeper** — `isGatekeeperBlocked()` currently always returns false. Must implement: if destination pathIndex >= 16 (inner ring entry) → check `player.canEnterInnerRing()`, return true if player hasn't killed yet
2. **Safe zone capture prevention** — `wouldCapture()` must return nullptr for safe zone cells. Add check: `if (board.isSafeZone(r, c)) return nullptr;`
3. **Exact roll to finish** — token at pathIndex 23 needs exactly roll=1. `canMove()` must reject destination > finalIndex cleanly. Also `canEnterCenter()` needs to verify exact steps match remaining distance to index 24
4. **Capture resolution edge cases** — when token moves to a cell with multiple opponent tokens (shouldn't happen on valid path but guard against it), capture the first one found
5. **Unit tests** — write:
   - `tests/test_cowrie_roll.cpp` — verify 0 mouths=4, 4 mouths=8, 1-3 mouths=1-3, bonus on 4 and 8
   - `tests/test_move_validator.cpp` — verify canMove, wouldCapture, getValidMoves for all token states
   - `tests/test_game_session.cpp` — full turn flow: roll → valid moves → move → capture scenario → bonus turn → win condition



### What Contributor 3 should NOT touch
- `backend/entities/Token.cpp/h` — token physical state (pathIndex, state) is Contributor 2's domain
- `backend/entities/Player.cpp/h` — player route config is Contributor 2's domain
- `backend/entities/ChallasAathBoard.cpp/h` — board geometry is Contributor 2's domain
- Any frontend React components or Zustand store

---

## Division Summary

| Contributor | Owns | Key files |
|-------------|------|-----------|
| **1 — Frontend + Crow Connection** | React UI, Phaser, Zustand store, Crow REST endpoints, SessionRegistry, GameSnapshot DTO | `GameBoard`, `KawadiArea`, `PlayerIndicator`, `GameContainer`, `GameScene`, `BootScene`, `PieceManager`, `PlayerManager`, `gameStore`, `gameApi`, `boardLayout`, `main.cpp`, `SessionRegistry`, `GameSnapshot` |
| **2 — Game Entities + State** | Token physical state, Player data, Board geometry, GameState turn tracking, SessionRegistry infrastructure | `Token`, `Player`, `ChallasAathBoard`, `GameState`, `SessionRegistry` |
| **3 — Rules Engine + Orchestration** | Move validation, capture rules, shell rolling, GameSession orchestration | `MoveValidator`, `CowrieRoll`, `GameSession`|

### Dependency order (must build in this sequence)

```
Contributor 2 (entities, state)  →  Contributor 3 (rules, orchestration)  →  Contributor 1 (endpoints, frontend)
```

- **Contributor 2** builds first: `Token`, `Player`, `Board`, `GameState`, `SessionRegistry` don't depend on anything else
- **Contributor 3** builds second: `MoveValidator` needs `Token` and `Board` types to exist. `GameSession` needs `Token`, `Player`, `Board`, `MoveValidator`, `CowrieRoll`, `GameState` to all exist
- **Contributor 1** builds last: endpoints need `GameSession` and `SessionRegistry` to exist. Frontend needs backend to be running

### Overlap boundaries
- **Contributor 2** defines the physical model: Token has `pathIndex`, Player has route config. **Contributor 3** reads these to validate moves — must not modify Token state directly, only through `GameSession::moveToken()`
- **Contributor 3** produces `GameSnapshot.toJson()` — **Contributor 1** reads it via `gameApi.ts` → `gameStore` → `GameBoard.tsx`. Field names must match exactly

### Coordination points
1. **Board path alignment** — Contributor 2's `ChallasAathBoard` path cells must match what `boardLayout.ts` computes. Verify before Contributor 3 builds `resolveRouteCell`
2. **Snapshot field names** — Contributor 3's `GameSnapshot.toJson()` must produce fields that `buildRenderTokens()` in `boardLayout.ts` expects