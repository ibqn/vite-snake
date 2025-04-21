import { SnakeMachineContext } from '@/components/provider'

export const Score = () => {
  const score = SnakeMachineContext.useSelector(({ context }) => context.score)

  return (
    <div className="flex flex-row items-center justify-center gap-1 rounded border border-gray-300 bg-gray-100 p-1">
      <div className="text-shadow min-w-8 text-right text-2xl font-bold">
        {score}
      </div>
      <div className="size-8 bg-[url(/apple.png)] bg-cover bg-no-repeat"></div>
    </div>
  )
}
