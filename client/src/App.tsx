import { useCallback, useState } from 'react'
import { RouterProvider } from 'react-router/dom'
import { Loader } from './components/Loader'
import { router } from './router'

const BOOT_KEY = 'yousef_boot_seen'

function bootSeen(): boolean {
  try {
    return sessionStorage.getItem(BOOT_KEY) === '1'
  } catch {
    return false
  }
}

export function App() {
  const [booting, setBooting] = useState(() => window.location.pathname === '/' && !bootSeen())

  const finishBoot = useCallback(() => {
    try {
      sessionStorage.setItem(BOOT_KEY, '1')
    } catch {}
    setBooting(false)
  }, [])

  return (
    <>
      <RouterProvider router={router} />
      {booting && <Loader onDone={finishBoot} />}
    </>
  )
}
