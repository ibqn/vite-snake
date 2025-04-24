import { SnakeMachineContext } from '@/components/provider'
import { getGameObjectAtPoint } from '@/machine'
import { Cell } from '@/components/cell'

export const Board = () => {
  const gridSize = SnakeMachineContext.useSelector(
    ({ context }) => context.gridSize
  )
  const apple = SnakeMachineContext.useSelector(({ context }) => context.apple)
  const snake = SnakeMachineContext.useSelector(({ context }) => context.snake)

  return (
    <div>
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
