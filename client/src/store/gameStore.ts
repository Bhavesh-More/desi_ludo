import { create } from "zustand"
import { createSession, getSessionState, moveToken, rollShells } from "../api/gameApi"
import { type GameState, type PlayerColor } from "../types/gameTypes"

interface GameStore extends GameState {

    startGame: (players: number) => Promise<void>

    throwKawadiPreview: () => Promise<void>

    moveSelectedToken: (tokenId: number) => Promise<void>

    refreshState: () => Promise<void>

    resetGame: () => void

    getCurrentPlayer: () => PlayerColor
}

export const useGameStore = create<GameStore>((set, get) => ({

    started: false,

    players: 2,

    sessionId: null,

    playerOrder: ["red", "blue"],

    activePlayerIndex: 0,

    kawadiValue: null,

    shellFaces: ["back", "back", "back", "back"],

    validMoves: [],

    isRolling: false,

    turnCount: 1,

    snapshot: null,

    backendMode: "live",

    error: null,

    startGame: async (players) => {
        const playerNames = Array.from({ length: players }, (_, i) => `Player ${i + 1}`)
        const session = await createSession(playerNames)
        const snapshot = session.snapshot

        set({
            started: true,
            players,
            sessionId: session.sessionId,
            playerOrder: snapshot.playerStates.map((p) => p.color),
            activePlayerIndex: snapshot.currentPlayerId,
            kawadiValue: snapshot.lastRoll,
            shellFaces: ["back", "back", "back", "back"],
            validMoves: snapshot.validMoves,
            isRolling: false,
            turnCount: 1,
            snapshot,
            error: null
        })

    },

    throwKawadiPreview: async () => {

        const state = get()
        if (!state.sessionId || !state.snapshot) {
            return
        }

        if (state.snapshot.winnerId >= 0) {
            return
        }

        set({ isRolling: true })

        try {
            const result = await rollShells(state.sessionId, state.snapshot.currentPlayerId)

            set((prev) => ({
                shellFaces: result.shellFaces,
                kawadiValue: result.roll,
                validMoves: result.validMoves,
                snapshot: result.snapshot,
                activePlayerIndex: result.snapshot.currentPlayerId,
                isRolling: false,
                turnCount: prev.turnCount + 1,
                error: null
            }))
        } catch (error) {
            set({
                isRolling: false,
                error: error instanceof Error ? error.message : "Roll failed"
            })
        }

    },

    moveSelectedToken: async (tokenId) => {
        const state = get()
        if (!state.sessionId || !state.snapshot) {
            return
        }

        try {
            const result = await moveToken(state.sessionId, state.snapshot.currentPlayerId, tokenId)

            set({
                snapshot: result.snapshot,
                activePlayerIndex: result.snapshot.currentPlayerId,
                validMoves: result.snapshot.validMoves,
                kawadiValue: result.snapshot.lastRoll,
                error: null
            })
        } catch (error) {
            set({ error: error instanceof Error ? error.message : "Move failed" })
        }

    },

    refreshState: async () => {
        const state = get()
        if (!state.sessionId) {
            return
        }

        const snapshot = await getSessionState(state.sessionId)

        set({
            snapshot,
            activePlayerIndex: snapshot.currentPlayerId,
            playerOrder: snapshot.playerStates.map((p) => p.color),
            validMoves: snapshot.validMoves,
            kawadiValue: snapshot.lastRoll
        })

    },

    resetGame: () => set({
        started: false,
        players: 2,
        sessionId: null,
        playerOrder: ["red", "blue"],
        activePlayerIndex: 0,
        kawadiValue: null,
        shellFaces: ["back", "back", "back", "back"],
        validMoves: [],
        isRolling: false,
        turnCount: 1,
        snapshot: null,
        backendMode: "live",
        error: null
    }),

    getCurrentPlayer: () => {
        const state = get()
        return state.playerOrder[state.activePlayerIndex] ?? "red"
    }

}))