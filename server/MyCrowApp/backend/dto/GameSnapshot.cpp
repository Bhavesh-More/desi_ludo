#include "GameSnapshot.h"

namespace challasaath {

nlohmann::json GameSnapshot::toJson() const {
    nlohmann::json j;

    j["sessionId"] = sessionId;
    j["currentPlayerId"] = currentPlayerId;
    j["lastRoll"] = lastRoll;
    j["bonusTurn"] = bonusTurn;
    j["winnerId"] = winnerId;
    j["phase"] = phase;
    j["validMoves"] = validMoves;

    j["boardState"] = nlohmann::json::array();
    for (const auto& cell : boardState) {
        nlohmann::json cellJson;
        cellJson["row"] = cell.row;
        cellJson["col"] = cell.col;
        cellJson["safe"] = cell.safe;
        cellJson["occupants"] = nlohmann::json::array();

        for (const auto& token : cell.occupants) {
            cellJson["occupants"].push_back({
                {"tokenId", token.tokenId},
                {"ownerId", token.ownerId},
                {"pathIndex", token.pathIndex},
                {"state", token.state},
            });
        }

        j["boardState"].push_back(cellJson);
    }

    j["playerStates"] = nlohmann::json::array();
    for (const auto& player : playerStates) {
        nlohmann::json playerJson;
        playerJson["playerId"] = player.playerId;
        playerJson["name"] = player.name;
        playerJson["color"] = player.color;
        playerJson["hasKilled"] = player.hasKilled;
        playerJson["finishedCount"] = player.finishedCount;
        playerJson["tokens"] = nlohmann::json::array();

        for (const auto& token : player.tokens) {
            playerJson["tokens"].push_back({
                {"tokenId", token.tokenId},
                {"ownerId", token.ownerId},
                {"pathIndex", token.pathIndex},
                {"state", token.state},
            });
        }

        j["playerStates"].push_back(playerJson);
    }

    return j;
}

}  // namespace challasaath
