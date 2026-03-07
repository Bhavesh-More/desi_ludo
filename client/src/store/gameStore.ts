import { create } from "zustand"
import { createSession, throwKawadi } from "../api/gameApi"
import { type GameState, type PlayerColor } from "../types/gameTypes"

interface GameStore extends GameState {

    startGame: (players: number) => Promise<void>

    throwKawadiPreview: () => Promise<void>

    resetGame: () => void

    getCurrentPlayer: () => PlayerColor
}

export const useGameStore = create<GameStore>((set, get) => ({

    started: false,

    players: 2,

    playerOrder: ["red", "blue"],

    activePlayerIndex: 0,

    kawadiValue: null,

    shellFaces: ["back", "back", "back", "back"],

    isRolling: false,

    turnCount: 1,

    backendMode: "mock",

    startGame: async (players) => {

        const session = await createSession(players)

        set({
            started: true,
            players,
            playerOrder: session.playerOrder,
            activePlayerIndex: 0,
            kawadiValue: null,
            shellFaces: ["back", "back", "back", "back"],
            isRolling: false,
            turnCount: 1
        })

    },

    throwKawadiPreview: async () => {

        set({ isRolling: true })

        const result = await throwKawadi()

        set((state) => ({
            shellFaces: result.shellFaces,
            kawadiValue: result.moveValue,
            activePlayerIndex: (state.activePlayerIndex + 1) % state.playerOrder.length,
            turnCount: state.turnCount + 1,
            isRolling: false
        }))

    },

    resetGame: () => set({
        started: false,
        players: 2,
        playerOrder: ["red", "blue"],
        activePlayerIndex: 0,
        kawadiValue: null,
        shellFaces: ["back", "back", "back", "back"],
        isRolling: false,
        turnCount: 1,
        backendMode: "mock"
    }),

    getCurrentPlayer: () => {
        const state = get()
        return state.playerOrder[state.activePlayerIndex] ?? "red"
    }

}))