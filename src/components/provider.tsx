import { snakeMachine } from '@/machine'
import { createActorContext } from '@xstate/react'

export const SnakeMachineContext = createActorContext(snakeMachine)

export const SnakeProvider = SnakeMachineContext.Provider
