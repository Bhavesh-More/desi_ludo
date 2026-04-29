import { useGameStore } from "../store/gameStore"
import { motion, AnimatePresence } from "framer-motion"
import GameBoard from "../components/game/GameBoard"
import KawadiArea from "../components/game/KawadiArea"
import PlayerIndicator from "../components/ui/PlayerIndicator"
import { useEffect, useRef, useState } from "react"
import type { PlayerSnapshot } from "../types/gameTypes"

export default function GamePage() {
    const players = useGameStore((state) => state.players)
    const turnCount = useGameStore((state) => state.turnCount)
    const resetGame = useGameStore((state) => state.resetGame)
    const snapshot = useGameStore((state) => state.snapshot)
    const activePlayerIndex = snapshot?.currentPlayerId ?? 0
    const currentPlayer =
        snapshot?.playerStates.find((p) => p.playerId === activePlayerIndex)?.color ?? "red"
        

    const [showWinnerModal, setShowWinnerModal] = useState(false)

    const mainDivRef = useRef<HTMLDivElement>(null)
    const [rankings, setRankings] = useState<PlayerSnapshot[]>([])

    const PLAYER_COLORS: Record<string, string> = {
    red:    "#EB001B",
    blue:   "#2C7BE5",
    green:  "#10A66D",
    yellow: "#D49B00",
}

const PLAYER_COLOR_NAMES: Record<string, string> = {
    red:    "Red",
    blue:   "Blue",
    green:  "Green",
    yellow: "Yellow",
}

    const winner = snapshot?.winnerId ?? -1

    const winnerPlayer = snapshot?.playerStates.find((p) => p.playerId === winner)
    const winnerColor = winnerPlayer?.color ?? "red"
    const winnerColorHex = PLAYER_COLORS[winnerColor] ?? "#141413"
    const winnerColorName = PLAYER_COLOR_NAMES[winnerColor] ?? "Unknown"

useEffect(() => {
    const el = mainDivRef.current
    if (!el) return

    const color = PLAYER_COLORS[currentPlayer] ?? "#F3F0EE"

    el!.style.transition = "background-color 0.3s ease"
    el.style.backgroundColor = `${color}80`

    const timer = setTimeout(() => {
        el.style.backgroundColor = ""
    }, 1000)

    return () => {
        clearTimeout(timer)
        el.style.backgroundColor = ""
    }
}, [activePlayerIndex])  

useEffect(() => {
    if (!snapshot) return

    // 2-player: use winnerId as before
    if (players === 2 && winner >= 0) {
        const sorted = [...snapshot.playerStates].sort((a, b) => b.finishedCount - a.finishedCount)
        setRankings(sorted)
        setShowWinnerModal(true)
        return
    }

    // 3/4-player: trigger on phase FINISHED (backend sets this when n-1 done)
    if (players > 2 && snapshot.phase === "FINISHED" && !showWinnerModal) {
        const sorted = [...snapshot.playerStates].sort((a, b) => b.finishedCount - a.finishedCount)
        setRankings(sorted)
        setShowWinnerModal(true)
    }
}, [snapshot, winner, players, showWinnerModal])


    return (
        <motion.div
            ref={mainDivRef}
            className="game-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <header className="game-topbar">
                <div>
                    <p className="topbar-kicker">Desi Ludo</p>
                    <h2 className="topbar-title">Match Board</h2>
                </div>
                <button className="ghost-btn" onClick={resetGame}>
                    ← Back
                </button>
            </header>

            <div className="game-layout">
                <motion.div
                    className="board-panel"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
                >
                    <GameBoard />
                </motion.div>

                <motion.aside
                    className="hud-panel"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.12 }}
                >
                    <PlayerIndicator />
                    <KawadiArea  />

                    <div className="stat-row">
                        <span>Players</span>
                        <strong>{players}</strong>
                    </div>

                    <div className="stat-row">
                        <span>Turn</span>
                        <strong>{turnCount}</strong>
                    </div>

<AnimatePresence>
    {showWinnerModal && (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
                className="modal-card"
                initial={{ scale: 0.6, y: 40, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.6, y: 40, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                <div style={{ height: "6px", borderRadius: "12px 12px 0 0", background: winnerColorHex, margin: "-2rem -2rem 1.5rem" }} />

                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: winnerColorHex, border: "3px solid rgba(255,255,255,0.6)", boxShadow: `0 8px 24px ${winnerColorHex}55`, margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>
                    🏆
                </div>

                {/* Headline: "Winner" for 2p, "Game Ended" for 3/4p */}
                <p style={{ margin: "0 0 0.25rem", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--slate)" }}>
                    {players === 2 ? "Winner" : "Game Ended"}
                </p>

                {players === 2 ? (
                    <>
                        <h2 style={{ margin: "0 0 0.5rem", fontFamily: "var(--font-main)", fontSize: "2rem", fontWeight: 500, letterSpacing: "-0.03em", color: winnerColorHex, textTransform: "capitalize" }}>
                            {winnerColorName}
                        </h2>
                        <p style={{ margin: "0 0 1.5rem", fontSize: "13px", color: "var(--slate)", fontWeight: 450 }}>
                            Dominated the board.
                        </p>
                    </>
                ) : (
                    <div style={{ width: "100%", margin: "0.75rem 0 1.25rem" }}>
                        {rankings.map((p, i) => {
                            const hex = PLAYER_COLORS[p.color] ?? "#141413"
                            const name = PLAYER_COLOR_NAMES[p.color] ?? p.color
                            const medals = ["🥇", "🥈", "🥉", "🏅"]
                            return (
                                <div key={p.playerId} style={{
                                    display: "flex", alignItems: "center", gap: "10px",
                                    padding: "8px 12px", marginBottom: "6px",
                                    borderRadius: "10px",
                                    background: i === 0 ? `${hex}22` : "var(--color-bg-secondary, #f5f5f5)",
                                    border: i === 0 ? `1.5px solid ${hex}55` : "1px solid rgba(0,0,0,0.08)",
                                }}>
                                    <span style={{ fontSize: "18px", width: "24px", textAlign: "center" }}>
                                        {medals[i] ?? `#${i + 1}`}
                                    </span>
                                    <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: hex, flexShrink: 0 }} />
                                    <span style={{ flex: 1, fontWeight: i === 0 ? 500 : 400, color: i === 0 ? hex : "inherit", textTransform: "capitalize", fontSize: "14px" }}>
                                        {name}
                                    </span>
                                    <span style={{ fontSize: "12px", color: "var(--slate)" }}>
                                        {p.finishedCount}/4 tokens
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}

                <div style={{ width: "40px", height: "2px", background: winnerColorHex, borderRadius: "2px", margin: "0 auto 1.5rem" }} />

                <div className="modal-actions">
                    <button className="primary-btn" style={{ margin: 0 }} onClick={() => { setShowWinnerModal(false); resetGame() }}>
                        New Game
                    </button>
                    <button className="ghost-btn" onClick={() => setShowWinnerModal(false)}>
                        Close
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )}
</AnimatePresence>
                   <div className="stat-row">
    <span>Winner</span>
    <strong style={{ color: winner >= 0 ? winnerColorHex : "var(--ink)", textTransform: "capitalize" }}>
        {winner >= 0 ? winnerColorName : "—"}
    </strong>
</div>
                </motion.aside>
            </div>
        </motion.div>
    )
}
