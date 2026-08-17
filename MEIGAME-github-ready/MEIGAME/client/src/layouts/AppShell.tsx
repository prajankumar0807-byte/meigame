import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, ClipboardList, FileClock, LayoutDashboard, LogOut, Settings, Shield, Users, UserCog } from "lucide-react";
import { Logo } from "../components/Logo";
import { useAuth } from "../context/AuthContext";

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === "SUPER_ADMIN" ? [
    ["/admin", "Dashboard", LayoutDashboard], ["/admin/quizzes", "Quizzes", ClipboardList], ["/admin/users", "Users", Users], ["/admin/staff", "Staff", UserCog], ["/admin/analytics", "Analytics", BarChart3], ["/admin/activity", "Activity Logs", FileClock], ["/admin/settings", "Settings", Settings]
  ] : [
    ["/dashboard", "Dashboard", LayoutDashboard], ["/quizzes", "Quizzes", ClipboardList]
  ];
  return <div className="app-shell">
    <aside className="sidebar">
      <Logo compact />
      <div className="brand-mini">MEIGAME</div>
      <nav>{links.map(([to, label, Icon]) => <NavLink key={to as string} to={to as string} className={({isActive}) => isActive ? "nav-item active" : "nav-item"}><Icon size={18}/>{label as string}</NavLink>)}</nav>
      <div className="sidebar-bottom">
        <div className="user-chip"><div className="avatar">{user?.fullName?.slice(0,1)}</div><div><b>{user?.fullName}</b><small>{user?.role?.replace("_"," ")}</small></div></div>
        <button className="ghost-btn full" onClick={async () => { await logout(); navigate("/login"); }}><LogOut size={17}/> Logout</button>
      </div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div><span className="eyebrow">MAHENDRA ENGINEERING COLLEGE</span><h2>IT Department · Quiz Platform</h2></div><div className="secure-badge"><Shield size={15}/> Secure session</div></header>
      <div className="page-content"><Outlet /></div>
    </main>
  </div>;
}
