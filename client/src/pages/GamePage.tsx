import { useGameStore } from "../store/gameStore"
import { motion } from "framer-motion"
import GameBoard from "../components/game/GameBoard"
import KawadiArea from "../components/game/KawadiArea"
import PlayerIndicator from "../components/ui/PlayerIndicator"

export default function GamePage() {

    const players = useGameStore((state) => state.players)
    const turnCount = useGameStore((state) => state.turnCount)
    const resetGame = useGameStore((state) => state.resetGame)
    const snapshot = useGameStore((state) => state.snapshot)

    const winner = snapshot?.winnerId ?? -1

    return (
        <motion.section
            className="game-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
        >

            <header className="game-topbar">
                <div>
                    <p className="topbar-kicker">Desi Ludo</p>
                    <h2 className="topbar-title">Match Board</h2>
                </div>

                <button className="ghost-btn" onClick={resetGame}>
                    Back To Menu
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
                    <KawadiArea />

                    <div className="stat-row">
                        <span>Players</span>
                        <strong>{players}</strong>
                    </div>

                    <div className="stat-row">
                        <span>Turn</span>
                        <strong>{turnCount}</strong>
                    </div>

                    <div className="stat-row">
                        <span>Winner</span>
                        <strong>{winner >= 0 ? `Player ${winner + 1}` : "-"}</strong>
                    </div>
                </motion.aside>
            </div>

        </motion.section>

    )
}