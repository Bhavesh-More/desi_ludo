#include <iostream>
#include <vector>

#include <nlohmann/json.hpp>

#include "backend/api/SessionRegistry.h"
#include "crow.h"
#include "crow/middlewares/cors.h"

int main()
{
    crow::App<crow::CORSHandler> app;

    app.get_middleware<crow::CORSHandler>()
        .global()
        .headers("Content-Type")
        .methods("POST"_method, "GET"_method, "OPTIONS"_method)
        .origin("*");

    challasaath::SessionRegistry sessionRegistry;

    CROW_ROUTE(app, "/")([]() { return "Challas Aath backend running"; });

    CROW_ROUTE(app, "/api/session/create").methods("POST"_method)
    ([&sessionRegistry](const crow::request& req) {
        try {
            const auto body = nlohmann::json::parse(req.body);
            if (!body.contains("playerNames") || !body["playerNames"].is_array()) {
                return crow::response(400, R"({"error":"playerNames array is required"})");
            }

            std::vector<std::string> names;
            for (const auto& item : body["playerNames"]) {
                if (!item.is_string()) {
                    return crow::response(400, R"({"error":"all playerNames must be strings"})");
                }
                names.push_back(item.get<std::string>());
            }

            if (names.size() < 2 || names.size() > 4) {
                return crow::response(400, R"({"error":"player count must be between 2 and 4"})");
            }

            auto session = sessionRegistry.createSession(names);

            nlohmann::json response;
            response["sessionId"] = session->getSessionId();
            response["snapshot"] = session->getSnapshot().toJson();

            return crow::response(201, response.dump());
        } catch (const std::exception& ex) {
            nlohmann::json err;
            err["error"] = ex.what();
            return crow::response(400, err.dump());
        }
    });

    CROW_ROUTE(app, "/api/session/<string>/state").methods("GET"_method)
    ([&sessionRegistry](const std::string& sessionId) {
        auto session = sessionRegistry.getSession(sessionId);
        if (!session) {
            return crow::response(404, R"({"error":"session not found"})");
        }
        return crow::response(200, session->getSnapshot().toJson().dump());
    });

    CROW_ROUTE(app, "/api/session/<string>/roll").methods("POST"_method)
    ([&sessionRegistry](const crow::request& req, const std::string& sessionId) {
        try {
            auto session = sessionRegistry.getSession(sessionId);
            if (!session) {
                return crow::response(404, R"({"error":"session not found"})");
            }

            const auto body = nlohmann::json::parse(req.body);
            if (!body.contains("playerId") || !body["playerId"].is_number_integer()) {
                return crow::response(400, R"({"error":"playerId is required"})");
            }

            const int playerId = body["playerId"].get<int>();
            const auto result = session->rollShells(playerId);
            return crow::response(200, result.dump());
        } catch (const std::exception& ex) {
            nlohmann::json err;
            err["error"] = ex.what();
            return crow::response(400, err.dump());
        }
    });

    CROW_ROUTE(app, "/api/session/<string>/move").methods("POST"_method)
    ([&sessionRegistry](const crow::request& req, const std::string& sessionId) {
        try {
            auto session = sessionRegistry.getSession(sessionId);
            if (!session) {
                return crow::response(404, R"({"error":"session not found"})");
            }

            const auto body = nlohmann::json::parse(req.body);
            if (!body.contains("playerId") || !body.contains("tokenId")) {
                return crow::response(400, R"({"error":"playerId and tokenId are required"})");
            }

            const int playerId = body["playerId"].get<int>();
            const int tokenId = body["tokenId"].get<int>();

            const auto result = session->moveToken(playerId, tokenId);
            return crow::response(200, result.dump());
        } catch (const std::exception& ex) {
            nlohmann::json err;
            err["error"] = ex.what();
            return crow::response(400, err.dump());
        }
    });

    std::cout << "Server started at http://localhost:8080" << std::endl;
    app.port(8080).multithreaded().run();
}
