import Phaser from "phaser"
import { boardPath } from "../../utils/boardPath"

export interface Piece {
    id: string
    player: string
    position: number
    sprite: Phaser.GameObjects.Image
}

export default class PieceManager {

    private scene: Phaser.Scene
    private pieces: Piece[] = []

    constructor(scene: Phaser.Scene) {
        this.scene = scene
    }

    spawnPiece(player: string, texture: string, startIndex: number) {

        const cell = boardPath[startIndex]

        const sprite = this.scene.add.image(
            cell.x,
            cell.y,
            texture
        )
            .setScale(0.24)
            .setInteractive()

        const piece: Piece = {
            id: `${player}-${Date.now()}-${Math.random()}`,
            player,
            position: startIndex,
            sprite
        }

        this.pieces.push(piece)

        return piece
    }

    highlightPieces(pieces: Piece[]) {

        pieces.forEach(p => {
            p.sprite.setTint(0xffff00)
        })

    }

    clearHighlights() {

        this.pieces.forEach(p => {
            p.sprite.clearTint()
        })

    }

    movePiece(piece: Piece, steps: number) {

        const newIndex = piece.position + steps

        if (newIndex >= boardPath.length) return

        piece.position = newIndex

        const target = boardPath[newIndex]

        this.scene.tweens.add({
            targets: piece.sprite,
            x: target.x,
            y: target.y,
            duration: 300
        })

    }

}