#include "MoveValidator.h"

namespace challasaath {

namespace {

constexpr int kOuterRingLength = 16;
constexpr int kInnerRingLength = 8;
constexpr int kInnerEntryIndex = kOuterRingLength;
constexpr int kCenterIndex = kOuterRingLength + kInnerRingLength;

const std::pair<int, int> kOuterRingCells[kOuterRingLength] = {
    {0, 2}, {0, 1}, {0, 0}, {1, 0},
    {2, 0}, {3, 0}, {4, 0}, {4, 1},
    {4, 2}, {4, 3}, {4, 4}, {3, 4},
    {2, 4}, {1, 4}, {0, 4}, {0, 3},
};

const std::pair<int, int> kInnerRingCells[kInnerRingLength] = {
    {1, 3}, {2, 3}, {3, 3}, {3, 2},
    {3, 1}, {2, 1}, {1, 1}, {1, 2},
};

}  // namespace

std::pair<int, int> MoveValidator::resolveRouteCell(const Player& player, int routeIndex) const {
    if (routeIndex < 0) {
        return {-1, -1};
    }

    if (routeIndex < kOuterRingLength) {
        const int ringIndex = (player.getStartRingIndex() + routeIndex) % kOuterRingLength;
        return kOuterRingCells[ringIndex];
    }

    if (routeIndex < kCenterIndex) {
        const int innerOffset = routeIndex - kInnerEntryIndex;
        const int innerIndex = (player.getInnerRingStartIndex() + innerOffset) % kInnerRingLength;
        return kInnerRingCells[innerIndex];
    }

    return {2, 2};
}

bool MoveValidator::canMove(const Token& token, int steps, const Board& board, const Player& player) const {
    if (steps <= 0 || token.getState() == TokenState::FINISHED) {
        return false;
    }

    // ✅ AT_START tokens treat relative index as 0, not -1
    const int currentIndex = (token.getState() == TokenState::AT_START) ? 0 : token.getPathIndex();
    const int destination = currentIndex + steps;
    const int finalIndex = kCenterIndex;

    if (destination > finalIndex) {
        return false;
    }

    if (destination == finalIndex && !canEnterCenter(token, steps, board)) {
        return false;
    }

    if (isGatekeeperBlocked(token, steps, board, player)) {
        return false;
    }

    return true;
}

Token* MoveValidator::wouldCapture(const Token& token, int steps, const Board& board, const Player& player) const {
    const int currentIndex = (token.getState() == TokenState::AT_START) ? 0 : token.getPathIndex();
    const int destination = currentIndex + steps;

    if (destination < 0 || destination >= kCenterIndex) {
        return nullptr;
    }

    const auto [r, c] = resolveRouteCell(player, destination);

    // Only outer ring cells can be safe zones — inner ring is a private path
    if (destination < kInnerEntryIndex && board.isSafeZone(r, c)) {
        return nullptr;
    }

    const auto occupants = board.getCellAt(r, c).getOccupants();
    for (Token* occupant : occupants) {
        if (occupant == nullptr) {
            continue;
        }
        if (occupant->getOwnerId() != token.getOwnerId() && !occupant->isFinished()) {
            return occupant;
        }
    }

    return nullptr;
}

bool MoveValidator::canEnterCenter(const Token& token, int steps, const Board& board) const {
    (void)board;
    const int destination = token.getPathIndex() + steps;
    return destination == kCenterIndex;
}

bool MoveValidator::isGatekeeperBlocked(const Token& token, int steps, const Board& board, const Player& player) const {
    (void)board;
    (void)player;
    (void)token;
    (void)steps;
    return false;
}

std::vector<int> MoveValidator::getValidMoves(const Player& player, int roll, const Board& board) const {
    std::vector<int> valid;
    const auto& tokens = player.getTokens();

    for (int i = 0; i < static_cast<int>(tokens.size()); ++i) {
        if (canMove(tokens[i], roll, board, player)) {
            valid.push_back(i);
        }
    }

    return valid;
}

int MoveValidator::cellRingIndex(int row, int col, int boardSize) const {
    const int top = row;
    const int left = col;
    const int bottom = boardSize - 1 - row;
    const int right = boardSize - 1 - col;

    int ring = top;
    if (left < ring) {
        ring = left;
    }
    if (bottom < ring) {
        ring = bottom;
    }
    if (right < ring) {
        ring = right;
    }
    return ring;
}

}  // namespace challasaath
