#pragma once

#include <vector>

#include "Board.h"

namespace challasaath {

class ChallasAathBoard : public Board {
   private:
    int gridSize;

   public:
    explicit ChallasAathBoard(int size = 5);

    void buildPath() override;
    bool isValidCell(int r, int c) const override;
    bool isSafeZone(int r, int c) const override;
    std::vector<int> getSafeZoneIndices() const;
};

}  // namespace challasaath
