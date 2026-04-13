import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';

export function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          )}
          <span className="text-sm font-medium text-gray-700">{user?.displayName}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
