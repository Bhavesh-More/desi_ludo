# Run Backend in UCRT64 (Step by Step)

Use this guide to build and run the C++ backend on Windows with MSYS2 UCRT64.

## 1) Open the correct shell

Open:
- MSYS2 UCRT64

or add this in open user settings (JSON)

```json
  "terminal.integrated.profiles.windows": {
    "MSYS2 UCRT64": {
      "path": "C:\\msys64\\usr\\bin\\bash.exe",
      "args": ["--login", "-i"],
      "env": {
        "MSYSTEM": "UCRT64",
        "CHERE_INVOKING": "1",
      },
    },
  },
  "terminal.integrated.defaultProfile.windows": "MSYS2 UCRT64",

```

## 2) Go to backend folder

```bash
cd /d/Project/desi_ludo/server/MyCrowApp
```

## 3) Install vcpkg packages (required for Crow)

If this is your first setup on this machine, bootstrap vcpkg and install dependencies.

```bash
cd /d/Project/desi_ludo/server/vcpkg
./bootstrap-vcpkg.bat
./vcpkg.exe install crow:x64-windows nlohmann-json:x64-windows asio:x64-windows
```

Then return to backend project folder:

```bash
cd /d/Project/desi_ludo/server/MyCrowApp
```

## 4) Configure CMake (first time, or after clean)

```bash
cmake -S . -B build -G "MinGW Makefiles" \
  -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_TOOLCHAIN_FILE="../vcpkg/scripts/buildsystems/vcpkg.cmake" \
  -DVCPKG_TARGET_TRIPLET=x64-windows
```

## 5) Build backend

```bash
cmake --build build -j
```

Expected output includes:
- Built target MyCrowApp

Executable path:
- build/MyCrowApp.exe

## 6) Run backend server

From MyCrowApp folder:

```bash
./build/MyCrowApp.exe
```

Or if you are already inside build folder:

```bash
./MyCrowApp.exe
```

Expected startup logs include:
- Server started at http://localhost:8080

## 7) Verify server health

Open another UCRT64 terminal and run:

```bash
curl -sS http://localhost:8080/
```

Expected response:

```text
Challas Aath backend running
```

## 8) Verify API with session creation

```bash
curl -sS -X POST http://localhost:8080/api/session/create \
  -H "Content-Type: application/json" \
  -d '{"playerNames":["Player 1","Player 2"]}'
```

Expected response:
- JSON containing sessionId and snapshot

## 9) Stop backend

In server terminal:
- Press Ctrl + C

## Troubleshooting

1. Error: main.cpp not found
- You are in wrong folder. Run:

```bash
cd /d/Project/desi_ludo/server/MyCrowApp
```

2. Link error with winsock symbols (WSASend, AcceptEx, etc.)
- Ensure backend is built through CMake (not single-file g++ compile).

3. CMake cannot find Crow or nlohmann_json
- Run vcpkg install step again:

```bash
cd /d/Project/desi_ludo/server/vcpkg
./vcpkg.exe install crow:x64-windows nlohmann-json:x64-windows asio:x64-windows
```

4. Permission denied for MyCrowApp.exe while linking
- Old process is still running. Kill it and rebuild:

```bash
taskkill //IM MyCrowApp.exe //F
cmake --build build -j
```

5. Port 8080 already in use
- Stop existing backend process, then run server again.

## Important note

Do not use single-file compile command for this backend.
The project has multiple source files and CMake-managed dependencies.
