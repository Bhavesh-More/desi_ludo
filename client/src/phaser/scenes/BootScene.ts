import Phaser from "phaser"

export default class BootScene extends Phaser.Scene {

    constructor() {
        super("BootScene")
    }

    preload() {

        this.load.image(
            "board",
            "/assets/board/board.png"
        )

        this.load.image(
            "redPiece",
            "/assets/pieces/red.png"
        )

        this.load.image(
            "bluePiece",
            "/assets/pieces/blue.png"
        )

        this.load.image(
            "greenPiece",
            "/assets/pieces/green.png"
        )

        this.load.image(
            "yellowPiece",
            "/assets/pieces/yellow.png"
        )

    }

    create() {

        this.scene.start("GameScene")

    }

}