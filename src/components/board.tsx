import { SnakeMachineContext } from '@/components/provider'
import { getGameObjectAtPoint, State } from '@/machine'
import { Cell } from '@/components/cell'
import { TextOverlay } from '@/components/text-overlay'

export const Board = () => {
  const gridSize = SnakeMachineContext.useSelector(
    ({ context }) => context.gridSize
  )
  const apple = SnakeMachineContext.useSelector(({ context }) => context.apple)
  const snake = SnakeMachineContext.useSelector(({ context }) => context.snake)

  const state = SnakeMachineContext.useSelector((state) => state)
  const isGameOver = state.matches(State.gameOver)
  const isPaused = state.matches(State.paused)

  return (
    <div className="relative">
      {isGameOver && <TextOverlay text="Game over" />}
      {isPaused && <TextOverlay text="Paused" />}

      <div
        className="grid border border-gray-300"
        style={{
          gridTemplateColumns: `repeat(${gridSize.x}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize.y}, 1fr)`,
        }}
      >
        {Array.from({ length: gridSize.y }).map((_, row) =>
          Array.from({ length: gridSize.x }).map((_, col) => {
            const { type, dir } = getGameObjectAtPoint(
              { x: col, y: row },
              snake,
              apple
            )

            return (
              <Cell key={`${col} ${row}`} data-type={type} data-dir={dir} />
            )
          })
        )}
      </div>
    </div>
  )
}
