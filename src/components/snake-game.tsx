import { Board } from '@/components/board'
import { useEffect } from 'react'
import { SnakeMachineContext } from '@/components/provider'
import type { Dir } from '@/machine'
import { Score } from '@/components/score'

export const SnakeGame = () => {
  const { send } = SnakeMachineContext.useActorRef()

  useEffect(() => {
    function keyListener(event: KeyboardEvent) {
      const [maybeKey, maybeDir] = event.key.split('Arrow')
      if (maybeDir) {
        send({ type: 'ARROW_KEY', dir: maybeDir.toLowerCase() as Dir })
      } else if (maybeKey === 'r') {
        send({ type: 'NEW_GAME' })
      } else if (maybeKey === 'p') {
        send({ type: 'PAUSE' })
      }
    }

    window.addEventListener('keydown', keyListener)
    return () => window.removeEventListener('keydown', keyListener)
  }, [send])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 bg-gray-100">
      <Score />
      <Board />
    </div>
  )
}
