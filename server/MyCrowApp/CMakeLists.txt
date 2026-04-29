cmake_minimum_required(VERSION 3.10)
project(MyCrowApp)

set(CMAKE_CXX_STANDARD 17)

include(FetchContent)

# Crow (includes Asio as a dependency automatically)
FetchContent_Declare(
    Crow
    GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
    GIT_TAG        v1.2.0
)
FetchContent_MakeAvailable(Crow)

# nlohmann/json
FetchContent_Declare(
    nlohmann_json
    GIT_REPOSITORY https://github.com/nlohmann/json.git
    GIT_TAG        v3.11.3
)
FetchContent_MakeAvailable(nlohmann_json)

file(GLOB_RECURSE BACKEND_SOURCES
    "backend/*.cpp"
)

add_executable(MyCrowApp
    main.cpp
    ${BACKEND_SOURCES}
)

target_include_directories(MyCrowApp PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
)

target_link_libraries(MyCrowApp
    Crow::Crow
    nlohmann_json::nlohmann_json
)