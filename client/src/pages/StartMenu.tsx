import { useState } from "react"
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
        <section className="menu-screen">

            <div className="menu-card">

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

                <button
                    onClick={handleStart}
                    className="primary-btn w-60"
                    disabled={isStarting}
                >
                    {isStarting ? "Preparing Board..." : "Start Game"}
                </button>

                <p className="menu-note">
                    A timeless battle of strategy and luck awaits.
                </p>

            </div>

        </section>
    )
}