const X = 0
const Y = 1
const BOARD_SIZE = 4
const INITIAL_NUMBERS_COUNT = 2
const FREE_SPACE = 0

const DIRECTIONS = {
  Up: [-1, 0],
  Down: [1, 0],
  Left: [0, -1],
  Right: [0, 1],
}

const colors = {
  2: "#eee4da",
  4: "#eee1c9",
  8: "#f3b27a",
  16: "#f69664",
  32: "#f77c5f",
  64: "#f75f3b",
  128: "#edd073",
  256: "#edcc62",
  512: "#edc950",
  1024: "#edc53f",
  2048: "#edc22e",
}

const isNot =
  (fn) =>
  (...args) =>
    !fn(...args)

const isFree = (value) => value === FREE_SPACE

const isNotFree = isNot(isFree)

const renderBoard = (board, container) => {
  container.innerHTML = ""
  const table = document.createElement("table")

  board.forEach((row) => {
    const tr = document.createElement("tr")

    row.forEach((cell) => {
      const td = document.createElement("td")
      tr.appendChild(td)

      if (isFree(cell)) return
      const text = document.createElement("p")
      text.innerHTML = cell
      td.appendChild(text)
      td.style.backgroundColor = colors[cell]
    })

    table.appendChild(tr)
  })

  container.appendChild(table)
}

const getNewMatrix = (size, value = 0) =>
  Array(size)
    .fill()
    .map(() => Array(size).fill(value))

const getRandomNumber = (max, min = 0) =>
  Math.floor(Math.random() * (max - min) + min)

const getRandomElement = (array) => {
  const index = getRandomNumber(array.length)
  return array[index]
}

const twoOrFour = () => (getRandomNumber(2) ? 2 : 4)

//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////

const newGame = () => {
  let board
  let boardSize
  let isMergedData = {}

  const isCellFree = ([x, y]) => isFree(board[x][y])
  const isSameNumbers = ([x1, y1], [x2, y2]) => board[x1][y1] === board[x2][y2]
  const isInRange = (value) => -1 < value && value < boardSize
  const isCoordInRange = ([x, y]) => isInRange(x) && isInRange(y)

  const getCoords = (fn) => {
    const result = []
    board.forEach((row, x) => {
      row.forEach((cell, y) => {
        if (fn(cell)) {
          result.push([x, y])
        }
      })
    })
    return result
  }

  const setNumbers = (coordsArray, count) => {
    Array(count)
      .fill()
      .forEach(() => {
        const [x, y] = getRandomElement(coordsArray)
        board[x][y] = twoOrFour()
      })
  }

  const initBoard = () => {
    board = getNewMatrix(boardSize)
    setNumbers(getCoords(isFree), INITIAL_NUMBERS_COUNT)
  }

  const start = (_boardSize) => {
    boardSize = _boardSize
    initBoard()
    return board
  }

  const getSortConfig = ([x, y]) => {
    return {
      index: 1 - Math.abs(x),
      slope: (x || y) * -1,
    }
  }

  const by =
    ({ index, slope }) =>
    (a, b) =>
      (a[index] - b[index]) * slope

  const changeCoords = ([fromX, fromY], [toX, toY]) => {
    board[toX][toY] = board[fromX][fromY]
    board[fromX][fromY] = 0
  }

  const merge = ([fromX, fromY], [toX, toY]) => {
    board[toX][toY] *= 2
    board[fromX][fromY] = 0
    isMergedData[[toX, toY]] = true
  }

  const move = (from, [dx, dy]) => {
    const to = [from[X] + dx, from[Y] + dy]
    if (!isCoordInRange(to)) return

    if (isCellFree(to)) {
      changeCoords(from, to)
    } else if (
      isSameNumbers(from, to) &&
      !isMergedData[from] &&
      !isMergedData[to]
    ) {
      merge(from, to)
    }

    move(to, [dx, dy])
  }

  const play = (key) => {
    const sortConfig = getSortConfig(DIRECTIONS[key])
    const sortedFullCoords = getCoords(isNotFree).sort(by(sortConfig))

    sortedFullCoords.forEach((coord) => {
      move(coord, DIRECTIONS[key])
    })
    isMergedData = {}
  }

  const hasSameNeighbor = ([x, y]) =>
    Object.values(DIRECTIONS).some(([dx, dy]) => {
      const neighbor = [x + dx, y + dy]
      if (!isCoordInRange(neighbor)) return false
      return isSameNumbers([x, y], neighbor)
    })

  const isGameContinue = () =>
    board.some((row, x) =>
      row.some((cell, y) => isFree(cell) || hasSameNeighbor([x, y]))
    )

  const event = (key) => {
    play(key)

    const freeCoords = getCoords(isFree)
    if (freeCoords.length) {
      setNumbers(freeCoords, 1)
    }

    return [board, isGameContinue()]
  }

  return {
    start,
    event,
  }
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

const container = document.getElementById("root")

const game = newGame()
const board = game.start(BOARD_SIZE)

renderBoard(board, container)

const keys = {
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
}

document.addEventListener("keydown", (e) => {
  if (!keys[e.code]) return
  const [board, isContinue] = game.event(keys[e.code])
  if (!isContinue) {
    console.log("Game over")
  }
  renderBoard(board, container)
})
