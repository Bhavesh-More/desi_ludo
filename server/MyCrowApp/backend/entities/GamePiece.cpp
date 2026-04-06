#include "GamePiece.h"

namespace challasaath {

GamePiece::GamePiece(int pieceId, int initialRow, int initialCol)
    : id(pieceId), row(initialRow), col(initialCol) {}

std::pair<int, int> GamePiece::getPosition() const {
    return {row, col};
}

int GamePiece::getId() const {
    return id;
}

bool GamePiece::isAt(int r, int c) const {
    return row == r && col == c;
}

void GamePiece::setPosition(int r, int c) {
    row = r;
    col = c;
}

}  // namespace challasaath
