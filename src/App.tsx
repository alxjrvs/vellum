import { useSystem } from './systems/useSystem';
import { useTheme } from './themes/useTheme';

export function App() {
  const system = useSystem();
  const theme = useTheme();
  return (
    <main>
      <h1>Vellum</h1>
      <p>
        System: {system.label} · Theme: {theme.label}
      </p>
    </main>
  );
}
