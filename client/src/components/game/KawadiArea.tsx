import { useGameStore } from "../../store/gameStore"
import { motion } from "framer-motion"

export default function KawadiArea() {

    const throwKawadiPreview = useGameStore((s) => s.throwKawadiPreview)
    const kawadiValue = useGameStore((s) => s.kawadiValue)
    const shellFaces = useGameStore((s) => s.shellFaces)
    const isRolling = useGameStore((s) => s.isRolling)
    const hasThrownThisTurn = useGameStore((s) => s.hasThrownThisTurn)
    const validMoves = useGameStore((s) => s.validMoves)
    const snapshot = useGameStore((s) => s.snapshot)
    const error = useGameStore((s) => s.error)

    const throwShell = async () => {

        await throwKawadiPreview()

    }

    return (

        <section className="kawadi-card">

            <h3 className="section-title">Kawadi Throw</h3>

            <div className="shell-grid">
                {shellFaces.map((face, index) => (
                    <motion.img
                        key={`${face}-${index}`}
                        src={face === "front" ? "/assets/shells/shell_front.png" : "/assets/shells/shell_back.png"}
                        alt={face === "front" ? "Shell front" : "Shell back"}
                        className={`shell-tile ${isRolling ? "is-rolling" : ""}`}
                        animate={isRolling ? { rotate: [0, -8, 8, -4, 0], y: [0, -5, 0] } : { rotate: 0, y: 0 }}
                        transition={{ duration: 0.45, delay: index * 0.04, repeat: isRolling ? Infinity : 0 }}
                    />
                ))}
            </div>

            <motion.button
                onClick={throwShell}
                className="primary-btn"
                disabled={isRolling || hasThrownThisTurn || !snapshot || snapshot.winnerId >= 0}
                whileHover={{ scale: isRolling ? 1 : 1.03 }}
                whileTap={{ scale: isRolling ? 1 : 0.97 }}
            >
                {isRolling ? "Rolling..." : hasThrownThisTurn ? "Thrown" : "Throw Kawadi"}
            </motion.button>

            <div className="kawadi-value">
                <span>roll Value</span>
                <strong>{kawadiValue ?? "-"}</strong>
            </div>

            <p className="hud-note">
                Valid tokens: {validMoves.length > 0 ? validMoves.map((v) => `T${v + 1}`).join(", ") : "None"}
            </p>

            {error && <p className="hud-note error-text">{error}</p>}

        </section>

    )

}