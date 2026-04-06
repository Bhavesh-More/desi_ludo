#pragma once

#include <random>
#include <string>
#include <vector>

#include "RollStrategy.h"

namespace challasaath {

class CowrieRoll : public RollStrategy {
   private:
    int shellCount;
    std::mt19937 rng;
    std::bernoulli_distribution dist;
    std::vector<std::string> lastShellFaces;

    int countMouths();

   public:
    explicit CowrieRoll(int count = 4);

    int roll() override;
    bool grantsBonus(int value) const override;

    const std::vector<std::string>& getLastShellFaces() const;
};

}  // namespace challasaath
