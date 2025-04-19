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
  apple: Point
  score: number
  highScore: number
}

type GameObject = {
  type?: 'head' | 'body' | 'tail' | 'apple'
  dir?: Dir
  fromDir?: Dir
}

export const getGameObjectAtPoint = (
  point: Point,
  snake: Snake,
  apple: Point
): GameObject => {
  const snakeIndex = findIndex(snake, point)
  if (snakeIndex !== -1) {
    const bodyPart = snake[snakeIndex]
    if (snakeIndex === 0) {
      return { type: 'head', dir: bodyPart.dir }
    }

    if (snakeIndex === snake.length - 1) {
      return { type: 'tail', dir: bodyPart.dir }
    }

    const fromDir = snake[snakeIndex - 1].dir
    return { type: 'body', dir: bodyPart.dir, fromDir }
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
  points.findIndex((p) => isSamePoint(p, point))

const head = (snake: Snake) => snake[0]
const tail = (snake: Snake) => snake[snake.length - 1]
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
  const dir = Dir.right

  return [
    { x, y, dir },
    { x: x - 1, y, dir },
    { x: x - 2, y, dir },
  ]
}

const makeInitialContext = (): Context => {
  const gridSize = { x: 25, y: 15 }
  const snake = makeInitialSnake(gridSize)
  const apple = newApple(gridSize, snake)

  return {
    snake,
    gridSize,
    dir: Dir.right,
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
    }),
    'set direction': assign({
      dir: ({ context, event }) => {
        assertEvent(event, 'ARROW_KEY')
        return context.dir !== oppositeDir(event.dir) ? event.dir : context.dir
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
      }, 100)
      return () => clearInterval(intervalId)
    }),
  },
}).createMachine({
  id: 'snake',
  initial: 'new game',
  context: makeInitialContext(),
  states: {
    'new game': {
      on: {
        ARROW_KEY: {
          actions: ['set direction'],
          target: 'playing',
        },
      },
    },
    playing: {
      entry: ['move snake', 'new apple'],
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
          target: 'game over',
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
          target: 'paused',
        },
      },
    },
    paused: {
      on: {
        ARROW_KEY: {
          actions: ['set direction'],
          target: 'playing',
        },
      },
    },
    'game over': {
      on: {
        NEW_GAME: {
          actions: ['reset'],
          target: 'new game',
        },
      },
    },
  },
})
