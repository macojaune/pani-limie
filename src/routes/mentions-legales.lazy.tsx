import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/mentions-legales')({
  component: () => <div>Hello /mentions-legales!</div>,
})
