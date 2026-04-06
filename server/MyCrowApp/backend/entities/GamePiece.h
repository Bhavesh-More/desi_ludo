#pragma once

#include <string>
#include <utility>

namespace challasaath {

class GamePiece {
   protected:
    int id;
    int row;
    int col;

   public:
    explicit GamePiece(int pieceId, int initialRow = -1, int initialCol = -1);
    virtual ~GamePiece() = default;

    std::pair<int, int> getPosition() const;
    int getId() const;
    bool isAt(int r, int c) const;
    void setPosition(int r, int c);

    virtual std::string getType() const = 0;
};

}  // namespace challasaath
