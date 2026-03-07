import { useGameStore } from "../../store/gameStore"

export default function PlayerIndicator() {

    const playerOrder = useGameStore((s) => s.playerOrder)
    const activePlayerIndex = useGameStore((s) => s.activePlayerIndex)
    const getCurrentPlayer = useGameStore((s) => s.getCurrentPlayer)

    const currentPlayer = getCurrentPlayer()

    const colors = {
        red: "#d94848",
        blue: "#2c7be5",
        green: "#10a66d",
        yellow: "#d49b00"
    }

    return (

        <section className="player-card">

            <h3 className="section-title">Turn Indicator</h3>

            <p className="current-player-copy">
                Active player:
                <span
                    className="player-name"
                    style={{ color: colors[currentPlayer] }}
                >
                    {currentPlayer}
                </span>
            </p>

            <div className="player-list">
                {playerOrder.map((player, index) => (
                    <div
                        key={player}
                        className={`player-chip ${index === activePlayerIndex ? "is-active" : ""}`}
                        style={{ borderColor: colors[player] }}
                    >
                        {player}
                    </div>
                ))}
            </div>

        </section>

    )

}