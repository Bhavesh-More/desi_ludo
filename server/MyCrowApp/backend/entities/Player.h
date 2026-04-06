#pragma once

#include <array>
#include <string>
#include <vector>

#include "Enums.h"
#include "Token.h"

namespace challasaath {

class Player {
   private:
    int playerId;
    std::string name;
    PlayerColor color;
    int startRingIndex;
    int innerRingStartIndex;
    int entryRow;
    int entryCol;
    std::array<Token, 4> tokens;
    bool hasKilled;
    int finishedCount;

   public:
    Player(int id, const std::string& displayName, PlayerColor playerColor);

    int getId() const;
    const std::string& getName() const;
    PlayerColor getColor() const;

    std::array<Token, 4>& getTokens();
    const std::array<Token, 4>& getTokens() const;

    std::vector<Token*> getActiveTokens();
    bool allFinished() const;
    void unlockInnerRing();
    bool canEnterInnerRing() const;
    void incrementFinished();

    void setRoute(int startIndex, int innerStartIndex, int entryR, int entryC);
    int getStartRingIndex() const;
    int getInnerRingStartIndex() const;
    int getEntryRow() const;
    int getEntryCol() const;

    bool getHasKilled() const;
    int getFinishedCount() const;
};

}  // namespace challasaath
