import { useGameStore } from "../../store/gameStore"
import { motion } from "framer-motion"

const playerColors: Record<string, string> = {
    red:    "#EB001B",
    blue:   "#2C7BE5",
    green:  "#10A66D",
    yellow: "#D49B00",
}

export default function PlayerIndicator() {
    const snapshot = useGameStore((s) => s.snapshot)

    const playerOrder = snapshot?.playerStates.map((p) => p.color) ?? []
    const activePlayerIndex = snapshot?.currentPlayerId ?? 0
    const currentPlayer =
        snapshot?.playerStates.find((p) => p.playerId === activePlayerIndex)?.color ?? "red"

    return (
        <section className="player-card">
            <h3 className="section-title">Turn Indicator</h3>

            <motion.p
                className="current-player-copy"
                key={`active-${activePlayerIndex}`}
                initial={{ opacity: 0.35, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
            >
                Active player:
                <span
                    className="player-name"
                    style={{ color: playerColors[currentPlayer] }}
                >
                    {currentPlayer}
                </span>
            </motion.p>

            <div className="player-list">
                {playerOrder.map((player, index) => (
                    <motion.div
                        key={`${player}-${index}`}
                        className={`player-chip ${index === activePlayerIndex ? "is-active" : ""}`}
                        style={{
                            borderColor: playerColors[player],
                            background: index === activePlayerIndex
                                ? playerColors[player]
                                : "transparent",
                            color: index === activePlayerIndex ? "#fff" : playerColors[player],
                        }}
                        animate={{ scale: index === activePlayerIndex ? 1.04 : 1 }}
                        transition={{ type: "spring", stiffness: 280, damping: 20 }}
                    >
                        {player}
                    </motion.div>
                ))}
            </div>
        </section>
    )
}
