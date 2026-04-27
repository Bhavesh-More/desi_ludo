import type { GameSnapshot, PlayerColor } from "../types/gameTypes"

type Slot = "north" | "east" | "south" | "west"

interface CellPoint {
    row: number
    col: number
}

const slotByPlayerCount: Record<number, Slot[]> = {
    2: ["north", "south"],
    3: ["north", "east", "west"],
    4: ["north", "east", "south", "west"]
}

const slotStartCell: Record<Slot, CellPoint> = {
    north: { row: 0, col: 2 },
    east:  { row: 2, col: 4 },
    south: { row: 4, col: 2 },
    west:  { row: 2, col: 0 }
}

const slotEntryCell: Record<Slot, CellPoint> = {
    north: { row: 0, col: 3 },
    east:  { row: 3, col: 4 },
    south: { row: 4, col: 1 },
    west:  { row: 1, col: 0 }
}

const colorMap: Record<PlayerColor, string> = {
    red: "#f04f4f",
    blue: "#2f75ff",
    green: "#17b977",
    yellow: "#f5b52e"
}

export interface TokenBubble {
    tokenId: number
    ownerId: number
    color: PlayerColor
    row: number
    col: number
    isMovable: boolean
    state: "AT_START" | "ACTIVE" | "FINISHED"
}

export interface HomeTokenBubble {
    tokenId: number
    ownerId: number
    color: PlayerColor
    xPct: number
    yPct: number
    isMovable: boolean
}

const slotHomeAnchor: Record<Slot, { xPct: number; yPct: number }> = {
    north: { xPct: 50, yPct: 21.5 },
    east: { xPct: 80, yPct: 50 },
    south: { xPct: 50, yPct: 79 },
    west: { xPct: 20.5, yPct: 50 }
}

export interface SlotMarker {
    ownerId: number
    color: PlayerColor
    slot: Slot
    start: CellPoint
    entry: CellPoint
}

export const boardInset = {
    leftPct: 12.5,
    topPct: 14.5,
    widthPct: 75,
    heightPct: 75
}

export function getColor(playerColor: PlayerColor): string {
    return colorMap[playerColor]
}

export function getCellPercent(row: number, col: number): { xPct: number; yPct: number } {
    const xPct = boardInset.leftPct + ((col + 0.5) / 5) * boardInset.widthPct
    const yPct = boardInset.topPct + ((row + 0.5) / 5) * boardInset.heightPct

    return { xPct, yPct }
}

export function getSlotMarkers(snapshot: GameSnapshot): SlotMarker[] {
    const players = snapshot.playerStates
    const slots = slotByPlayerCount[players.length] ?? slotByPlayerCount[4]

    return players.map((player, index) => {
        const slot = slots[index]
        return {
            ownerId: player.playerId,
            color: player.color,
            slot,
            start: slotStartCell[slot],
            entry: slotEntryCell[slot]
        }
    })
}

export function buildRenderTokens(
    snapshot: GameSnapshot,
    validMoves: number[]
): { tokens: TokenBubble[]; homeTokens: HomeTokenBubble[]; slotMarkers: SlotMarker[] } {
    const slotMarkers = getSlotMarkers(snapshot)
    const markerByOwner = new Map<number, SlotMarker>()
    slotMarkers.forEach((marker) => markerByOwner.set(marker.ownerId, marker))

    const currentPlayerId = snapshot.currentPlayerId
    const isMovable = (ownerId: number, tokenId: number) => ownerId === currentPlayerId && validMoves.includes(tokenId)

    const boardTokens: TokenBubble[] = []
    snapshot.boardState.forEach((cell) => {
        cell.occupants.forEach((token) => {
            const owner = snapshot.playerStates.find((player) => player.playerId === token.ownerId)
            if (!owner) {
                return
            }

            boardTokens.push({
                ownerId: token.ownerId,
                tokenId: token.tokenId,
                color: owner.color,
                row: cell.row,
                col: cell.col,
                state: "ACTIVE",
                isMovable: isMovable(token.ownerId, token.tokenId)
            })
        })
    })

    const homeTokens: HomeTokenBubble[] = []
    const finishedTokens: TokenBubble[] = []
    snapshot.playerStates.forEach((player) => {
        const marker = markerByOwner.get(player.playerId)
        if (!marker) {
            return
        }

        player.tokens.forEach((token) => {
            if (token.state !== "AT_START") {
                if (token.state === "FINISHED") {
                    finishedTokens.push({
                        ownerId: player.playerId,
                        tokenId: token.tokenId,
                        color: player.color,
                        row: 2,
                        col: 2,
                        state: "FINISHED",
                        isMovable: false
                    })
                }

                return
            }

            const anchor = slotHomeAnchor[marker.slot]

            homeTokens.push({
                ownerId: player.playerId,
                tokenId: token.tokenId,
                color: player.color,
                xPct: anchor.xPct,
                yPct: anchor.yPct,
                isMovable: isMovable(player.playerId, token.tokenId)
            })
        })
    })

    return {
        tokens: [...boardTokens, ...finishedTokens],
        homeTokens,
        slotMarkers
    }
}

export function getTokenOffset(index: number, total: number): { x: string; y: string } {
    if (total <= 1) {
        return { x: "0px", y: "0px" }
    }

    const radiusPx = total > 4 ? 13 : 11
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2

    return {
        x: `${Math.round(Math.cos(angle) * radiusPx)}px`,
        y: `${Math.round(Math.sin(angle) * radiusPx)}px`
    }
}
