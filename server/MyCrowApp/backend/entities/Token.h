#pragma once

#include <string>

#include "Enums.h"
#include "GamePiece.h"

namespace challasaath {

class Board;

class Token : public GamePiece {
   private:
    int tokenId;
    int ownerId;
    int pathIndex;
    TokenState state;

   public:
    Token(int owner, int tokenNumber);

    std::string getType() const override;

    void move(int steps);
    void sendHome();
    bool isFinished() const;
    bool isActive() const;
    bool isAtSafeZone(const Board& board) const;

    TokenState getState() const;
    int getTokenId() const;
    int getOwnerId() const;
    int getPathIndex() const;

    void setPathIndex(int newIndex);
    void setState(TokenState newState);
};

}  // namespace challasaath
