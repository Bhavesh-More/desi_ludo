#pragma once

#include <string>

#include "GamePiece.h"

namespace challasaath {

class Obstacle : public GamePiece {
   private:
    std::string obstacleType;

   public:
    explicit Obstacle(int obstacleId, const std::string& type = "block")
        : GamePiece(obstacleId), obstacleType(type) {}

    std::string getType() const override {
        return "obstacle";
    }
};

}  // namespace challasaath
