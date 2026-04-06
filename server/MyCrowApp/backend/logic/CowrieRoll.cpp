#include "CowrieRoll.h"

#include <chrono>

namespace challasaath {

CowrieRoll::CowrieRoll(int count)
    : shellCount(count),
      rng(static_cast<unsigned int>(std::chrono::steady_clock::now().time_since_epoch().count())),
      dist(0.5) {}

int CowrieRoll::countMouths() {
    int mouths = 0;
    lastShellFaces.clear();
    for (int i = 0; i < shellCount; ++i) {
        const bool isMouthUp = dist(rng);
        lastShellFaces.push_back(isMouthUp ? "front" : "back");
        if (isMouthUp) {
            ++mouths;
        }
    }
    return mouths;
}

int CowrieRoll::roll() {
    const int mouths = countMouths();

    if (mouths == 0) {
        return 4;
    }
    if (mouths == shellCount) {
        return 8;
    }
    return mouths;
}

bool CowrieRoll::grantsBonus(int value) const {
    return value == 4 || value == 8;
}

const std::vector<std::string>& CowrieRoll::getLastShellFaces() const {
    return lastShellFaces;
}

}  // namespace challasaath
