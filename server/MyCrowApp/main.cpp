#include <iostream>
#include <vector>

#include <nlohmann/json.hpp>

#include "backend/api/SessionRegistry.h"
#include "crow.h"

int main()
{
    crow::SimpleApp app;
    challasaath::SessionRegistry sessionRegistry;

    auto addCors = [](crow::response& res) {
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.add_header("Access-Control-Allow-Headers", "Content-Type");
    };

    CROW_ROUTE(app, "/")([]() { return "Challas Aath backend running"; });

    CROW_ROUTE(app, "/api/session/create").methods("POST"_method, "OPTIONS"_method)
    ([&sessionRegistry, &addCors](const crow::request& req) {
        if (req.method == crow::HTTPMethod::Options) {
            crow::response res(204);
            addCors(res);
            return res;
        }

        try {
            const auto body = nlohmann::json::parse(req.body);
            if (!body.contains("playerNames") || !body["playerNames"].is_array()) {
                crow::response res(400, R"({"error":"playerNames array is required"})");
                addCors(res);
                return res;
            }

            std::vector<std::string> names;
            for (const auto& item : body["playerNames"]) {
                if (!item.is_string()) {
                    crow::response res(400, R"({"error":"all playerNames must be strings"})");
                    addCors(res);
                    return res;
                }
                names.push_back(item.get<std::string>());
            }

            if (names.size() < 2 || names.size() > 4) {
                crow::response res(400, R"({"error":"player count must be between 2 and 4"})");
                addCors(res);
                return res;
            }

            auto session = sessionRegistry.createSession(names);

            nlohmann::json response;
            response["sessionId"] = session->getSessionId();
            response["snapshot"] = session->getSnapshot().toJson();

            crow::response res(201, response.dump());
            addCors(res);
            return res;
        } catch (const std::exception& ex) {
            crow::response res(400, nlohmann::json{{"error", ex.what()}}.dump());
            addCors(res);
            return res;
        }
    });

    CROW_ROUTE(app, "/api/session/<string>/state").methods("GET"_method, "OPTIONS"_method)
    ([&sessionRegistry, &addCors](const crow::request& req, const std::string& sessionId) {
        if (req.method == crow::HTTPMethod::Options) {
            crow::response res(204);
            addCors(res);
            return res;
        }

        auto session = sessionRegistry.getSession(sessionId);
        if (!session) {
            crow::response res(404, R"({"error":"session not found"})");
            addCors(res);
            return res;
        }

        crow::response res(200, session->getSnapshot().toJson().dump());
        addCors(res);
        return res;
    });

    CROW_ROUTE(app, "/api/session/<string>/roll").methods("POST"_method, "OPTIONS"_method)
    ([&sessionRegistry, &addCors](const crow::request& req, const std::string& sessionId) {
        if (req.method == crow::HTTPMethod::Options) {
            crow::response res(204);
            addCors(res);
            return res;
        }

        try {
            auto session = sessionRegistry.getSession(sessionId);
            if (!session) {
                crow::response res(404, R"({"error":"session not found"})");
                addCors(res);
                return res;
            }

            const auto body = nlohmann::json::parse(req.body);
            if (!body.contains("playerId") || !body["playerId"].is_number_integer()) {
                crow::response res(400, R"({"error":"playerId is required"})");
                addCors(res);
                return res;
            }

            const int playerId = body["playerId"].get<int>();
            const auto result = session->rollShells(playerId);

            crow::response res(200, result.dump());
            addCors(res);
            return res;
        } catch (const std::exception& ex) {
            crow::response res(400, nlohmann::json{{"error", ex.what()}}.dump());
            addCors(res);
            return res;
        }
    });

    CROW_ROUTE(app, "/api/session/<string>/move").methods("POST"_method, "OPTIONS"_method)
    ([&sessionRegistry, &addCors](const crow::request& req, const std::string& sessionId) {
        if (req.method == crow::HTTPMethod::Options) {
            crow::response res(204);
            addCors(res);
            return res;
        }

        try {
            auto session = sessionRegistry.getSession(sessionId);
            if (!session) {
                crow::response res(404, R"({"error":"session not found"})");
                addCors(res);
                return res;
            }

            const auto body = nlohmann::json::parse(req.body);
            if (!body.contains("playerId") || !body.contains("tokenId")) {
                crow::response res(400, R"({"error":"playerId and tokenId are required"})");
                addCors(res);
                return res;
            }

            const int playerId = body["playerId"].get<int>();
            const int tokenId = body["tokenId"].get<int>();

            const auto result = session->moveToken(playerId, tokenId);

            crow::response res(200, result.dump());
            addCors(res);
            return res;
        } catch (const std::exception& ex) {
            crow::response res(400, nlohmann::json{{"error", ex.what()}}.dump());
            addCors(res);
            return res;
        }
    });

    std::cout << "Server started at http://localhost:8080" << std::endl;
    app.port(8080).multithreaded().run();
}