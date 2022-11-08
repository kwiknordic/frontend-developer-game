const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

// animationFrames
let timer;
let shuffled;
let animationId;
const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

const cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

// TODO: observe windowReframe and update new height/width
let height;
let width;

if (window.innerWidth > 768) {
  width = 750
  height = 500
} else {
  width = 90 * (window.innerWidth / 100)
  height = 50 * (window.innerHeight / 100)
}

// set height & width
canvas.height = height
canvas.width = width
canvas.style.width = width
canvas.style.height = height

const center = {
  x: width / 2,
  y: height / 2,
}

const gameState = {
  skillsAvailable: [
    "css", 
    "html", 
    "javascript", 
    "react", 
    "node", 
    "github", 
    "wordpress", 
    "stackOverflow", 
    "google"],
  skillsEarned: []
}

// main character position
const characterPosition = {
  x: center.x,
  y: center.y,
}

// position by percentage
const x = function(cent) {
  const per = (width / 100)
  return per * cent
  }

const y = function(cent) {
  const per = height / 100
  return per * cent
}

const linkedInAssets = {
  small: "/assets/linkedin/linkedin-48.png",
  medium: "/assets/linkedin/linkedin-96.png",
  large: "/assets/linkedin/linkedin-144.png",
  xl: "/assets/linkedin/linkedin-240.png",
  xxl: "/assets/linkedin/linkedin-480.png",
}

// get array of images of character
function getImageFrames(type) {
  const character = {
    idle: "/assets/player/idle/",
    walkingRight: "/assets/player/walking-right/",
    walkingLeft: "/assets/player/walking-left/",
    walkingUp: "/assets/player/walking-up/",
    walkingDown: "/assets/player/walking-down/",
  }

  const images = []
  let currentFrame = 0
  let path;

  while (currentFrame < 8) {
    path = character[type] + currentFrame + ".gif"
    images.push(path)
    currentFrame++
  }

  return images
}

function rand() {
  return Math.ceil(Math.random() * 80) + 5
}

function renderCharacter(asset, moveX = 0, moveY = 0) {
  let frameRate = 0

  function draw() {
    let image = new Image()
    image.src = getImageFrames(asset)[frameRate]
    image.onload = function() {
      // clear
      ctx.clearRect (0, 0, width, height);

      // if all skills are earned, game over
      if (gameState.skillsAvailable.length === 0) {
        renderWinner()
        return
      }
      
      //draw environment
      renderEnvironment()

      // display gameInfo
      const displaySkillsAvailable = document.getElementById("available")
      const displaySkillsEarned = document.getElementById("earned")
      displaySkillsAvailable.textContent = gameState.skillsAvailable.length
      displaySkillsEarned.textContent = gameState.skillsEarned.length
  
      // for character
      let offsetWidth = characterPosition.x - (image.width / 2)
      let offsetHeight = characterPosition.y - (image.height / 2)

      ctx.globalCompositeOperation= 'destination-over';
      ctx.drawImage(image, offsetWidth, offsetHeight)
      characterPosition.x += moveX
      characterPosition.y += moveY
      timer = setTimeout( () => {
        animationId = requestAnimationFrame(draw)
      }, 100)
    }

    frameRate < 7 ? frameRate += 1 : frameRate = 0
  }

  animationId = requestAnimationFrame(draw)
}

function renderSkills(asset, positionX, positionY) {
  let image = new Image()
  image.src = asset
  image.onload = function() {
    let offsetWidth = positionX - (image.width / 2)
    let offsetHeight = positionY - (image.height / 2)
    ctx.drawImage(image, offsetWidth, offsetHeight)
  }
}

function renderWinner() {
  ctx.font = "24px Arial";
  ctx.textAlign = "center"
  ctx.fillText("You are a frontend-developer!", center.x, center.y);
}

const skillAssets = {
  images: {
    css: "/assets/skills/css3.png",
    github: "/assets/skills/github.png",
    google: "/assets/skills/google.png",
    html: "/assets/skills/html-5.png",
    javascript: "/assets/skills/javascript.png",
    node: "/assets/skills/nodejs.png",
    react: "/assets/skills/react.png",
    stackOverflow: "/assets/skills/stack-overflow.png",
    wordpress: "/assets/skills/wordpress.png",
  },
  css: { x, y },
  html: { x, y },
  javascript: { x, y },
  github: { x, y },
  google: { x, y },
  node: { x, y },
  react: { x, y },
  wordpress: { x, y },
  stackOverflow: { x, y },
}

function renderEnvironment() {
  const remainingSkills = [...gameState.skillsAvailable]
  const _ = skillAssets

  if (shuffled) {
    remainingSkills.forEach(skill => renderSkills(_.images[skill], _[skill].x, _[skill].y))
    return
  }

  if (!shuffled) {
    remainingSkills.forEach(skill => {
      // if character found the skill, remove from showing up
      if (characterPosition.x - _[skill].x > -20 &&
          characterPosition.x - _[skill].x < 20 &&
          characterPosition.y - _[skill].y > -20 &&
          characterPosition.y - _[skill].y < 20) {
            gameState.skillsEarned.push(skill)
            gameState.skillsAvailable = gameState.skillsAvailable.filter(available => available !== skill)
          }

      _[skill].x = x(rand()), _[skill].y = x(rand())
      renderSkills(_.images.css, _.css.x, _.css.y)
    })
  }

  shuffled = true
  setTimeout( () => shuffled = false, 10000)
}

function eventDelegation() {
  const arrows = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"]
  isThrottled = false

  document.addEventListener("keydown", e => {
    if (isThrottled) return
    if (!arrows.includes(e.key)) return
    clearTimeout(timer)
    cancelAnimationFrame(animationId)
    isThrottled = true

    if (e.key === "ArrowRight") renderCharacter("walkingRight", 5, 0)
    if (e.key === "ArrowLeft") renderCharacter("walkingLeft", -5, 0,)
    if (e.key === "ArrowUp") renderCharacter("walkingUp", 0, -5)
    if (e.key === "ArrowDown") renderCharacter("walkingDown", 0, 5)
  })

  document.addEventListener("keyup", e => {
    if (!arrows.includes(e.key)) return
    clearTimeout(timer)
    cancelAnimationFrame(animationId)
    isThrottled = false
    renderCharacter("idle")
  })
}

renderCharacter("idle")
eventDelegation()