export type PlayerColor = "red" | "blue" | "green" | "yellow"

export type ShellFace = "front" | "back"

export interface GameState {
    started: boolean
    players: number
    playerOrder: PlayerColor[]
    activePlayerIndex: number
    kawadiValue: number | null
    shellFaces: ShellFace[]
    isRolling: boolean
    turnCount: number
    backendMode: "mock" | "live"
}