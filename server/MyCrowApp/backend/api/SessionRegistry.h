#pragma once

#include <memory>
#include <mutex>
#include <string>
#include <unordered_map>
#include <vector>

#include "../orchestration/GameSession.h"

namespace challasaath {

class SessionRegistry {
   private:
    std::unordered_map<std::string, std::shared_ptr<GameSession>> sessions;
    mutable std::mutex mutex;

    std::string generateSessionId() const;

   public:
    std::shared_ptr<GameSession> createSession(const std::vector<std::string>& playerNames);
    std::shared_ptr<GameSession> getSession(const std::string& sessionId) const;
};

}  // namespace challasaath
