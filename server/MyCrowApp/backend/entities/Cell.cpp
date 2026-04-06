#include "Cell.h"

#include <algorithm>

#include "Token.h"

namespace challasaath {

Cell::Cell(int r, int c, bool isSafe) : row(r), col(c), safe(isSafe) {}

int Cell::getRow() const {
    return row;
}

int Cell::getCol() const {
    return col;
}

bool Cell::isSafeZone() const {
    return safe;
}

void Cell::setSafe(bool isSafe) {
    safe = isSafe;
}

void Cell::addOccupant(Token* token) {
    if (token == nullptr) {
        return;
    }
    occupants.push_back(token);
}

void Cell::removeOccupant(Token* token) {
    occupants.erase(std::remove(occupants.begin(), occupants.end(), token), occupants.end());
}

std::vector<Token*> Cell::getOccupants() const {
    return occupants;
}

}  // namespace challasaath
