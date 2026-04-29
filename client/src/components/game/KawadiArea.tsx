import { useGameStore } from "../../store/gameStore"
import { motion } from "framer-motion"

function ShellIcon({ face }: { face: "front" | "back" }) {
    return (
        <motion.img
            src={face === "front" ? "/assets/shells/shell_front.png" : "/assets/shells/shell_back.png"}
            alt={face === "front" ? "Shell face up" : "Shell face down"}
            className="shell-icon"
            animate={
                face === "front"
                    ? { rotate: [0, -10, 10, -5, 0], y: [0, -6, 0] }
                    : { rotate: [0, 8, -8, 4, 0], y: [0, -4, 0] }
            }
            transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 0.8 }}
        />
    )
}

export default function KawadiArea() {
    const throwKawadiPreview = useGameStore((s) => s.throwKawadiPreview)
    const kawadiValue = useGameStore((s) => s.kawadiValue)
    const shellFaces = useGameStore((s) => s.shellFaces)
    const isRolling = useGameStore((s) => s.isRolling)
    const hasThrownThisTurn = useGameStore((s) => s.hasThrownThisTurn)
    const validMoves = useGameStore((s) => s.validMoves)
    const snapshot = useGameStore((s) => s.snapshot)
    const error = useGameStore((s) => s.error)


    const players = useGameStore((s) => s.players)

const finishedPlayers =
    snapshot?.playerStates.filter(p => p.finishedCount === 4) ?? []

const isGameEnded = finishedPlayers.length >= players - 1 

    const isDisabled = isRolling || hasThrownThisTurn || !snapshot || isGameEnded

    return (
        <section className="kawadi-card">
            {/* Card header */}
            <div className="kawadi-header">
                <span className="board-eyebrow">
                    <span className="eyebrow-dot" />
                    Dice Roll
                </span>
            </div>

            {/* Shell orbit display */}
            <div className="shell-orbit">
                <div className="shell-display">
                    {shellFaces.map((face, index) => (
                        <ShellIcon key={`${face}-${index}`} face={face} />
                    ))}
                </div>
            </div>

            {/* Roll value */}
            <div className="kawadi-roll-display">
                <span className="kawadi-roll-label">Roll</span>
                <motion.span
                    className="kawadi-roll-value"
                    key={kawadiValue}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                >
                    {kawadiValue ?? "—"}
                </motion.span>
            </div>

            {/* Throw button — ink pill */}
            <motion.button
                onClick={() => void throwKawadiPreview()}
                className="kawadi-throw-btn"
                disabled={isDisabled}
                whileHover={isDisabled ? {} : { scale: 1.03 }}
                whileTap={isDisabled ? {} : { scale: 0.97 }}
            >
                {isRolling ? (
                    <>
                        <span className="btn-spinner" />
                        Rolling…
                    </>
                ) : hasThrownThisTurn ? (
                    "Thrown"
                ) : (
                    "Throw Kawadi"
                )}
            </motion.button>

            {/* Valid moves — pill chips */}
            <div className="kawadi-moves">
                <span className="kawadi-moves-label">Valid tokens</span>
                <div className="moves-chip-row">
                    {validMoves.length > 0 ? (
                        validMoves.map((v) => (
                            <span key={v} className="move-chip">
                                T{v + 1}
                            </span>
                        ))
                    ) : (
                        <span className="no-moves-chip">None</span>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <motion.p
                    className="kawadi-error"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {error}
                </motion.p>
            )}
        </section>
    )
}
