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
      <div className="text-shadow rounded border border-gray-300 bg-gray-100/90 p-8 px-10 text-2xl font-bold drop-shadow">
        {text}
      </div>
    </div>
  )
}
