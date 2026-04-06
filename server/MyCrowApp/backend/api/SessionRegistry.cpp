#include "SessionRegistry.h"

#include <chrono>
#include <sstream>

namespace challasaath {

std::string SessionRegistry::generateSessionId() const {
    const auto now = std::chrono::high_resolution_clock::now().time_since_epoch().count();
    std::stringstream ss;
    ss << "session-" << now;
    return ss.str();
}

std::shared_ptr<GameSession> SessionRegistry::createSession(const std::vector<std::string>& playerNames) {
    std::lock_guard<std::mutex> lock(mutex);

    const std::string sessionId = generateSessionId();
    auto session = std::make_shared<GameSession>(sessionId, playerNames);
    sessions[sessionId] = session;
    return session;
}

std::shared_ptr<GameSession> SessionRegistry::getSession(const std::string& sessionId) const {
    std::lock_guard<std::mutex> lock(mutex);

    auto it = sessions.find(sessionId);
    if (it == sessions.end()) {
        return nullptr;
    }
    return it->second;
}

}  // namespace challasaath
