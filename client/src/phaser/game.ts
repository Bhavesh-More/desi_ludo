import Phaser from "phaser"
import { gameConfig } from "./config/gameConfig"

let game: Phaser.Game | null = null

export const initGame = (parent: HTMLDivElement) => {

    if (game) {
        game.destroy(true)
        game = null
    }

    game = new Phaser.Game({
        ...gameConfig,
        parent
    })

    return game
}