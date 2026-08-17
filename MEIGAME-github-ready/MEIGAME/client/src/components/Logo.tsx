export function Logo({ compact = false }: { compact?: boolean }) {
  return <img src="/logo/meigame-logo.png" alt="MEIGAME — Mahendra Engineering College IT Department" className={compact ? "logo logo-compact" : "logo"} />;
}
