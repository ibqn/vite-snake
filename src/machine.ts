import { assertEvent, assign, fromCallback, or, setup } from 'xstate'

export const Dir = {
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
} as const

export type Dir = (typeof Dir)[keyof typeof Dir]

export type Point = {
  x: number
  y: number
}
export type BodyPart = Point & { dir: Dir }
export type Snake = BodyPart[]

export type Context = {
  snake: Snake
  gridSize: Point
  dir: Dir
  prevDir: Dir | null
  apple: Point
  score: number
  highScore: number
}

type GameObject = {
  type?: 'head' | 'body' | 'body-turn' | 'tail' | 'apple'
  dir?: TurnDir
}

const getTailDir = (from: Point, to: Point): Dir => {
  const dx = to.x - from.x
  const dy = to.y - from.y

  if (dx === 0 && dy === -1) return Dir.up
  if (dx === 0 && dy === 1) return Dir.down
  if (dx === -1 && dy === 0) return Dir.left
  if (dx === 1 && dy === 0) return Dir.right

  throw new Error('Invalid points for determining tail direction')
}

export const getGameObjectAtPoint = (
  point: Point,
  snake: Snake,
  apple: Point
): GameObject => {
  const snakeIndex = findIndex(snake, point)
  if (snakeIndex !== -1) {
    const body = snake[snakeIndex]
    if (snakeIndex === 0) {
      return { type: 'head', dir: body.dir }
    }

    if (snakeIndex === snake.length - 1) {
      let to = snake[snakeIndex - 1]
      if (isSamePoint(body, to)) {
        to = snake[snakeIndex - 2]
      }

      return { type: 'tail', dir: getTailDir(body, to) }
    }

    const from = snake[snakeIndex + 1]
    const to = snake[snakeIndex - 1]
    return {
      type: to.x !== from.x && to.y !== from.y ? 'body-turn' : 'body',
      dir: getTurnDir(from, body, to),
    }
  }

  if (isSamePoint(point, apple)) {
    return { type: 'apple' }
  }
  return {}
}

const isSamePoint = (a: Point, b: Point) => a.x === b.x && a.y === b.y
const isOutOfBounds = (point: Point, gridSize: Point) =>
  point.x < 0 || point.y < 0 || point.x >= gridSize.x || point.y >= gridSize.y

const findIndex = <T extends Point>(points: T[], point: Point) =>
  points.findLastIndex((p) => isSamePoint(p, point))

const head = (snake: Snake) => snake.slice(0, 1)[0]
const tail = (snake: Snake) => snake.slice(-1)[0]
const body = (snake: Snake) => snake.slice(1)

const oppositeDir = (dir: Dir): Dir => {
  switch (dir) {
    case Dir.up:
      return Dir.down
    case Dir.down:
      return Dir.up
    case Dir.left:
      return Dir.right
    case Dir.right:
      return Dir.left
  }
}

type TurnDir =
  | Dir
  | 'bottom-left'
  | 'bottom-right'
  | 'top-left'
  | 'top-right'
  | 'right-bottom'
  | 'left-bottom'
  | 'right-top'
  | 'left-top'

const getTurnDir = (from: Point, current: Point, to: Point): TurnDir => {
  // Calculate vectors
  const vector1 = { x: current.x - from.x, y: current.y - from.y }
  const vector2 = { x: to.x - current.x, y: to.y - current.y }

  // Cross product to determine the turn direction
  const crossProduct = vector1.x * vector2.y - vector1.y * vector2.x

  // Determine the turn direction based on the cross product
  if (crossProduct > 0) {
    // clockwise turn (right turn)
    if (vector1.x > 0 && vector2.y > 0) return 'right-bottom'
    if (vector1.y > 0 && vector2.x < 0) return 'bottom-left'
    if (vector1.x < 0 && vector2.y < 0) return 'left-top'
    if (vector1.y < 0 && vector2.x > 0) return 'top-right'
  } else if (crossProduct < 0) {
    // counter-clockwise turn (left turn)
    if (vector1.x > 0 && vector2.y < 0) return 'right-top'
    if (vector1.y > 0 && vector2.x > 0) return 'bottom-right'
    if (vector1.x < 0 && vector2.y > 0) return 'left-bottom'
    if (vector1.y < 0 && vector2.x < 0) return 'top-left'
  }

  // No turn (straight movement)
  if (vector2.x > 0) return Dir.right
  if (vector2.x < 0) return Dir.left
  if (vector2.y > 0) return Dir.down
  if (vector2.y < 0) return Dir.up

  throw new Error('Invalid points for determining turn direction')
}

const newHead = (head: BodyPart, dir: Dir): BodyPart => {
  switch (dir) {
    case Dir.up:
      return { x: head.x, y: head.y - 1, dir }
    case Dir.down:
      return { x: head.x, y: head.y + 1, dir }
    case Dir.left:
      return { x: head.x - 1, y: head.y, dir }
    case Dir.right:
      return { x: head.x + 1, y: head.y, dir }
  }
}

const moveSnake = (snake: Snake, dir: Dir): Snake => [
  newHead(head(snake), dir),
  ...snake.slice(0, -1),
]

const randomGridPoint = (gridSize: Point): Point => ({
  x: Math.floor(Math.random() * gridSize.x),
  y: Math.floor(Math.random() * gridSize.y),
})

const newApple = (gridSize: Point, ineligiblePoints: Point[]): Point => {
  let newApple = randomGridPoint(gridSize)
  while (findIndex(ineligiblePoints, newApple) !== -1) {
    newApple = randomGridPoint(gridSize)
  }
  return newApple
}

const growSnake = (snake: Snake): Snake => [...snake, tail(snake)]

const makeInitialSnake = (gridSize: Point): Snake => {
  const x = Math.floor(gridSize.x / 2)
  const y = Math.floor(gridSize.y / 2)

  return [
    { x, y: y + 1, dir: Dir.down },
    { x, y, dir: Dir.right },
    { x: x - 1, y, dir: Dir.right },
    { x: x - 2, y, dir: Dir.down },
    { x: x - 2, y: y - 1, dir: Dir.down },
  ]
}

const makeInitialContext = (): Context => {
  const gridSize = { x: 25, y: 15 }
  const snake = makeInitialSnake(gridSize)
  const apple = newApple(gridSize, snake)
  const dir = head(snake).dir

  return {
    snake,
    gridSize,
    dir,
    prevDir: null,
    apple,
    score: 0,
    highScore: 0,
  }
}

type NewGameEvent = { type: 'NEW_GAME' }
type PauseEvent = { type: 'PAUSE' }
type TickEvent = { type: 'TICK' }
type ArrowKeyEvent = {
  type: 'ARROW_KEY'
  dir: Dir
}

type Events = NewGameEvent | PauseEvent | TickEvent | ArrowKeyEvent

export const State = {
  newGame: 'new game',
  playing: 'playing',
  paused: 'paused',
  gameOver: 'game over',
} as const
export type State = (typeof State)[keyof typeof State]

export const snakeMachine = setup({
  types: {
    context: {} as Context,
    events: {} as Events,
  },
  guards: {
    'bite apple': ({ context }) =>
      isSamePoint(head(context.snake), context.apple),
    'bite self': ({ context }) =>
      findIndex(body(context.snake), head(context.snake)) !== -1,
    'hit wall': ({ context }) =>
      isOutOfBounds(head(context.snake), context.gridSize),
  },
  actions: {
    'move snake': assign({
      snake: ({ context }) => moveSnake(context.snake, context.dir),
      prevDir: null,
    }),
    'set direction': assign({
      dir: ({ context, event }) => {
        assertEvent(event, 'ARROW_KEY')
        if (!context.prevDir) {
          context.prevDir = context.dir
        }
        return context.prevDir !== oppositeDir(event.dir)
          ? event.dir
          : context.dir
      },
    }),
    'grow snake': assign({
      snake: ({ context }) => growSnake(context.snake),
    }),
    'new apple': assign({
      apple: ({ context }) => newApple(context.gridSize, context.snake),
    }),
    'update score': assign({
      score: ({ context }) => context.score + 1,
      highScore: ({ context }) =>
        Math.max(context.score + 1, context.highScore),
    }),
    reset: assign(({ context }) => ({
      ...makeInitialContext(),
      highScore: context.highScore,
    })),
  },
  actors: {
    ticks: fromCallback(({ sendBack }) => {
      const intervalId = setInterval(() => {
        sendBack({ type: 'TICK' })
      }, 200)
      return () => clearInterval(intervalId)
    }),
  },
}).createMachine({
  id: 'snake',
  initial: 'new game',
  context: makeInitialContext(),
  states: {
    [State.newGame]: {
      on: {
        ARROW_KEY: {
          actions: ['set direction'],
          target: State.playing,
        },
      },
    },
    [State.playing]: {
      // entry: ['move snake'],
      invoke: {
        src: 'ticks',
      },
      always: [
        {
          guard: 'bite apple',
          actions: ['grow snake', 'new apple', 'update score'],
        },
        {
          guard: or(['bite self', 'hit wall']),
          target: State.gameOver,
        },
      ],
      on: {
        TICK: {
          actions: ['move snake'],
        },
        ARROW_KEY: {
          actions: ['set direction'],
        },
        PAUSE: {
          target: State.paused,
        },
      },
    },
    [State.paused]: {
      on: {
        PAUSE: {
          target: State.playing,
        },
      },
    },
    [State.gameOver]: {
      on: {
        NEW_GAME: {
          actions: ['reset'],
          target: State.newGame,
        },
      },
    },
  },
})
