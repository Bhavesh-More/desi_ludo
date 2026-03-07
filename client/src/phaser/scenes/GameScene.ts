import Phaser from "phaser"
import { boardBoxCenters } from "../../utils/boardPath"

export default class GameScene extends Phaser.Scene {

    constructor() {
        super("GameScene")
    }

    create() {

        const centerX = this.cameras.main.width / 2
        const centerY = this.cameras.main.height / 2

        this.add.image(centerX, centerY, "board").setScale(0.7)

        this.add.text(28, 28, "Frontend Board Preview", {
            fontFamily: "Georgia",
            fontSize: "24px",
            color: "#f6d88a"
        })

        this.add.text(28, 56, "Game rules and moves will come from backend", {
            fontFamily: "Verdana",
            fontSize: "14px",
            color: "#cbd5e1"
        })

        boardBoxCenters.forEach((cell) => {
            const base = this.add.circle(cell.x, cell.y, 5, 0x0f172a, 0.55)
            base.setStrokeStyle(1, 0xe2e8f0, 0.45)

        })

        // const markers = [
        //     { x: 122, y: 122, texture: "redPiece" },
        //     { x: 578, y: 122, texture: "bluePiece" },
        //     { x: 122, y: 578, texture: "greenPiece" },
        //     { x: 578, y: 578, texture: "yellowPiece" }
        // ]

        // markers.forEach((marker) => {
        //     const pin = this.add.image(marker.x, marker.y, marker.texture).setScale(0.22)

        //     this.tweens.add({
        //         targets: pin,
        //         y: marker.y - 5,
        //         duration: 1100,
        //         yoyo: true,
        //         repeat: -1,
        //         ease: "Sine.easeInOut"
        //     })
        // })

        this.cameras.main.fadeIn(350, 8, 12, 20)

    }

}