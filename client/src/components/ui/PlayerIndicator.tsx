import { useGameStore } from "../../store/gameStore"
import { motion } from "framer-motion"

export default function PlayerIndicator() {

    const snapshot = useGameStore((s) => s.snapshot)

    const playerOrder = snapshot?.playerStates.map((p) => p.color) ?? []
    const activePlayerIndex = snapshot?.currentPlayerId ?? 0
    const currentPlayer = snapshot?.playerStates.find((p) => p.playerId === activePlayerIndex)?.color ?? "red"

    const colors = {
        red: "#d94848",
        blue: "#2c7be5",
        green: "#10a66d",
        yellow: "#d49b00"
    }

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
                    style={{ color: colors[currentPlayer] }}
                >
                    {currentPlayer}
                </span>
            </motion.p>

            <div className="player-list">
                {playerOrder.map((player, index) => (
                    <motion.div
                        key={`${player}-${index}`}
                        className={`player-chip ${index === activePlayerIndex ? "is-active" : ""}`}
                        style={{ borderColor: colors[player] }}
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