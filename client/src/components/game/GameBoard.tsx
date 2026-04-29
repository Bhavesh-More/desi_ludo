import { type CSSProperties, useMemo } from "react"
import { motion } from "framer-motion"
import { useGameStore } from "../../store/gameStore"
import { buildRenderTokens, getCellPercent, getColor, getTokenOffset } from "../../utils/boardLayout"

const PLAYER_COLORS: Record<string, string> = {
    red:    "#EB001B",
    blue:   "#2C7BE5",
    green:  "#10A66D",
    yellow: "#D49B00",
}

export default function GameBoard() {
    const snapshot = useGameStore((s) => s.snapshot)
    const validMoves = useGameStore((s) => s.validMoves)
    const moveSelectedToken = useGameStore((s) => s.moveSelectedToken)

    const currentPlayer = snapshot?.playerStates.find(
        (player) => player.playerId === snapshot.currentPlayerId
    )

    const { tokens, homeTokens, slotMarkers } = useMemo(() => {
        if (!snapshot) return { tokens: [], homeTokens: [], slotMarkers: [] }
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
        return (
            <div className="board-fallback">
                <p className="board-loading-text">Waiting for game session…</p>
            </div>
        )
    }

    return (
        <div className="board-card">
            {/* Section eyebrow */}
            <div className="board-card-header">
                <span className="board-eyebrow">
                    <span className="eyebrow-dot" />
                    Live Board
                </span>
            </div>

            {/* Stadium media frame */}
            <motion.div
                className="board-stadium"
                initial={{ opacity: 0, scale: 0.97, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                <img
                    src="/assets/board/board.png"
                    alt="Challas Aath game board"
                    className="board-stadium-img"
                />

                {/* Corner orbit accent marks */}
                <div className="board-corner-tl" aria-hidden="true" />
                <div className="board-corner-br" aria-hidden="true" />

                <div className="entry-mark-layer">
                    {slotMarkers.map((marker) => {
                        const start = getCellPercent(marker.start.row, marker.start.col)
                        const entry = getCellPercent(marker.entry.row, marker.entry.col)
                        const color = getColor(marker.color)

                        return (
                            <div key={`marker-${marker.ownerId}`}>
                                <div
                                    className="board-start-mark"
                                    style={{
                                        left: `${start.xPct}%`,
                                        top: `${start.yPct}%`,
                                        borderColor: color,
                                    }}
                                />
                                <div
                                    className="board-entry-mark"
                                    style={{
                                        left: `${entry.xPct}%`,
                                        top: `${entry.yPct}%`,
                                        borderColor: color,
                                    }}
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
                                                className={`token-piece ${token.isMovable ? "can-move" : ""} ${token.state === "AT_START" ? "at-start" : ""} ${token.state === "FINISHED" ? "finished" : ""}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => {
                                                    if (token.isMovable) {
                                                        void moveSelectedToken(token.tokenId)
                                                    }
                                                }}
                                                whileHover={token.isMovable ? { scale: 1.1 } : undefined}
                                                whileTap={token.isMovable ? { scale: 0.93 } : undefined}
                                                transition={{ type: "spring", stiffness: 340, damping: 24 }}
                                                title={`P${token.ownerId + 1} token ${token.tokenId + 1}`}
                                                aria-label={`Player ${token.ownerId + 1} token ${token.tokenId + 1}`}
                                            >
                                                <span className="token-num">{token.tokenId + 1}</span>
                                            </motion.button>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}

                    {Array.from(homeTokenGroups.entries()).map(([ownerId, groupedHomeTokens]) => {
                        const first = groupedHomeTokens[0]
                        if (!first) return null

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
                                                className={`token-piece at-start ${token.isMovable ? "can-move" : ""}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => {
                                                    if (token.isMovable) {
                                                        void moveSelectedToken(token.tokenId)
                                                    }
                                                }}
                                                whileHover={token.isMovable ? { scale: 1.1 } : undefined}
                                                whileTap={token.isMovable ? { scale: 0.93 } : undefined}
                                                transition={{ type: "spring", stiffness: 340, damping: 24 }}
                                                title={`P${token.ownerId + 1} token ${token.tokenId + 1} at start`}
                                                aria-label={`Player ${token.ownerId + 1} token ${token.tokenId + 1} at start`}
                                            >
                                                <span className="token-num">{token.tokenId + 1}</span>
                                            </motion.button>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            </motion.div>

            {/* Token legend */}
            <div className="board-legend">
                <div className="legend-row">
                    {currentPlayer?.tokens.map((token) => {
                        const isMovable = validMoves.includes(token.tokenId)
                        return (
                            <button
                                key={`legend-${token.tokenId}`}
                                type="button"
                                className={`legend-token ${isMovable ? "can-move" : ""}`}
                                style={{ borderColor: PLAYER_COLORS[currentPlayer?.color ?? "red"] }}
                                onClick={() => {
                                    if (isMovable) void moveSelectedToken(token.tokenId)
                                }}
                            >
                                <span
                                    className="legend-dot"
                                    style={{ backgroundColor: PLAYER_COLORS[currentPlayer?.color ?? "red"] }}
                                />
                                T{token.tokenId + 1}
                                <span className="legend-state">{token.state}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
