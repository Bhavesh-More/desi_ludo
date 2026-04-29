#pragma once
#include <unordered_set>

#include "../entities/Enums.h"

namespace challasaath {

class GameState {
   private:
    int currentPlayerId;
    GamePhase phase;
    int lastRoll;
    bool bonusTurnPending;
    int winnerId;
    int playerCount;
    std::unordered_set<int> finishedPlayerIds;

   public:
    explicit GameState(int totalPlayers = 2);

    void nextTurn();
    void setBonus(bool bonus);
    void setWinner(int id);
    void setLastRoll(int value);

    int getCurrentPlayer() const;
    GamePhase getPhase() const;
    int getLastRoll() const;
    bool hasBonusTurn() const;
    int getWinnerId() const;
    bool isFinished() const;
    void markPlayerFinished(int playerId);
    bool isPlayerFinished(int playerId) const;

    void setPhase(GamePhase newPhase);
};

}  // namespace challasaath
