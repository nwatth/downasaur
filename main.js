class Game {
  constructor(player, width, height) {
    this.running = false
    this.player = player
    this.width = width
    this.height = height

    this.speed = 3
    this.gravitySpeed = 1
    this.score = 0
    this.highScore = 0

    this.obstacles = []
    this.initialSpawnTimer = 200
    this.spawnCountdown = this.initialSpawnTimer
    this.minimumSpawnCountdown = 60
    this.spawnSpeed = 8

    this.jumpForce = 15
    this.jumpTimer = 0
  }

  setController(controller) {
    this.controller = controller
  }

  start(context) {
    context.canvas.width = this.width
    context.canvas.height = this.height
    this.update(context)
  }

  reset() {
    this.speed = 3
    this.score = 0
    this.obstacles = []
    this.spawnCountdown = this.initialSpawnTimer
  }

  update(context) {
    requestAnimationFrame(() => { this.update(context) })

    if (this.running) {
      context.clearRect(0, 0, this.width, this.height)

      if (this.controller.isJump()) {
        if (this.player.isGrounded(this.height) && this.jumpTimer == 0) {
          this.jumpTimer = 1;
          this.player.dy = -this.jumpForce;
        } else if (this.jumpTimer > 0 && this.jumpTimer < 15) {
          this.jumpTimer++;
          this.player.dy = -this.jumpForce - (this.jumpTimer / 50);
        }
      } else {
        this.jumpTimer = 0
      }

      if (this.controller.isSquat()) {
        this.player.squat()
      } else {
        this.player.stand()
      }

      this.spawnCountdown--

      if (this.spawnCountdown <= 0) {
        this.spawnObstacle()
        this.spawnCountdown = this.initialSpawnTimer - this.speed * this.spawnSpeed

        if (this.spawnCountdown < this.minimumSpawnCountdown) {
          this.spawnCountdown = this.minimumSpawnCountdown
        }
      }

      for (let i = 0; i < this.obstacles.length; i++) {
        let obstacle = this.obstacles[i]

        if (this.player.isTouchObstacle(obstacle)) {
          this.running = false
        }

        obstacle.move(this.speed)
        obstacle.draw(context)
      }

      this.dropPlayerByGravity()
      this.player.draw(context)

      this.speed += 0.003
    } else if (this.controller.isStart()) {
      this.running = true
      this.reset()
    }
  }

  dropPlayerByGravity() {
    this.player.y += this.player.dy

    if (this.player.isGrounded(this.height)) {
      this.player.stayOnGround(this.height)
    } else {
      this.player.dropByGravity(this.gravitySpeed)
    }
  }

  spawnObstacle() {
    let size = this.randomIntInRange(20, 70)
    let type = this.randomIntInRange(0, 1)
    let obstacle = new Obstacle(this.width - size, this.height - size, size, size)

    if (type == 1) {
      obstacle.y -= this.player.originalHeight - 10
    }

    this.obstacles.push(obstacle)
  }

  randomIntInRange(min, max) {
    return Math.round(Math.random() * (max - min) + min)
  }
}

class Player {
  constructor(x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height

    this.originalHeight = height
    this.dy = 0
  }

  isGrounded(groundBoundary) {
    if (this.y + this.height >= groundBoundary) {
      return true
    } else {
      return false
    }
  }

  squat() {
    this.height = this.originalHeight / 2
  }

  stand() {
    this.height = this.originalHeight
  }

  dropByGravity(gravitySpeed) {
    this.dy += gravitySpeed
  }

  stayOnGround(groundBoundary) {
    this.dy = 0
    this.y = groundBoundary - this.height
  }

  isTouchObstacle(obstacle) {
    if (
      this.x               < obstacle.x + obstacle.width &&
      this.x + this.width  > obstacle.x &&
      this.y               < obstacle.y + obstacle.height &&
      this.y + this.height > obstacle.y
    ) {
      return true
    } else {
      return false
    }
  }

  draw(context) {
    context.beginPath()
    context.fillStyle = 'red'
    context.fillRect(this.x, this.y, this.width, this.height)
    context.closePath()
  }
}

class Obstacle {
  constructor(x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height

    this.dx = 0
  }

  move(speed) {
    this.x += this.dx
    this.dx = -speed
  }

  draw(context) {
    context.beginPath();
    context.fillStyle = 'blue';
    context.fillRect(this.x, this.y, this.width, this.height);
    context.closePath()
  }
}

class Controller {
  constructor() {
    this.keys = {}

    this.listenEvents()
  }

  listenEvents() {
    const that = this
    document.addEventListener('keydown', function (evt) {
      that.keys[evt.code] = true
    })

    document.addEventListener('keyup', function (evt) {
      that.keys[evt.code] = false
    })
  }

  isStart() {
    if (this.keys['Enter']) {
      return true
    } else {
      return false
    }
  }

  isJump() {
    if (this.keys['ArrowUp']) {
      return true
    } else {
      return false
    }
  }

  isSquat() {
    if (this.keys['ArrowDown'] ) {
      return true
    } else {
      return false
    }
  }
}

const canvas = document.getElementById('game')
const context = canvas.getContext('2d')

let player
let game
let controller

controller = new Controller()
player = new Player(25, 0, 50, 50)
game = new Game(player, window.innerWidth, window.innerHeight)
game.setController(controller)
game.start(context)
