import { cn } from '@/utils/class-names'
import { SnakeMachineContext } from '@/components/provider'
import { getGameObjectAtPoint } from '@/machine'

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
              <div
                key={`${col} ${row}`}
                className={cn(
                  'flex size-8 items-center justify-center',
                  'even:bg-gray-200',
                  'after:size-full after:bg-cover after:bg-no-repeat after:content-[""]',
                  'data-[type=head]:after:bg-[url(/snake/head.png)]',
                  'data-[type=body]:after:bg-[url(/snake/body.png)]',
                  'data-[type=body-turn]:after:bg-[url(/snake/body-turn.png)]',
                  'data-[type=tail]:after:bg-[url(/snake/tail.png)]',
                  // 'data-[type=apple]:after:text-center data-[type=apple]:after:text-2xl data-[type=apple]:after:content-["🍎"]'
                  'data-[type=apple]:after:bg-[url(/apple.png)]'
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
