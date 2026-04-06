#include "Board.h"

#include <stdexcept>

namespace challasaath {

Board::Board(int boardSize) : size(boardSize), grid(boardSize, std::vector<Cell>(boardSize)) {
    for (int r = 0; r < boardSize; ++r) {
        for (int c = 0; c < boardSize; ++c) {
            grid[r][c] = Cell(r, c, false);
        }
    }
}

long long Board::keyFor(int r, int c) {
    return (static_cast<long long>(r) << 32) | static_cast<unsigned int>(c);
}

Cell& Board::getCellAt(int r, int c) {
    if (!isValidCell(r, c)) {
        throw std::out_of_range("invalid board cell");
    }
    return grid[r][c];
}

const Cell& Board::getCellAt(int r, int c) const {
    if (!isValidCell(r, c)) {
        throw std::out_of_range("invalid board cell");
    }
    return grid[r][c];
}

int Board::getPathLength() const {
    return static_cast<int>(path.size());
}

int Board::getPathIndex(int r, int c) const {
    auto it = pathLookup.find(keyFor(r, c));
    if (it == pathLookup.end()) {
        return -1;
    }
    return it->second;
}

const std::vector<std::pair<int, int>>& Board::getPath() const {
    return path;
}

int Board::getSize() const {
    return size;
}

void Board::rebuildPathLookup() {
    pathLookup.clear();
    for (int i = 0; i < static_cast<int>(path.size()); ++i) {
        pathLookup[keyFor(path[i].first, path[i].second)] = i;
    }
}

}  // namespace challasaath
