#pragma once

#include <string>

namespace challasaath {

enum class TokenState {
    AT_START,
    ACTIVE,
    FINISHED
};

enum class PlayerColor {
    RED,
    BLUE,
    GREEN,
    YELLOW
};

enum class GamePhase {
    WAITING,
    IN_PROGRESS,
    FINISHED
};

inline std::string toString(TokenState state) {
    switch (state) {
        case TokenState::AT_START:
            return "AT_START";
        case TokenState::ACTIVE:
            return "ACTIVE";
        case TokenState::FINISHED:
            return "FINISHED";
        default:
            return "AT_START";
    }
}

inline std::string toString(PlayerColor color) {
    switch (color) {
        case PlayerColor::RED:
            return "red";
        case PlayerColor::BLUE:
            return "blue";
        case PlayerColor::GREEN:
            return "green";
        case PlayerColor::YELLOW:
            return "yellow";
        default:
            return "red";
    }
}

inline std::string toString(GamePhase phase) {
    switch (phase) {
        case GamePhase::WAITING:
            return "WAITING";
        case GamePhase::IN_PROGRESS:
            return "IN_PROGRESS";
        case GamePhase::FINISHED:
            return "FINISHED";
        default:
            return "WAITING";
    }
}

}  // namespace challasaath
