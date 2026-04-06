#include "ChallasAathBoard.h"

namespace challasaath {

ChallasAathBoard::ChallasAathBoard(int size) : Board(size), gridSize(size) {
    const int mid = gridSize / 2;
    getCellAt(0, mid).setSafe(true);
    getCellAt(mid, 0).setSafe(true);
    getCellAt(mid, gridSize - 1).setSafe(true);
    getCellAt(gridSize - 1, mid).setSafe(true);
    getCellAt(mid - 1, mid).setSafe(true);
    getCellAt(mid, mid + 1).setSafe(true);
    getCellAt(mid + 1, mid).setSafe(true);
    getCellAt(mid, mid - 1).setSafe(true);
    getCellAt(mid, mid).setSafe(true);

    buildPath();
}

void ChallasAathBoard::buildPath() {
    path.clear();

    int top = 0;
    int bottom = gridSize - 1;
    int left = 0;
    int right = gridSize - 1;

    while (top <= bottom && left <= right) {
        for (int c = left; c <= right; ++c) {
            path.push_back({top, c});
        }
        ++top;

        for (int r = top; r <= bottom; ++r) {
            path.push_back({r, right});
        }
        --right;

        if (top <= bottom) {
            for (int c = right; c >= left; --c) {
                path.push_back({bottom, c});
            }
            --bottom;
        }

        if (left <= right) {
            for (int r = bottom; r >= top; --r) {
                path.push_back({r, left});
            }
            ++left;
        }
    }

    rebuildPathLookup();
}

bool ChallasAathBoard::isValidCell(int r, int c) const {
    return r >= 0 && r < gridSize && c >= 0 && c < gridSize;
}

bool ChallasAathBoard::isSafeZone(int r, int c) const {
    if (!isValidCell(r, c)) {
        return false;
    }
    return getCellAt(r, c).isSafeZone();
}

std::vector<int> ChallasAathBoard::getSafeZoneIndices() const {
    std::vector<int> indices;
    for (int i = 0; i < getPathLength(); ++i) {
        const auto [r, c] = path[i];
        if (isSafeZone(r, c)) {
            indices.push_back(i);
        }
    }
    return indices;
}

}  // namespace challasaath
