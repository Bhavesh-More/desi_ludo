#include "Player.h"

namespace challasaath {

Player::Player(int id, const std::string& displayName, PlayerColor playerColor)
    : playerId(id),
      name(displayName),
      color(playerColor),
            startRingIndex(0),
            innerRingStartIndex(0),
            entryRow(1),
            entryCol(2),
      tokens{Token(id, 0), Token(id, 1), Token(id, 2), Token(id, 3)},
      hasKilled(false),
      finishedCount(0) {}

int Player::getId() const {
    return playerId;
}

const std::string& Player::getName() const {
    return name;
}

PlayerColor Player::getColor() const {
    return color;
}

std::array<Token, 4>& Player::getTokens() {
    return tokens;
}

const std::array<Token, 4>& Player::getTokens() const {
    return tokens;
}

std::vector<Token*> Player::getActiveTokens() {
    std::vector<Token*> active;
    for (auto& token : tokens) {
        if (token.isActive()) {
            active.push_back(&token);
        }
    }
    return active;
}

bool Player::allFinished() const {
    return finishedCount == 4;
}

void Player::unlockInnerRing() {
    hasKilled = true;
}

bool Player::canEnterInnerRing() const {
    return hasKilled;
}

void Player::incrementFinished() {
    ++finishedCount;
}

void Player::setRoute(int startIndex, int innerStartIndex, int entryR, int entryC) {
    startRingIndex = startIndex;
    innerRingStartIndex = innerStartIndex;
    entryRow = entryR;
    entryCol = entryC;
}

int Player::getStartRingIndex() const {
    return startRingIndex;
}

int Player::getInnerRingStartIndex() const {
    return innerRingStartIndex;
}

int Player::getEntryRow() const {
    return entryRow;
}

int Player::getEntryCol() const {
    return entryCol;
}

bool Player::getHasKilled() const {
    return hasKilled;
}

int Player::getFinishedCount() const {
    return finishedCount;
}

}  // namespace challasaath
