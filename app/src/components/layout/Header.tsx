import { BookOpen } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { FarmSelector } from './FarmSelector'
import { NotificationBell } from './NotificationBell'
import { DevToolsDropdown } from './DevToolsDropdown'
import { Link } from '@tanstack/react-router'
import { useAppAuth } from '@/lib/auth'

function AvatarFallback({ initial = 'U' }: { initial?: string }) {
  return (
    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
      {initial}
    </div>
  )
}

function ClerkProfileAvatar() {
  const { user } = useUser()

  if (!user?.imageUrl) {
    const initial = user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0)?.toUpperCase() || 'U'
    return <AvatarFallback initial={initial} />
  }

  return (
    <img
      src={user.imageUrl}
      alt={user.fullName || 'Profile'}
      className="h-5 w-5 rounded-full object-cover"
    />
  )
}

function ProfileAvatar() {
  const { isDevAuth } = useAppAuth()

  // In dev auth mode, ClerkProvider isn't mounted, so we can't use useUser()
  if (isDevAuth) {
    return <AvatarFallback initial="D" />
  }

  return <ClerkProfileAvatar />
}

export function Header() {
  return (
    <header className="flex h-8 items-center justify-between border-b border-border bg-background px-2">
      <FarmSelector />
      <div className="flex items-center gap-2">
        <DevToolsDropdown />

        <Link to="/docs" className="flex h-5 w-5 items-center justify-center rounded hover:bg-accent" title="Documentation">
          <BookOpen className="h-3 w-3" />
        </Link>

        <NotificationBell />

        <ProfileAvatar />
      </div>
    </header>
  )
}
