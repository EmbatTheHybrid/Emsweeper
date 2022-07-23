const holder = document.querySelector(" .mine__holder")
const timer = document.getElementById("timer")
const flags = document.getElementById("flags")
const feedback = document.getElementById("feedback")

const start = document.querySelector(".start")
const height = document.getElementById("height")
const width = document.getElementById("width")
const bombs = document.getElementById("bombs")

const max_width = 640;

const levels = {
	"Easy": [
		9, 9, 20
	]
}

const number_colors = [
	"darkgrey", "blue", "darkgreen", "red", "navy", "maroon", "darkcyan", "black", "#3f3d3f"
]

let board = []
let mainBoard = []
let currentFlags = 0
let currentTime = 0
let revealingBombs = false
let bombsRevealed = false
let firstMove = true

let currentHeight = 9
let currentWidth = 11
let currentBombs = 20

let intervalId

function recursiveTileCheck(row, column) {
	for (let yOff = -1; yOff <= 1; yOff++) {
		for (let xOff = -1; xOff <= 1; xOff++) {
			let boardRow = board[row + yOff]

			if (boardRow === undefined || boardRow[column + xOff] === undefined) {
				continue
			}

			revealCell(row + yOff, column + xOff)
		}
	}
}

function resetFeedback() {
	
}

function hasWon() {
	// To check a win we check each non bomb cell and if they're all disabled then we won
	for (let row = 0; row < mainBoard.length; row++) {
		for (let column = 0; column < mainBoard[row].length; column++) {
			let number = mainBoard[row][column]
			let button = board[row][column]

			if (number === -1 || button.id === "disabled") {
				continue
			}

			return false
		}
	}

	return true
}

let isBomb = (row, column) => mainBoard[row][column] == -1

function revealCell(row, column, ignore) {
	let button = board[row][column]

	if (bombsRevealed || button.id === "disabled" || (button.id === "flagged" && !ignore)) {
		return
	}

	let selection = mainBoard[row][column]

	if (firstMove && selection === -1) {
		moveBomb(row, column)
		selection = mainBoard[row][column]
	}

	button.onmousedown = function() {}
	button.onmouseup = function() {}
	button.id = (selection == -1 ? "mine" : "disabled")

	button.innerHTML = `<b>${(selection == -1 ? "*" : selection)}</b>`
	button.style.color = (selection == -1 ? "black" : number_colors[selection]) 

	if (selection === 0) {
		recursiveTileCheck(row, column)
	}

	if (hasWon()) {
		// The player won by activating all cells that aren't bombs
		flagAllBombs()
		feedback.innerHTML = "✓"
		feedback.style.color = "lightgreen"
		window.clearInterval(intervalId)
	} else if (selection == -1 && !revealingBombs) {
		revealAllBombs()
		feedback.innerHTML = "❌"
		window.clearInterval(intervalId)
	}

	firstMove = false
}

function flagAllBombs() {
	for (let i = 0; i < mainBoard.length; i++) {
		for (let j = 0; j < mainBoard[i].length; j++) {
			let button = board[i][j]
			if (!isBomb(i, j)) {
				continue
			}

			button.id = "flagged"
			button.innerHTML = "🚩"
		}
	}
	currentFlags = 0
	flags.innerHTML = `Flags: ${currentFlags}`
	bombsRevealed = true
}

function moveBomb(row, column) {
	// Get all positions
	let possibleMovePositions = []

	for (let i = 0; i < mainBoard.length; i++) {
		for (let j = 0; j < mainBoard[i].length; j++) {
			if (isBomb(i, j)) {
				continue
			}
			possibleMovePositions.push([i, j])
		}
	}

	// Get random position
	let position = possibleMovePositions[Math.floor(Math.random() * possibleMovePositions.length)]

	// Set new position
	mainBoard[row][column] = 0
	mainBoard[position[0]][position[1]] = -1

	computeNearestNeighbours()
}

function computeNearestNeighbours() {
	for (let i = 0; i < mainBoard.length; i++) {
		for (let j = 0; j < mainBoard[i].length; j++) {
			if (isBomb(i, j)) {
				continue
			}

			let numBombs = 0
			for (let yOff = -1; yOff <= 1; yOff++) {
				for (let xOff = -1; xOff <= 1; xOff++) {
					if (xOff === 0 && yOff === 0) {
						continue
					}
					let boardRow = mainBoard[i + yOff]

					if (boardRow === undefined || boardRow[j + xOff] === undefined || !isBomb(i + yOff, j + xOff)) {
						continue
					}

					numBombs++;
				}
			}
			mainBoard[i][j] = numBombs;
		}
	}
}

function revealAllBombs() {
	revealingBombs = true
	for (let i = 0; i < mainBoard.length; i++) {
		for (let j = 0; j < mainBoard[i].length; j++) {
			let button = board[i][j]
			if (!isBomb(i, j) && button.id !== "flagged") {
				continue
			}

			if (button.id !== "flagged") {
				revealCell(i, j, true)
			} 
			if (button.id === "flagged" && !isBomb(i, j)) {
				console.log("Not correct")
				button.innerHTML = "<s>" + button.innerHTML + "</s>"
				button.style.color = "black"
			} 
		}
	}
	revealingBombs = false
	bombsRevealed = true
}

function flagCell(row, column) {
	let button = board[row][column]

	if (bombsRevealed || button.id === "disabled" || (button.id === "" && currentFlags === 0)) {
		return
	}

	button.id = (button.id === "flagged" ? "" : "flagged")
	button.innerHTML = (button.id === "flagged" ? "🚩" : "")
	
	currentFlags += (button.id === "flagged" ? -1 : 1)
	flags.innerHTML = `Flags: ${currentFlags}`
}

function createLevel(height, width, bombs) {
	if (height < 9 || height > 25) {
		alert("Height must be between 9 and 30")
		return
	} else if (width < 9 || width > 30) {
		alert("Width must be between 9 and 30")
		return
	}
	else if (bombs < 1 || bombs >= height * width) {
		alert(`Bombs must be greater than 0 and less than ${height * width}`)
		return
	}

	// Reset feed back
	feedback.innerHTML = "---"
	feedback.style.color = "white"

	board = []
	mainBoard = []
	currentFlags = bombs
	currentTime = 0
	bombsRevealed = false
	revealingBombs = false
	firstMove = true

	window.clearInterval(intervalId)

	holder.innerHTML = ""

	for (let i = 0; i < height; i++) {
		mainBoard[i] = []
		board[i] = []
		let row = document.createElement('div')
		row.className = "mine__row"
		for (let j = 0; j < width; j++) {
			mainBoard[i][j] = 0
			let button = document.createElement('button')
			button.className = "cell"

			button.oncontextmenu = function() {
				// Flagging
				return false
			}

			let press;

			button.onmousedown = function(e) {
				if (e.button === 2) {
					flagCell(i, j)
				}
			}


			button.ontouchend = function() {
				if (window.innerWidth < max_width) {
					clearTimeout(press)
				}
			}

			button.ontouchstart = function() {
				if (window.innerWidth < max_width) {
					press = window.setTimeout(function() {
						navigator.vibrate(200)
						flagCell(i, j)
					}, 1500)
				}
			}

			button.onmouseup = function(e) {
				if (e.button === 0) {
					revealCell(i, j)
				}

				
			}

			board[i][j] = button
			row.appendChild(button)
		}
		holder.appendChild(row)
	}

	// Game board generation

	// Loop through how many bombs we have and place in a random position
	for (let bomb = 0; bomb < bombs; bomb++) {
		let row, column
		do {
			row = Math.floor(Math.random() * height)
			column = Math.floor(Math.random() * width)
		} while (isBomb(row, column))
		mainBoard[row][column] = -1
	}

	// Now set the numbers
	computeNearestNeighbours()

	flags.innerHTML = `Flags: ${currentFlags}`
	timer.innerHTML = `Timer: ${currentTime}`

	intervalId = window.setInterval(function() {
		currentTime++
		timer.innerHTML = `Timer: ${currentTime}`
	}, 1000)
}

createLevel(currentHeight, currentWidth, currentBombs)

// Section for creating a level
start.onmouseup = function(e) {
	if (e.button !== 0){
		return
	}

	currentHeight = parseInt(height.value)
	currentWidth = parseInt(width.value)
	currentBombs = parseInt(bombs.value)

	if (!currentHeight || !currentWidth || !currentBombs) {
		alert("All values must be inputted")
		return
	}

	createLevel(currentHeight, currentWidth, currentBombs)
}

feedback.onmouseup = function(e) {
	if (e.button !== 0) {
		return
	}

	createLevel(currentHeight, currentWidth, currentBombs)
}