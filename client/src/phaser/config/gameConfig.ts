import Phaser from "phaser"
import BootScene from "../scenes/BootScene"
import GameScene from "../scenes/GameScene"

export const gameConfig: Phaser.Types.Core.GameConfig = {

    type: Phaser.AUTO,

    width: 700,
    height: 700,

    backgroundColor: "#1e293b",

    scene: [BootScene, GameScene],

    physics: {
        default: "arcade"
    }

}