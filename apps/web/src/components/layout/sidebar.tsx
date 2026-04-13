import { NavLink } from 'react-router-dom';
import { Heart, Footprints, Moon, Flame, LayoutDashboard } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '대시보드' },
  { to: '/heart-rate', icon: Heart, label: '심박수' },
  { to: '/steps', icon: Footprints, label: '걸음수' },
  { to: '/sleep', icon: Moon, label: '수면' },
  { to: '/calories', icon: Flame, label: '칼로리' },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Heart className="h-6 w-6 text-red-500" />
        <span className="text-lg font-bold">Wearable</span>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
