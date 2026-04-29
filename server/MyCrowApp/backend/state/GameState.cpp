#include "GameState.h"

namespace challasaath {

GameState::GameState(int totalPlayers)
    : currentPlayerId(0),
      phase(GamePhase::WAITING),
      lastRoll(0),
      bonusTurnPending(false),
      winnerId(-1),
      playerCount(totalPlayers) {}

void GameState::nextTurn() {
    if (bonusTurnPending) {
        bonusTurnPending = false;
        return;
    }
    // Skip players who have already finished all their tokens
    do {
        currentPlayerId = (currentPlayerId + 1) % playerCount;
    } while (finishedPlayerIds.count(currentPlayerId) > 0 &&
             static_cast<int>(finishedPlayerIds.size()) < playerCount);
}

void GameState::setBonus(bool bonus) {
    bonusTurnPending = bonus;
}


void GameState::markPlayerFinished(int id) {
    finishedPlayerIds.insert(id);
}

bool GameState::isPlayerFinished(int id) const {
    return finishedPlayerIds.count(id) > 0;
}

void GameState::setWinner(int id) {
    winnerId = id;
    phase = GamePhase::FINISHED;
}

void GameState::setLastRoll(int value) {
    lastRoll = value;
}

int GameState::getCurrentPlayer() const {
    return currentPlayerId;
}

GamePhase GameState::getPhase() const {
    return phase;
}

int GameState::getLastRoll() const {
    return lastRoll;
}

bool GameState::hasBonusTurn() const {
    return bonusTurnPending;
}

int GameState::getWinnerId() const {
    return winnerId;
}

bool GameState::isFinished() const {
    return phase == GamePhase::FINISHED;
}

void GameState::setPhase(GamePhase newPhase) {
    phase = newPhase;
}

}  // namespace challasaath
