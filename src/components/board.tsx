import { cn } from '@/utils/class-names'
import { SnakeMachineContext } from '@/components/provider'
import { getGameObjectAtPoint } from '@/machine'

export const Board = () => {
  const gridSize = SnakeMachineContext.useSelector(
    (state) => state.context.gridSize
  )
  const apple = SnakeMachineContext.useSelector((state) => state.context.apple)
  const snake = SnakeMachineContext.useSelector((state) => state.context.snake)

  return (
    <div>
      <div
        className="grid grid-cols-10 border border-gray-300"
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
              <div
                key={`${col} ${row}`}
                className={cn(
                  'flex size-8 items-center justify-center',
                  'even:bg-gray-200',
                  'data-[type=apple]:after:content-["🍎"]'
                )}
                data-type={type}
                data-dir={dir}
              ></div>
            )
          })
        )}
      </div>
    </div>
  )
}
