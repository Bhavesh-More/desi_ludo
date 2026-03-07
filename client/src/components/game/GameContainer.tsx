import { useEffect, useRef } from "react"
import type Phaser from "phaser"
import { initGame } from "../../phaser/game"

export default function GameContainer() {

    const containerRef = useRef<HTMLDivElement>(null)
    const gameRef = useRef<Phaser.Game | null>(null)

    useEffect(() => {

        if (!containerRef.current) return

        gameRef.current = initGame(containerRef.current)

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true)
                gameRef.current = null
            }
        }

    }, [])

    return (
        <div
            ref={containerRef}
            className="game-canvas-shell"
        />
    )

}