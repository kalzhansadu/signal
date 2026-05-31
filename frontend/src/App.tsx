import { BarChart3, Gauge, Settings as SettingsIcon } from 'lucide-react';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Statistics } from './pages/Statistics';
import { useUiStore } from './store/uiStore';

const nav = [
  { page: 'dashboard' as const, label: 'Dashboard', icon: Gauge },
  { page: 'statistics' as const, label: 'Statistics', icon: BarChart3 },
  { page: 'settings' as const, label: 'Settings', icon: SettingsIcon },
];

export const App = () => {
  const { page, setPage } = useUiStore();
  const content = page === 'dashboard' ? <Dashboard /> : page === 'statistics' ? <Statistics /> : <Settings />;

  return (
    <div className="min-h-screen bg-ink text-slate-200">
      <header className="sticky top-0 z-10 border-b border-line bg-ink/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">SMC Market Dashboard</h1>
            <p className="text-sm text-slate-400">ICT structure, liquidity, order blocks, FVG and signal scoring</p>
          </div>
          <nav className="flex gap-2">
            {nav.map(({ page: itemPage, label, icon: Icon }) => (
              <button
                key={itemPage}
                className={`nav-button ${page === itemPage ? 'nav-button-active' : ''}`}
                onClick={() => setPage(itemPage)}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] px-4 py-5">{content}</main>
    </div>
  );
};
