cmake_minimum_required(VERSION 3.10)
project(MyCrowApp)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Crow CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)

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

target_link_libraries(MyCrowApp PRIVATE
	Crow::Crow
	nlohmann_json::nlohmann_json
	ws2_32
	mswsock
)