import { cn } from '@/utils/class-names'
import type { ComponentProps } from 'react'

export type Props = {
  text: string
} & ComponentProps<'div'>

export const TextOverlay = ({ text, className, ...props }: Props) => {
  return (
    <div
      {...props}
      className={cn(
        'absolute inset-0 z-30 flex items-center justify-center',
        className
      )}
    >
      <div className="text-shadow rounded bg-gray-600/70 p-8 px-10 text-2xl font-bold text-white">
        {text}
      </div>
    </div>
  )
}
