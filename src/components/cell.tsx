import { cn } from '@/utils/class-names'
import type { ComponentProps } from 'react'

type Props = ComponentProps<'div'>

export const Cell = ({ className, ...props }: Props) => {
  return (
    <div
      {...props}
      className={cn(
        'flex size-8 items-center justify-center',
        'even:bg-gray-200',
        'bg-cover bg-no-repeat',
        'data-[type=head]:bg-[url(/snake/head.png)]',
        'data-[type=body]:bg-[url(/snake/body.png)]',
        'data-[type=body-turn]:bg-[url(/snake/body-turn.png)]',
        'data-[type=tail]:bg-[url(/snake/tail.png)]',
        'data-[type=apple]:bg-[url(/apple.png)]',

        'data-[dir=bottom-right]:-rotate-90 data-[dir=left-top]:-rotate-90',
        'data-[dir=right-bottom]:rotate-90 data-[dir=top-left]:rotate-90',
        'data-[dir=bottom-left]:rotate-180 data-[dir=right-top]:rotate-180',
        'data-[dir=left-bottom]:rotate-0 data-[dir=top-right]:rotate-0',

        'data-[dir=down]:rotate-90 data-[dir=left]:rotate-180 data-[dir=up]:-rotate-90',
        className
      )}
    ></div>
  )
}
