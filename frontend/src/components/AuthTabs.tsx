import { Link } from 'react-router-dom'

interface AuthTabsProps {
  active: 'login' | 'register'
}

export function AuthTabs({ active }: AuthTabsProps) {
  return (
    <div className="mb-6 inline-flex w-full items-center rounded-xl bg-[#eae5d8]/70 p-1 border border-[#ded8c9]">
      <Link
        to="/login"
        className={`flex-1 rounded-lg py-2 text-center text-xs font-semibold transition-all ${
          active === 'login'
            ? 'bg-white text-[#0c3529] shadow-sm font-bold'
            : 'text-[#6e7a71] hover:text-[#0c3529]'
        }`}
      >
        Sign in
      </Link>
      <Link
        to="/register"
        className={`flex-1 rounded-lg py-2 text-center text-xs font-semibold transition-all ${
          active === 'register'
            ? 'bg-white text-[#0c3529] shadow-sm font-bold'
            : 'text-[#6e7a71] hover:text-[#0c3529]'
        }`}
      >
        Create account
      </Link>
    </div>
  )
}
