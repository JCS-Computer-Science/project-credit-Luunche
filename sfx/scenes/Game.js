//This game is meant to be an improved version of the bunny jump game from the phaser tutorial
import Phaser from '../lib/phaser.js'

import Carrot from '../game/Carrot.js'

import Enemy from '../game/enemy.js'

var music

export default class Game extends Phaser.Scene {
    carrotsCollected = 0
    /** @type {Phaser.Physics.Arcade.Sprite} */
    player

    /** @type {Phaser.Physics.Arcade.StaticGroup} */
    platforms

    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    cursors

    /** @type {Phaser.Physics.Arcade.Group} */
    carrots

    /** @type {Phaser.GameObjects.Text} */
    carrotsCollectedText

    /** @type {Phaser.Physics.Arcade.Sprite} */
    enemy

    /** @type {Phaser.Physics.Arcade.Group} */
    enemies

    constructor() {
        super('game')
    }
    init() {
        this.carrotsCollected = 0
        music
    }

    preload() {
        this.load.image('background', 'assets/bg_layer1.png')
        this.load.image('platform', 'assets/ground_grass.png')
        this.load.image('bunny-stand', 'assets/bunny1_stand.png')
        this.load.image('carrot', 'assets/carrot.png')
        this.load.image('bunny-jump', 'assets/bunny1_jump.png')
        this.load.image('spikeman-stand', 'assets/spikeMan_stand.png')
        this.load.image('spikeman-jump', 'assets/spikeMan_jump.png')
        this.load.image('spikeman-fall', 'assets/spikeMan_fall.png')

        this.load.audio('jump', 'assets/sfx/highUp.ogg')
        this.load.audio('fall', 'assets/sfx/falling.mp3')
        this.load.audio('song', 'assets/sfx/Paintsong.mp3')


        this.cursors = this.input.keyboard.createCursorKeys()
    }

    create() {

        music = this.sound.add('song', {
            volume: 0.05
        })
        music.loop = true
        music.play()

        this.add.image(240, 320, 'background')
            .setScrollFactor(1, 0)

        this.platforms = this.physics.add.staticGroup()

        for (let i = 0; i < 5; ++i) {
            const x = Phaser.Math.Between(80, 400)
            const y = 150 * i

            /** @type {Phaser.Physics.Arcade.Sprite} */
            const platform = this.platforms.create(x, y, 'platform')
            platform.scale = 0.5

            /** @type {Phaser.Physics.Arcade.StaticBody} */
            const body = platform.body
            body.updateFromGameObject()

        }

        this.player = this.physics.add.sprite(240, 320, 'bunny-stand')
            .setScale(0.5)

        this.enemy = this.physics.add.sprite(Phaser.Math.Between(80, 400), 0, 'spikeman-stand')
            .setScale(0.5)


        this.carrots = this.physics.add.group({
            classType: Carrot
        })
        this.enemies = this.physics.add.group({
            classType: Enemy
        })


        this.physics.add.collider(this.platforms, this.player)
        this.physics.add.collider(this.platforms, this.carrots)
        this.physics.add.collider(this.platforms, this.enemy)

        this.physics.add.overlap(
            this.player,
            this.carrots,
            this.handleCollectCarrot,
            undefined,
            this
        )

        this.physics.add.overlap(
            this.player,
            this.enemies,
            this.handleDie,
            undefined,
            this
        )

        this.physics.add.overlap(
            this.player,
            this.enemy,
            this.handleDie,
            undefined,
            this
        )

        this.player.body.checkCollision.up = false
        this.player.body.checkCollision.left = false
        this.player.body.checkCollision.right = false

        this.enemy.body.checkCollision.up = false
        this.enemy.body.checkCollision.left = false
        this.enemy.body.checkCollision.right = false

        this.cameras.main.startFollow(this.player)
        this.cameras.main.setDeadzone(this.scale.sidth * 1.5)

        const style = {
            color: '#000',
            fontSize: 24
        }
        this.carrotsCollectedText = this.add.text(240, 10, 'Carrots: 0', style)
            .setScrollFactor(0)
            .setOrigin(0.5, 0)


    }

    update() {
        const touchingDown = this.player.body.touching.down
        const enemyTouchingDown = this.enemy.body.touching.down

        if (touchingDown) {
            this.player.setVelocityY(-300)

            this.player.setTexture('bunny-jump')
            this.sound.play('jump', {
                volume: 0.5
            })
        }

        if (enemyTouchingDown) {
            this.enemy.setVelocityY(-150)

            this.enemy.setTexture('spikeman-jump')
        }

        const vy = this.player.body.velocity.y
        if (vy > 0 && this.player.texture.key !== 'bunny-stand') {
            this.player.setTexture('bunny-stand')
        }

        this.platforms.children.iterate(child => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const platform = child

            const scrollY = this.cameras.main.scrollY
            if (platform.y >= scrollY + 700) {
                platform.y = scrollY - Phaser.Math.Between(50, 100)
                platform.body.updateFromGameObject()

                this.addCarrotAbove(platform)
                this.addEnemyAbove(platform)
            }
        })

        if (this.enemy.y >= scrollY + 7000) {
            this.enemy.y = scrollY - Phaser.Math.Between(50, 100)
            this.enemy.setVelocityX(0)
            this.enemy.body.updateFromGameObject()
        }


        if (this.cursors.left.isDown && !touchingDown) {
            this.player.setVelocityX(-200)
        } else if (this.cursors.right.isDown && !touchingDown) {
            this.player.setVelocityX(200)
        } else {
            this.player.setVelocityX(0)
        }

        this.horizontalWrap(this.player)

        const bottomPlatform = this.findBottomMostPlatform()
        if (this.player.y > bottomPlatform.y + 200) {
            this.scene.start('game-over')
            music.stop()
        }
    }
    /**
     * 
     * @param {Phaser.GameObjects.Sprite} sprite 
     */
    horizontalWrap(sprite) {
        const halfWidth = sprite.displayWidth * 0.5
        const gameWidth = this.scale.width
        if (sprite.x < -halfWidth) {
            sprite.x = gameWidth + halfWidth
        } else if (sprite.x > gameWidth + halfWidth) {
            sprite.x = -halfWidth
        }

    }
    /**
     * @param {Phaser.GameObjects.Sprite} sprite
     */
    addCarrotAbove(sprite) {
        const y = sprite.y - sprite.displayHeight
        /** @type {Phaser.Physics.Arcade.Sprite} */
        const carrot = this.carrots.get(sprite.x, y, 'carrot')

        carrot.setActive(true)
        carrot.setVisible(true)

        this.add.existing(carrot)

        carrot.body.setSize(carrot.width, carrot.height)

        this.physics.world.enable(carrot)

        this.sound.play('fall', {
            volume: 0.1
        })

        return carrot
    }
    /**
     * @param {Phaser.GameObjects.Sprite} sprite
     */
    addEnemyAbove(sprite) {
        const y = sprite.y - sprite.displayHeight
        /** @type {Phaser.Physics.Arcade.Sprite} */
        const enemy = this.enemies.get(sprite.x, y, 'spikeman-fall')

        enemy.setActive(true)
        enemy.setVisible(true)

        this.add.existing(enemy)

        enemy.body.setSize(enemy.width, enemy.height)

        this.physics.world.enable(enemy)

        return enemy
    }

    /**
     * @param {Phaser.Physics.Arcade.Sprite} player
     * @param {Carrot} carrot
     */
    handleCollectCarrot(player, carrot) {
        this.carrots.killAndHide(carrot)

        this.physics.world.disableBody(carrot.body)

        this.carrotsCollected++

        const value = `Carrots: ${this.carrotsCollected}`
        this.carrotsCollectedText.text = value
    }
    /**
     * @param {Phaser.Physics.Arcade.Sprite} player
     * @param {Enemy} enemy
     */
    handleDie(player, enemy) {
        this.scene.start('game-over')
        music.stop()
    }

    findBottomMostPlatform() {
        const platforms = this.platforms.getChildren()
        let bottomPlatform = platforms[0]

        for (let i = 1; i < platforms.length; ++i) {
            const platform = platforms[i]
            if (platform.y < bottomPlatform.y) {
                continue
            }
            bottomPlatform = platform
        }
        return bottomPlatform
    }
}