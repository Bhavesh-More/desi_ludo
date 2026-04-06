#pragma once

#include <memory>
#include <string>
#include <vector>

#include <nlohmann/json.hpp>

#include "../dto/GameSnapshot.h"
#include "../entities/ChallasAathBoard.h"
#include "../entities/Player.h"
#include "../logic/CowrieRoll.h"
#include "../logic/MoveValidator.h"
#include "../logic/RollStrategy.h"
#include "../state/GameState.h"

namespace challasaath {

class GameSession {
   private:
    std::string sessionId;
    ChallasAathBoard board;
    std::vector<Player> players;
    GameState state;
    MoveValidator validator;
    std::unique_ptr<RollStrategy> roller;
    std::vector<int> validMovesForLastRoll;
    std::vector<std::string> lastShellFaces;

    void applyCapture(Token& target, Player& attacker);
    void advanceTurn();
    int checkWinCondition();
    PlayerColor indexToColor(int index) const;

   public:
    GameSession(const std::string& id,
                const std::vector<std::string>& playerNames,
                std::unique_ptr<RollStrategy> strategy = nullptr);

    nlohmann::json rollShells(int playerId);
    nlohmann::json moveToken(int playerId, int tokenId);
    GameSnapshot getSnapshot() const;
    std::vector<int> getValidMoves(int playerId) const;

    const std::string& getSessionId() const;
    const GameState& getState() const;
};

}  // namespace challasaath
