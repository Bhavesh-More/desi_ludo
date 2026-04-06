#pragma once

#include <unordered_map>
#include <utility>
#include <vector>

#include "Cell.h"

namespace challasaath {

class Board {
   protected:
    int size;
    std::vector<std::vector<Cell>> grid;
    std::vector<std::pair<int, int>> path;
    std::unordered_map<long long, int> pathLookup;

    static long long keyFor(int r, int c);

   public:
    explicit Board(int boardSize);
    virtual ~Board() = default;

    virtual void buildPath() = 0;
    virtual bool isValidCell(int r, int c) const = 0;
    virtual bool isSafeZone(int r, int c) const = 0;

    Cell& getCellAt(int r, int c);
    const Cell& getCellAt(int r, int c) const;

    int getPathLength() const;
    int getPathIndex(int r, int c) const;
    const std::vector<std::pair<int, int>>& getPath() const;
    int getSize() const;

   protected:
    void rebuildPathLookup();
};

}  // namespace challasaath
