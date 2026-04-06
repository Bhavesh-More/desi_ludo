#pragma once

#include <utility>
#include <vector>

#include "../entities/Board.h"
#include "../entities/Player.h"
#include "../entities/Token.h"

namespace challasaath {

class MoveValidator {
   public:
    bool canMove(const Token& token, int steps, const Board& board, const Player& player) const;
    Token* wouldCapture(const Token& token, int steps, const Board& board, const Player& player) const;
    bool canEnterCenter(const Token& token, int steps, const Board& board) const;
    bool isGatekeeperBlocked(const Token& token, int steps, const Board& board, const Player& player) const;
    std::vector<int> getValidMoves(const Player& player, int roll, const Board& board) const;
    std::pair<int, int> resolveRouteCell(const Player& player, int routeIndex) const;

   private:
    int cellRingIndex(int row, int col, int boardSize) const;
};

}  // namespace challasaath
