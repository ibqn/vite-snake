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
                  'bg-cover bg-no-repeat',
                  'data-[type=head]:bg-[url(/snake/head.png)]',
                  'data-[type=body]:bg-[url(/snake/body.png)]',
                  'data-[type=body-turn]:bg-[url(/snake/body-turn.png)]',
                  'data-[type=tail]:bg-[url(/snake/tail.png)]',

                  // 'data-[type=apple]:after:text-center data-[type=apple]:after:text-2xl data-[type=apple]:after:content-["🍎"]'
                  'data-[type=apple]:bg-[url(/apple.png)]',

                  (dir === 'bottom-right' || dir === 'left-top') &&
                    'data-[type=body-turn]:-rotate-90',
                  (dir === 'top-left' || dir === 'right-bottom') &&
                    'data-[type=body-turn]:rotate-90',
                  (dir === 'bottom-left' || dir === 'right-top') &&
                    'data-[type=body-turn]:rotate-180',
                  (dir === 'top-right' || dir === 'left-bottom') &&
                    'data-[type=body-turn]:rotate-0',

                  'data-[dir=down]:rotate-90 data-[dir=left]:rotate-180 data-[dir=up]:-rotate-90'
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
