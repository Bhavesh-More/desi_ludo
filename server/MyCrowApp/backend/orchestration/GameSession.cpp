#include "GameSession.h"

#include <algorithm>
#include <stdexcept>

namespace challasaath {

namespace {

enum class RouteSlot {
    NORTH,
    EAST,
    SOUTH,
    WEST,
};

RouteSlot slotForPlayer(int playerCount, int playerIndex) {
    if (playerCount == 2) {
        return playerIndex == 0 ? RouteSlot::NORTH : RouteSlot::SOUTH;
    }

    if (playerCount == 3) {
        if (playerIndex == 0) {
            return RouteSlot::NORTH;
        }
        if (playerIndex == 1) {
            return RouteSlot::EAST;
        }
        return RouteSlot::WEST;
    }

    switch (playerIndex) {
        case 0:
            return RouteSlot::NORTH;
        case 1:
            return RouteSlot::EAST;
        case 2:
            return RouteSlot::SOUTH;
        default:
            return RouteSlot::WEST;
    }
}

void routeConfig(RouteSlot slot, int& startRingIndex, int& innerStartIndex, int& entryRow, int& entryCol) {
    switch (slot) {
        case RouteSlot::NORTH:
            startRingIndex = 0;
            innerStartIndex = 0;
            entryRow = 0;
            entryCol = 3;
            return;
        case RouteSlot::EAST:
            startRingIndex = 12;
            innerStartIndex = 2;
            entryRow = 3;
            entryCol = 4;
            return;
        case RouteSlot::SOUTH:
            startRingIndex = 8;
            innerStartIndex = 4;
            entryRow = 4;
            entryCol = 1;
            return;
        case RouteSlot::WEST:
            startRingIndex = 4;
            innerStartIndex = 6;
            entryRow = 1;
            entryCol = 0;
            return;
    }
}

}  // namespace

GameSession::GameSession(const std::string& id,
                         const std::vector<std::string>& playerNames,
                         std::unique_ptr<RollStrategy> strategy)
    : sessionId(id),
      board(5),
      state(static_cast<int>(playerNames.size())),
      roller(std::move(strategy)) {
        const int playerCount = static_cast<int>(playerNames.size());

        for (int i = 0; i < playerCount; ++i) {
        players.emplace_back(i, playerNames[i], indexToColor(i));

                int startRingIndex = 0;
            int innerStartIndex = 0;
            int entryRow = 1;
            int entryCol = 2;
            routeConfig(slotForPlayer(playerCount, i), startRingIndex, innerStartIndex, entryRow, entryCol);
            players.back().setRoute(startRingIndex, innerStartIndex, entryRow, entryCol);
    }

    if (!roller) {
        roller = std::make_unique<CowrieRoll>();
    }

    state.setPhase(GamePhase::IN_PROGRESS);
}

nlohmann::json GameSession::rollShells(int playerId) {
    if (state.isFinished()) {
        throw std::runtime_error("game already finished");
    }
    if (playerId != state.getCurrentPlayer()) {
        throw std::runtime_error("not current player turn");
    }

    const int rollValue = roller->roll();
    state.setLastRoll(rollValue);
    state.setBonus(roller->grantsBonus(rollValue));

    if (auto* cowrieRoll = dynamic_cast<CowrieRoll*>(roller.get())) {
        lastShellFaces = cowrieRoll->getLastShellFaces();
    } else {
        lastShellFaces.assign(4, "back");
    }

    validMovesForLastRoll = validator.getValidMoves(players[playerId], rollValue, board);

    nlohmann::json result;
    result["roll"] = rollValue;
    result["shellFaces"] = lastShellFaces;
    result["validMoves"] = validMovesForLastRoll;
    result["snapshot"] = getSnapshot().toJson();
    return result;
}

nlohmann::json GameSession::moveToken(int playerId, int tokenId) {
    if (state.isFinished()) {
        throw std::runtime_error("game already finished");
    }
    if (playerId != state.getCurrentPlayer()) {
        throw std::runtime_error("not current player turn");
    }
    if (tokenId < 0 || tokenId >= 4) {
        throw std::runtime_error("invalid token id");
    }

    auto validIt = std::find(validMovesForLastRoll.begin(), validMovesForLastRoll.end(), tokenId);
    if (validIt == validMovesForLastRoll.end()) {
        throw std::runtime_error("token is not a valid move for the current roll");
    }

    Player& player = players[playerId];
    Token& token = player.getTokens()[tokenId];

    if (!validator.canMove(token, state.getLastRoll(), board, player)) {
        throw std::runtime_error("illegal move");
    }

    Token* captureTarget = validator.wouldCapture(token, state.getLastRoll(), board, player);

    const int oldPathIndex = token.getPathIndex();
    if (oldPathIndex >= 0 && oldPathIndex < 24) {
        const auto [oldR, oldC] = validator.resolveRouteCell(player, oldPathIndex);
        board.getCellAt(oldR, oldC).removeOccupant(&token);
    }

    token.move(state.getLastRoll());

    const int destination = token.getPathIndex();
    const int finalIndex = 24;
    const auto [newR, newC] = validator.resolveRouteCell(player, destination);
    token.setPosition(newR, newC);

    if (destination == finalIndex) {
        token.setState(TokenState::FINISHED);
        player.incrementFinished();
    } else {
        token.setState(TokenState::ACTIVE);
        board.getCellAt(newR, newC).addOccupant(&token);
    }

    bool captured = false;
    if (captureTarget != nullptr) {
        applyCapture(*captureTarget, player);
        captured = true;
    }

    const int winner = checkWinCondition();
    if (winner >= 0) {
        state.setWinner(winner);
    }

    validMovesForLastRoll.clear();

    if (!state.isFinished()) {
        advanceTurn();
    }

    nlohmann::json result;
    result["captured"] = captured;
    result["snapshot"] = getSnapshot().toJson();
    return result;
}

void GameSession::applyCapture(Token& target, Player& attacker) {
    const int pathIndex = target.getPathIndex();
    if (pathIndex >= 0 && pathIndex < 24) {
        const Player& targetOwner = players[target.getOwnerId()];
        const auto [r, c] = validator.resolveRouteCell(targetOwner, pathIndex);
        board.getCellAt(r, c).removeOccupant(&target);
    }

    target.sendHome();
    attacker.unlockInnerRing();
    state.setBonus(true);
}

void GameSession::advanceTurn() {
    state.nextTurn();
}

int GameSession::checkWinCondition() {
    for (const auto& player : players) {
        if (player.allFinished()) {
            return player.getId();
        }
    }
    return -1;
}

GameSnapshot GameSession::getSnapshot() const {
    GameSnapshot snapshot;
    snapshot.sessionId = sessionId;
    snapshot.currentPlayerId = state.getCurrentPlayer();
    snapshot.lastRoll = state.getLastRoll();
    snapshot.bonusTurn = state.hasBonusTurn();
    snapshot.winnerId = state.getWinnerId();
    snapshot.phase = toString(state.getPhase());
    snapshot.validMoves = validMovesForLastRoll;

    for (int r = 0; r < board.getSize(); ++r) {
        for (int c = 0; c < board.getSize(); ++c) {
            CellSnapshot cell;
            cell.row = r;
            cell.col = c;
            cell.safe = board.getCellAt(r, c).isSafeZone();

            const auto occupants = board.getCellAt(r, c).getOccupants();
            for (const auto* token : occupants) {
                if (token == nullptr) {
                    continue;
                }

                cell.occupants.push_back({
                    token->getTokenId(),
                    token->getOwnerId(),
                    token->getPathIndex(),
                    toString(token->getState()),
                });
            }

            snapshot.boardState.push_back(cell);
        }
    }

    for (const auto& player : players) {
        PlayerSnapshot ps;
        ps.playerId = player.getId();
        ps.name = player.getName();
        ps.color = toString(player.getColor());
        ps.hasKilled = player.getHasKilled();
        ps.finishedCount = player.getFinishedCount();

        for (const auto& token : player.getTokens()) {
            ps.tokens.push_back({
                token.getTokenId(),
                token.getOwnerId(),
                token.getPathIndex(),
                toString(token.getState()),
            });
        }

        snapshot.playerStates.push_back(ps);
    }

    return snapshot;
}

std::vector<int> GameSession::getValidMoves(int playerId) const {
    if (playerId != state.getCurrentPlayer()) {
        return {};
    }
    return validMovesForLastRoll;
}

const std::string& GameSession::getSessionId() const {
    return sessionId;
}

const GameState& GameSession::getState() const {
    return state;
}

PlayerColor GameSession::indexToColor(int index) const {
    switch (index) {
        case 0:
            return PlayerColor::RED;
        case 1:
            return PlayerColor::BLUE;
        case 2:
            return PlayerColor::GREEN;
        case 3:
            return PlayerColor::YELLOW;
        default:
            return PlayerColor::RED;
    }
}

}  // namespace challasaath
