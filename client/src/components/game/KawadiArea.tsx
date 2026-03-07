import { useGameStore } from "../../store/gameStore"

export default function KawadiArea() {

    const throwKawadiPreview = useGameStore((s) => s.throwKawadiPreview)
    const kawadiValue = useGameStore((s) => s.kawadiValue)
    const shellFaces = useGameStore((s) => s.shellFaces)
    const isRolling = useGameStore((s) => s.isRolling)

    const throwShell = async () => {

        await throwKawadiPreview()

    }

    return (

        <section className="kawadi-card">

            <h3 className="section-title">Kawadi Throw</h3>

            <div className="shell-grid">
                {shellFaces.map((face, index) => (
                    <img
                        key={`${face}-${index}`}
                        src={face === "front" ? "/assets/shells/shell_front.png" : "/assets/shells/shell_back.png"}
                        alt={face === "front" ? "Shell front" : "Shell back"}
                        className={`shell-tile ${isRolling ? "is-rolling" : ""}`}
                    />
                ))}
            </div>

            <button
                onClick={throwShell}
                className="primary-btn"
                disabled={isRolling}
            >
                {isRolling ? "Rolling..." : "Throw Kawadi"}
            </button>

            <div className="kawadi-value">
                <span>Move Value</span>
                <strong>{kawadiValue ?? "-"}</strong>
            </div>

        </section>

    )

}