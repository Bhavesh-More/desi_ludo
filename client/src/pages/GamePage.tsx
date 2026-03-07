import { useGameStore } from "../store/gameStore"
import GameContainer from "../components/game/GameContainer"
import KawadiArea from "../components/game/KawadiArea"
import PlayerIndicator from "../components/ui/PlayerIndicator"

export default function GamePage() {

    const players = useGameStore((state) => state.players)
    const turnCount = useGameStore((state) => state.turnCount)
    const resetGame = useGameStore((state) => state.resetGame)

    return (
        <section className="game-screen">

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
                <div className="board-panel">
                    <GameContainer />
                </div>

                <aside className="hud-panel">
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
                </aside>
            </div>

        </section>

    )
}