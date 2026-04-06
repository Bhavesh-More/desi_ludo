#pragma once

namespace challasaath {

class RollStrategy {
   public:
    virtual ~RollStrategy() = default;
    virtual int roll() = 0;
    virtual bool grantsBonus(int value) const = 0;
};

}  // namespace challasaath
