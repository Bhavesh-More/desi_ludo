#include "Token.h"

#include "Board.h"

namespace challasaath {

Token::Token(int owner, int tokenNumber)
    : GamePiece(owner * 10 + tokenNumber, -1, -1),
      tokenId(tokenNumber),
      ownerId(owner),
      pathIndex(-1),
      state(TokenState::AT_START) {}

std::string Token::getType() const {
    return "token";
}

void Token::move(int steps) {
    if (state == TokenState::AT_START) {
        state = TokenState::ACTIVE;
    }
    pathIndex += steps;
}

void Token::sendHome() {
    pathIndex = -1;
    state = TokenState::AT_START;
    setPosition(-1, -1);
}

bool Token::isFinished() const {
    return state == TokenState::FINISHED;
}

bool Token::isActive() const {
    return state == TokenState::ACTIVE;
}

bool Token::isAtSafeZone(const Board& board) const {
    if (pathIndex < 0 || pathIndex >= board.getPathLength()) {
        return false;
    }

    const auto& path = board.getPath();
    const auto [r, c] = path[pathIndex];
    return board.isSafeZone(r, c);
}

TokenState Token::getState() const {
    return state;
}

int Token::getTokenId() const {
    return tokenId;
}

int Token::getOwnerId() const {
    return ownerId;
}

int Token::getPathIndex() const {
    return pathIndex;
}

void Token::setPathIndex(int newIndex) {
    pathIndex = newIndex;
}

void Token::setState(TokenState newState) {
    state = newState;
}

}  // namespace challasaath
