export type PlayerColor = "red" | "blue" | "green" | "yellow"

export type ShellFace = "front" | "back"

export type TokenState = "AT_START" | "ACTIVE" | "FINISHED"

export interface TokenSnapshot {
    tokenId: number
    ownerId: number
    pathIndex: number
    state: TokenState
}

export interface PlayerSnapshot {
    playerId: number
    name: string
    color: PlayerColor
    hasKilled: boolean
    finishedCount: number
    tokens: TokenSnapshot[]
}

export interface CellSnapshot {
    row: number
    col: number
    safe: boolean
    occupants: TokenSnapshot[]
}

export interface GameSnapshot {
    sessionId: string
    currentPlayerId: number
    lastRoll: number
    bonusTurn: boolean
    winnerId: number
    phase: "WAITING" | "IN_PROGRESS" | "FINISHED"
    validMoves: number[]
    boardState: CellSnapshot[]
    playerStates: PlayerSnapshot[]
}

export interface GameState {
    started: boolean
    players: number
    sessionId: string | null
    playerOrder: PlayerColor[]
    activePlayerIndex: number
    kawadiValue: number | null
    shellFaces: ShellFace[]
    validMoves: number[]
    isRolling: boolean
    hasThrownThisTurn: boolean
    turnCount: number
    snapshot: GameSnapshot | null
    backendMode: "live"
    error: string | null
}