import { SnakeProvider } from '@/components/provider'
import { SnakeGame } from '@/components/snake-game'

export const App = () => {
  return (
    <SnakeProvider>
      <SnakeGame />
    </SnakeProvider>
  )
}
