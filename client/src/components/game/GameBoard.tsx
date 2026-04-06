import { type CSSProperties, useMemo } from "react"
import { motion } from "framer-motion"
import { useGameStore } from "../../store/gameStore"
import { buildRenderTokens, getCellPercent, getColor, getTokenOffset } from "../../utils/boardLayout"

export default function GameBoard() {
    const snapshot = useGameStore((s) => s.snapshot)
    const validMoves = useGameStore((s) => s.validMoves)
    const moveSelectedToken = useGameStore((s) => s.moveSelectedToken)

    const currentPlayer = snapshot?.playerStates.find((player) => player.playerId === snapshot.currentPlayerId)

    const { tokens, homeTokens, slotMarkers } = useMemo(() => {
        if (!snapshot) {
            return { tokens: [], homeTokens: [], slotMarkers: [] }
        }

        return buildRenderTokens(snapshot, validMoves)
    }, [snapshot, validMoves])

    const tokenGroups = useMemo(() => {
        const grouped = new Map<string, typeof tokens>()

        tokens.forEach((token) => {
            const key = `${token.row}-${token.col}`
            const list = grouped.get(key) ?? []
            list.push(token)
            grouped.set(key, list)
        })

        return grouped
    }, [tokens])

    const homeTokenGroups = useMemo(() => {
        const grouped = new Map<number, typeof homeTokens>()

        homeTokens.forEach((token) => {
            const list = grouped.get(token.ownerId) ?? []
            list.push(token)
            grouped.set(token.ownerId, list)
        })

        return grouped
    }, [homeTokens])

    if (!snapshot) {
        return <div className="board-fallback">Waiting for game session...</div>
    }

    return (
        <section className="board-grid-card">
            <h3 className="section-title">Live Board State</h3>

            <motion.div
                className="board-stage"
                initial={{ opacity: 0, scale: 0.975, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.38, ease: "easeOut" }}
            >
                <img src="/assets/board/board.png" alt="Challas Aath board" className="board-image" />

                <div className="entry-mark-layer">
                    {slotMarkers.map((marker) => {
                        const start = getCellPercent(marker.start.row, marker.start.col)
                        const entry = getCellPercent(marker.entry.row, marker.entry.col)
                        const color = getColor(marker.color)

                        return (
                            <div key={`marker-${marker.ownerId}`}>
                                <div
                                    className="board-start-mark"
                                    style={{ left: `${start.xPct}%`, top: `${start.yPct}%`, borderColor: color }}
                                />
                                <div
                                    className="board-entry-mark"
                                    style={{ left: `${entry.xPct}%`, top: `${entry.yPct}%`, borderColor: color }}
                                />
                            </div>
                        )
                    })}

                    {(() => {
                        const center = getCellPercent(2, 2)
                        return (
                            <div
                                className="board-center-mark"
                                style={{ left: `${center.xPct}%`, top: `${center.yPct}%` }}
                            />
                        )
                    })()}
                </div>

                <div className="token-layer">
                    {Array.from(tokenGroups.entries()).map(([cellKey, groupedTokens]) => {
                        const [row, col] = cellKey.split("-").map(Number)
                        const point = getCellPercent(row, col)

                        return (
                            <div
                                key={`cell-${cellKey}`}
                                className="token-pile"
                                style={{ left: `${point.xPct}%`, top: `${point.yPct}%` }}
                            >
                                {groupedTokens.map((token, index) => {
                                    const offset = getTokenOffset(index, groupedTokens.length)
                                    const color = getColor(token.color)

                                    return (
                                        <div
                                            key={`${token.ownerId}-${token.tokenId}`}
                                            className="token-offset"
                                            style={{ "--ox": offset.x, "--oy": offset.y } as CSSProperties}
                                        >
                                            <motion.button
                                                layout
                                                initial={{ opacity: 0, scale: 0.72 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                type="button"
                                                className={`token-dot ${token.isMovable ? "can-move" : ""} ${token.state === "AT_START" ? "is-start" : ""} ${token.state === "FINISHED" ? "is-finished" : ""}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => {
                                                    if (token.isMovable) {
                                                        void moveSelectedToken(token.tokenId)
                                                    }
                                                }}
                                                whileHover={token.isMovable ? { scale: 1.08 } : undefined}
                                                whileTap={token.isMovable ? { scale: 0.95 } : undefined}
                                                transition={{ type: "spring", stiffness: 340, damping: 24 }}
                                                title={`P${token.ownerId + 1} T${token.tokenId + 1}`}
                                            >
                                                {token.tokenId + 1}
                                            </motion.button>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}

                    {Array.from(homeTokenGroups.entries()).map(([ownerId, groupedHomeTokens]) => {
                        const first = groupedHomeTokens[0]
                        if (!first) {
                            return null
                        }

                        return (
                            <div
                                key={`home-owner-${ownerId}`}
                                className="token-pile token-pile-home"
                                style={{ left: `${first.xPct}%`, top: `${first.yPct}%` }}
                            >
                                {groupedHomeTokens.map((token, index) => {
                                    const offset = getTokenOffset(index, groupedHomeTokens.length)
                                    const color = getColor(token.color)

                                    return (
                                        <div
                                            key={`home-${token.ownerId}-${token.tokenId}`}
                                            className="token-offset"
                                            style={{ "--ox": offset.x, "--oy": offset.y } as CSSProperties}
                                        >
                                            <motion.button
                                                layout
                                                initial={{ opacity: 0, scale: 0.72 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                type="button"
                                                className={`token-dot is-start ${token.isMovable ? "can-move" : ""}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => {
                                                    if (token.isMovable) {
                                                        void moveSelectedToken(token.tokenId)
                                                    }
                                                }}
                                                whileHover={token.isMovable ? { scale: 1.08 } : undefined}
                                                whileTap={token.isMovable ? { scale: 0.95 } : undefined}
                                                transition={{ type: "spring", stiffness: 340, damping: 24 }}
                                                title={`P${token.ownerId + 1} T${token.tokenId + 1}`}
                                            >
                                                {token.tokenId + 1}
                                            </motion.button>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            </motion.div>

            <div className="home-zone">
                <h4>Current Player Tokens</h4>
                <div className="home-token-list">
                    {currentPlayer?.tokens.map((token) => {
                        const isMovable = validMoves.includes(token.tokenId)
                        return (
                            <button
                                key={`home-${token.tokenId}`}
                                type="button"
                                className={`home-token ${isMovable ? "can-move" : ""}`}
                                onClick={() => {
                                    if (isMovable) {
                                        void moveSelectedToken(token.tokenId)
                                    }
                                }}
                            >
                                T{token.tokenId + 1}: {token.state} ({token.pathIndex})
                            </button>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
