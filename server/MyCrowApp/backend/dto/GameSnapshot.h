#pragma once

#include <string>
#include <vector>

#include <nlohmann/json.hpp>

namespace challasaath {

struct TokenSnapshot {
    int tokenId;
    int ownerId;
    int pathIndex;
    std::string state;
};

struct PlayerSnapshot {
    int playerId;
    std::string name;
    std::string color;
    bool hasKilled;
    int finishedCount;
    std::vector<TokenSnapshot> tokens;
};

struct CellSnapshot {
    int row;
    int col;
    bool safe;
    std::vector<TokenSnapshot> occupants;
};

struct GameSnapshot {
    std::string sessionId;
    int currentPlayerId;
    int lastRoll;
    bool bonusTurn;
    int winnerId;
    std::string phase;
    std::vector<int> validMoves;
    std::vector<CellSnapshot> boardState;
    std::vector<PlayerSnapshot> playerStates;

    nlohmann::json toJson() const;
};

}  // namespace challasaath
