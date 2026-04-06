import { useState } from "react"
import { motion } from "framer-motion"
import { useGameStore } from "../store/gameStore"

export default function StartMenu() {

    const startGame = useGameStore((state) => state.startGame)

    const [players, setPlayers] = useState<number>(2)
    const [isStarting, setIsStarting] = useState<boolean>(false)

    const handleStart = async () => {
        setIsStarting(true)

        try {
            await startGame(players)
        } finally {
            setIsStarting(false)
        }
    }

    return (
        <motion.section
            className="menu-screen"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >

            <motion.div
                className="menu-card"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
            >

                <p className="menu-kicker">Frontend Preview</p>

                <h1 className="menu-title">Desi Ludo</h1>

                <p className="menu-subtitle">
                    Choose your players and start the game.
                </p>

                <div className="menu-control">

                    <label className="menu-label">
                        Select Players
                    </label>

                    <div className="player-select-row">
                        {[2, 3, 4].map((count) => (
                            <button
                                key={count}
                                type="button"
                                className={`player-pill ${players === count ? "is-active" : ""}`}
                                onClick={() => setPlayers(count)}
                            >
                                {count} Players
                            </button>
                        ))}
                    </div>

                </div>

                <motion.button
                    onClick={handleStart}
                    className="primary-btn w-60"
                    disabled={isStarting}
                    whileHover={{ scale: isStarting ? 1 : 1.03 }}
                    whileTap={{ scale: isStarting ? 1 : 0.97 }}
                >
                    {isStarting ? "Preparing Board..." : "Start Game"}
                </motion.button>

                <p className="menu-note">
                    A timeless battle of strategy and luck awaits.
                </p>

            </motion.div>

        </motion.section>
    )
}