import PieceManager, { type Piece } from "./PieceManager"

interface Player {
    color: string
    pieces: Piece[]
}

export default class PlayerManager {

    private pieceManager: PieceManager
    private players: Player[] = []
    private currentPlayerIndex = 0

    constructor(pieceManager: PieceManager) {
        this.pieceManager = pieceManager
    }

    createPlayers(count: number) {

        const colors = ["red", "blue", "green", "yellow"]

        for (let i = 0; i < count; i++) {

            const color = colors[i]

            const pieces: Piece[] = []

            for (let j = 0; j < 4; j++) {

                const piece = this.pieceManager.spawnPiece(
                    color,
                    `${color}Piece`,
                    0
                )

                pieces.push(piece)

            }

            this.players.push({
                color,
                pieces
            })

        }

    }

    getCurrentPlayer() {

        return this.players[this.currentPlayerIndex]

    }

    nextTurn() {

        this.currentPlayerIndex++

        if (this.currentPlayerIndex >= this.players.length) {
            this.currentPlayerIndex = 0
        }

    }

}