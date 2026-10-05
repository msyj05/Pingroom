import { ArrowRight, Plus, Users, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from '../components/common/Logo'
import Avatar from '../components/common/Avatar'

const STEPS = [
  {
    n: 1,
    title: 'Create a room',
    body: 'Pick a display name. A 6-character code is generated instantly.',
  },
  {
    n: 2,
    title: 'Share the code',
    body: 'Send code over text, DM for others to join',
  },
  {
    n: 3,
    title: 'Chat & vanish',
    body: 'Personal or group chat. Room auto-expires — nothing to delete.',
  },
]

export default function Welcome() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <Logo />
        <div className="flex items-center gap-3">
          <Link
            to="/join"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink ring-1 ring-line transition hover:bg-line"
          >
            Join room
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-16 px-6 pb-24 pt-10 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-lime px-3 py-1.5 text-sm font-bold text-ink">
            <span className="rounded-full bg-ink px-2 py-0.5 text-xs text-lime">New</span>
            No sign-up. No password.
          </span>

          <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Create a room.
            <br />
            Share the code.
            <br />
            <span className="bg-lime px-2">Start chatting.</span>
          </h1>

          <p className="mt-6 max-w-md text-lg text-muted">
            Pingroom is accountless messaging. Rooms live for 24 hours, anyone with the 6-letter code can jump
            in — on any device.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/create"
              className="flex items-center gap-2 rounded-2xl bg-ink px-6 py-4 text-sm font-bold text-white transition hover:bg-ink-800"
            >
              <Plus size={18} />
              Create room
            </Link>
            <Link
              to="/join"
              className="flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-ink ring-1 ring-line transition hover:bg-line"
            >
              <ArrowRight size={18} />
              Join room
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted">
            <span className="flex items-center gap-2">
              <Zap size={16} /> Instant, no install
            </span>
            <span className="flex items-center gap-2">
              <Users size={16} /> 1:1 or group
            </span>
          </div>
        </div>

        {/* Chat preview card — hidden on mobile/tablet, visible on desktop */}
        <div className="hidden lg:block rounded-xl2 bg-white p-4 shadow-panel sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-danger" />
                <span className="h-2.5 w-2.5 rounded-full bg-lime-dark" />
                <span className="h-2.5 w-2.5 rounded-full bg-success" />
              </div>
              <span className="flex items-center gap-1.5 rounded-xl bg-ink px-3 py-1.5 text-xs font-bold tracking-wider text-lime">
                X7K2P9
              </span>
            </div>
            <span className="rounded-full bg-cream px-3 py-1.5 text-xs font-bold text-ink"># X7K2P9 · 4 online</span>
          </div>

          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3">
              <Avatar name="Mara" color="lime" size="sm" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-ink">Mara <span className="font-normal text-muted">14:01</span></span>
                <div className="max-w-xs rounded-2xl rounded-tl-md bg-cream px-4 py-3 text-sm text-ink">
                  Just sent you the code. Are you in?
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="max-w-[75%] rounded-2xl rounded-tr-md bg-ink px-4 py-3 text-sm text-white">
                Yep, joined with X7K2P9. That was fast.
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="max-w-[75%] rounded-2xl rounded-tr-md bg-ink px-4 py-3 text-sm text-white">
                No account, no email. I love this
              </div>
              <span className="pr-1 text-xs text-muted">14:02</span>
            </div>
            <div className="flex items-start gap-3">
              <Avatar name="Mara" color="lime" size="sm" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-ink">Mara <span className="font-normal text-muted">14:03</span></span>
                <div className="max-w-xs rounded-2xl rounded-tl-md bg-cream px-4 py-3 text-sm text-ink">
                  You can share the code also for the others to join
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-cream px-4 py-3 text-sm text-muted ring-1 ring-line">
            Message as Guest...
          </div>
        </div>
      </main>

      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink font-display text-sm font-bold text-lime">
                {step.n}
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-ink">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
