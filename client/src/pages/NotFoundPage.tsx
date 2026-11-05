import { Link } from 'react-router'
import { PageHeader } from '../components/PageHeader'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-start gap-6">
      <PageHeader title="404" intro="This page doesn't exist." />
      <Link
        to="/"
        className="rounded-lg bg-accent px-5 py-3 font-semibold text-page transition-colors hover:bg-accent-light"
      >
        Back home
      </Link>
    </div>
  )
}
