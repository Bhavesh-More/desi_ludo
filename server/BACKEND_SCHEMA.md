# Desi Ludo — C++ Backend Schema Design

## Architecture Overview

```
server/
├── CMakeLists.txt
├── main.cpp                    # Entry point, Crow routes
├── include/
│   ├── models/
│   │   ├── Player.h
│   │   ├── Piece.h
│   │   ├── Board.h
│   │   ├── Kawadi.h
│   │   └── GameSession.h
│   ├── managers/
│   │   ├── SessionManager.h
│   │   └── TurnManager.h
│   ├── 
│   │   └── GameEnums.h
│   └── utils/
│       └── JsonHelper.h
└── src/
    ├── models/
    │   ├── Player.cpp
    │   ├── Piece.cpp
    │   ├── Board.cpp
    │   ├── Kawadi.cpp
    │   └── GameSession.cpp
    ├── managers/
    │   ├── SessionManager.cpp
    │   └── TurnManager.cpp
    └── utils/
        └── JsonHelper.cpp
```

---

## Enums — `GameEnums.h`

```cpp
#pragma once
#include <string>

enum class PlayerColor { Red, Blue, Green, Yellow };
enum class ShellFace   { Front, Back };
enum class PieceState  { Home, Active, Finished };
enum class GamePhase   { WaitingToStart, InProgress, Finished };

// Utility converters
std::string colorToString(PlayerColor c);
PlayerColor stringToColor(const std::string& s);
std::string shellFaceToString(ShellFace f);
```

---

## Model Classes

### `Piece` — A single token belonging to a player

```cpp
#pragma once
#include <string>
#include "GameEnums.h"

class Piece {
private:
    std::string  m_id;          // e.g. "red-0"
    PlayerColor  m_owner;
    PieceState   m_state;       // Home → Active → Finished
    int          m_pathIndex;   // -1 when Home, 0..N on board

public:
    Piece(const std::string& id, PlayerColor owner);

    // Getters
    const std::string& getId()    const;
    PlayerColor        getOwner() const;
    PieceState         getState() const;
    int                getPathIndex() const;

    // State transitions
    void enterBoard(int startIndex);   // Home → Active
    void advance(int steps);           // move along path
    void finish();                     // Active → Finished
    void sendHome();                   // captured → Home

    bool isHome()     const;
    bool isActive()   const;
    bool isFinished() const;
};
```

### `Player` — Owns 4 pieces, tracks score

```cpp
#pragma once
#include <vector>
#include <memory>
#include "Piece.h"

class Player {
private:
    PlayerColor                         m_color;
    std::vector<std::shared_ptr<Piece>> m_pieces;  // always 4
    bool                                m_hasWon;

public:
    explicit Player(PlayerColor color);

    PlayerColor getColor() const;
    const std::vector<std::shared_ptr<Piece>>& getPieces() const;

    // Query helpers
    std::vector<std::shared_ptr<Piece>> getActivePieces()  const;
    std::vector<std::shared_ptr<Piece>> getHomePieces()    const;
    int  finishedCount() const;
    bool hasWon()        const;
    void checkWin();                     // sets m_hasWon if all 4 finished

    // Determine which pieces can legally move given a kawadi value
    std::vector<std::shared_ptr<Piece>> getMovablePieces(int kawadiValue,
                                                          int pathLength) const;
};
```

### `Kawadi` — The 4-shell dice system (encapsulates randomness)

```cpp
#pragma once
#include <array>
#include <random>
#include "GameEnums.h"

class Kawadi {
private:
    std::array<ShellFace, 4> m_faces;
    int                      m_moveValue;
    std::mt19937             m_rng;

public:
    Kawadi();

    void roll();                                        // randomise the 4 shells

    int                             getMoveValue() const;   // 0 fronts → 4, else count
    const std::array<ShellFace, 4>& getFaces()     const;

    // Whether the player gets a bonus turn (e.g., rolled a 4 or other house rule)
    bool grantsBonusTurn() const;
};
```

### `Board` — Owns the path topology and handles movement rules

```cpp
#pragma once
#include <vector>
#include <string>
#include <memory>
#include "Piece.h"

struct BoardCell {
    std::string id;   // "r0-c1"
    int row;
    int col;
};

class Board {
private:
    std::vector<BoardCell>  m_path;       // 20-cell clockwise ring
    int                     m_pathLength;

    // Per-color safe zones / home stretches can be added later
    // std::unordered_map<PlayerColor, std::vector<int>> m_homeStretch;

public:
    Board();

    int  getPathLength() const;
    const BoardCell& getCell(int index) const;

    // Movement validation
    bool canMove(const Piece& piece, int steps) const;

    // Check if a capture occurs at destination
    // Returns the captured piece (nullptr if none)
    std::shared_ptr<Piece> checkCapture(int destIndex,
                                         const std::vector<std::shared_ptr<Piece>>& allPieces,
                                         PlayerColor mover) const;

    // Check if a cell is a safe square
    bool isSafeSquare(int index) const;
};
```

### `GameSession` — The central game object (Facade pattern)

```cpp
#pragma once
#include <string>
#include <vector>
#include <memory>
#include "Player.h"
#include "Board.h"
#include "Kawadi.h"
#include "GameEnums.h"

class TurnManager;  // forward decl

class GameSession {
private:
    std::string                          m_sessionId;
    std::vector<std::shared_ptr<Player>> m_players;
    Board                                m_board;
    Kawadi                               m_kawadi;
    std::unique_ptr<TurnManager>         m_turnManager;
    GamePhase                            m_phase;
    int                                  m_turnCount;

public:
    explicit GameSession(const std::string& sessionId, int playerCount);

    // Lifecycle
    const std::string& getSessionId() const;
    GamePhase          getPhase()     const;
    int                getTurnCount() const;

    // Player access
    const std::vector<std::shared_ptr<Player>>& getPlayers() const;
    std::shared_ptr<Player> getCurrentPlayer() const;
    std::vector<PlayerColor> getPlayerOrder()  const;

    // ── Core game actions (server-authoritative) ───────────

    struct KawadiResult {
        std::array<ShellFace, 4> faces;
        int                      moveValue;
        bool                     bonusTurn;
        std::vector<std::string> movablePieceIds;
    };
    KawadiResult rollKawadi();

    struct MoveResult {
        std::string movedPieceId;
        int         newPathIndex;
        bool        captured;
        std::string capturedPieceId;   // empty if none
        bool        pieceFinished;
        bool        playerWon;
        bool        gameOver;
        std::string nextPlayerColor;
    };
    MoveResult movePiece(const std::string& pieceId, int steps);

    // Full snapshot for reconnection / sync
    crow::json::wvalue toJson() const;
};
```

---

## Manager Classes

### `TurnManager` — Handles turn order, bonus turns, skipping

```cpp
#pragma once
#include <vector>
#include <memory>
#include "Player.h"

class TurnManager {
private:
    std::vector<std::shared_ptr<Player>> m_players;
    int  m_activeIndex;
    bool m_bonusPending;

public:
    explicit TurnManager(const std::vector<std::shared_ptr<Player>>& players);

    std::shared_ptr<Player> getCurrentPlayer() const;
    int                     getActiveIndex()   const;

    void advance();             // move to next player (skips if bonus)
    void grantBonusTurn();      // current player goes again
    void skipCurrentPlayer();   // e.g., all pieces home & can't enter

    bool isBonusPending() const;
};
```

### `SessionManager` — Manages all active game sessions (Singleton)

```cpp
#pragma once
#include <unordered_map>
#include <memory>
#include <mutex>
#include <string>
#include "GameSession.h"

class SessionManager {
private:
    std::unordered_map<std::string, std::shared_ptr<GameSession>> m_sessions;
    std::mutex m_mutex;

    SessionManager() = default;

public:
    static SessionManager& instance();

    // CRUD
    std::shared_ptr<GameSession> createSession(int playerCount);
    std::shared_ptr<GameSession> getSession(const std::string& id);
    void                         removeSession(const std::string& id);
    size_t                       activeCount() const;

    // No copy
    SessionManager(const SessionManager&)            = delete;
    SessionManager& operator=(const SessionManager&) = delete;
};
```

---

## Utility — `JsonHelper.h`

```cpp
#pragma once
#include <crow.h>
#include "GameSession.h"
#include "Kawadi.h"

namespace JsonHelper {
    crow::json::wvalue kawadiResultToJson(const GameSession::KawadiResult& r);
    crow::json::wvalue moveResultToJson(const GameSession::MoveResult& r);
    crow::json::wvalue sessionCreatedJson(const GameSession& s);
    crow::json::wvalue errorJson(const std::string& message);
}
```

---

## Crow Routes — `main.cpp`

```cpp
#include <crow.h>
#include "managers/SessionManager.h"
#include "utils/JsonHelper.h"

int main() {
    crow::SimpleApp app;

    // ── Create a new game session ──────────────────────────
    // POST /api/session  { "playerCount": 2 }
    // Response: { "sessionId": "...", "playerOrder": ["red","blue"] }
    CROW_ROUTE(app, "/api/session").methods("POST"_method)
    ([](const crow::request& req) {
        auto body = crow::json::load(req.body);
        if (!body || !body.has("playerCount"))
            return crow::response(400, JsonHelper::errorJson("missing playerCount"));

        int count = body["playerCount"].i();
        auto session = SessionManager::instance().createSession(count);
        return crow::response(201, JsonHelper::sessionCreatedJson(*session));
    });

    // ── Roll kawadi (server-authoritative dice) ────────────
    // POST /api/session/{id}/roll
    // Response: { "shellFaces": [...], "moveValue": 3,
    //             "bonusTurn": false, "movablePieceIds": [...] }
    CROW_ROUTE(app, "/api/session/<string>/roll").methods("POST"_method)
    ([](const std::string& id) {
        auto session = SessionManager::instance().getSession(id);
        if (!session)
            return crow::response(404, JsonHelper::errorJson("session not found"));

        auto result = session->rollKawadi();
        return crow::response(200, JsonHelper::kawadiResultToJson(result));
    });

    // ── Move a piece ───────────────────────────────────────
    // POST /api/session/{id}/move  { "pieceId": "red-0", "steps": 3 }
    // Response: { "movedPieceId": "red-0", "newPathIndex": 5, ... }
    CROW_ROUTE(app, "/api/session/<string>/move").methods("POST"_method)
    ([](const crow::request& req, const std::string& id) {
        auto body = crow::json::load(req.body);
        if (!body)
            return crow::response(400, JsonHelper::errorJson("bad json"));

        auto session = SessionManager::instance().getSession(id);
        if (!session)
            return crow::response(404, JsonHelper::errorJson("session not found"));

        std::string pieceId = body["pieceId"].s();
        int steps = body["steps"].i();

        auto result = session->movePiece(pieceId, steps);
        return crow::response(200, JsonHelper::moveResultToJson(result));
    });

    // ── Get full game state (for reconnect / debug) ───────
    // GET /api/session/{id}
    CROW_ROUTE(app, "/api/session/<string>").methods("GET"_method)
    ([](const std::string& id) {
        auto session = SessionManager::instance().getSession(id);
        if (!session)
            return crow::response(404, JsonHelper::errorJson("session not found"));
        return crow::response(200, session->toJson());
    });

    app.port(8080).multithreaded().run();
}
```

---

## Class Relationship Diagram

```
SessionManager (Singleton)
  └── manages map<string, GameSession*>

GameSession (Facade)
  ├── Board             (composition — owns path topology)
  ├── Kawadi            (composition — owns dice logic)
  ├── TurnManager       (composition — owns turn state)
  └── Player[]          (aggregation — 2-4 players)
        └── Piece[]     (composition — each player owns 4)
```

---

## OOP Principles Applied

| Principle | Where |
|---|---|
| **Encapsulation** | Every class hides internal state behind getters; `Kawadi` owns its RNG; `Board` owns path data |
| **Composition** | `GameSession` composes `Board`, `Kawadi`, `TurnManager`, `Player`s |
| **Single Responsibility** | `Kawadi` only rolls, `TurnManager` only sequences turns, `Board` only validates paths |
| **Singleton** | `SessionManager` — one instance manages all sessions thread-safely |
| **Facade** | `GameSession` exposes `rollKawadi()` and `movePiece()` — hides coordination of 4 subsystems |
| **Polymorphism-ready** | `PieceState` enum + virtual-capable `Player` allows AI players later |

---

## Frontend Integration Mapping

| Frontend call (current mock) | Backend route | Return shape |
|---|---|---|
| `createSession(playerCount)` | `POST /api/session` | `{ sessionId, playerOrder }` |
| `throwKawadi()` | `POST /api/session/{id}/roll` | `{ shellFaces, moveValue, bonusTurn, movablePieceIds }` |
| *(new)* select piece to move | `POST /api/session/{id}/move` | `{ movedPieceId, newPathIndex, captured, ... }` |
| *(new)* reconnect/sync | `GET /api/session/{id}` | Full `GameState` JSON |

---

## Design Notes

- The backend is **server-authoritative** — the client sends intents ("roll", "move piece X"), and the server validates, computes outcomes, and returns canonical state.
- This prevents cheating and ensures all game rules (captures, safe squares, bonus turns, win detection) live in one place.
- The board path matches the frontend's 20-cell clockwise ring defined in `boardPath.ts`.
- Session IDs are generated server-side (UUID) and returned to the client on creation.
