#pragma once

#include <vector>

namespace challasaath {

class Token;

class Cell {
   private:
    int row;
    int col;
    bool safe;
    std::vector<Token*> occupants;

   public:
    Cell(int r = 0, int c = 0, bool isSafe = false);

    int getRow() const;
    int getCol() const;
    bool isSafeZone() const;
    void setSafe(bool isSafe);

    void addOccupant(Token* token);
    void removeOccupant(Token* token);
    std::vector<Token*> getOccupants() const;
};

}  // namespace challasaath
