import Phaser from '../lib/phaser.js'

export default class GameOver extends Phaser.Scene {

    constructor() {
        super('game-over')
    }

    preload() {
        this.load.image('bunny-hurt', 'assets/bunny1_hurt.png')
        this.load.image('background2', 'assets/bg_layer2.png')

        this.load.audio('death', 'assets/sfx/deathSound.mp3')
    }

    create() {
        this.add.image(240, 320, 'background2')
        this.add.image(240, 600, 'bunny-hurt')

        this.sound.play('death', {
            volume: 0.3
        })

        const width = this.scale.width
        const height = this.scale.height

        this.add.text(width * 0.5, height * 0.4, 'Game Over', {
                fontSize: 48,
                color: '#000'
            })
            .setOrigin(0.5)
        this.add.text(width * 0.5, height * 0.60, 'Press the Space Bar to Restart', {
                fontSize: 24,
                color: '#000'
            })
            .setOrigin(0.5)


        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('game')
        })
    }
}