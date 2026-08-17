import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./layouts/AppShell";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Quizzes from "./pages/Quizzes";
import CreateQuiz from "./pages/CreateQuiz";
import JoinQuiz from "./pages/JoinQuiz";
import ParticipantQuiz from "./pages/ParticipantQuiz";
import Result from "./pages/Result";
import { UsersPage, StaffPage, AnalyticsPage, ActivityPage } from "./pages/AdminData";
import AccessDenied from "./pages/AccessDenied";

export default function App(){
  return <AuthProvider><Routes>
    <Route path="/login" element={<Login/>}/>
    <Route path="/join" element={<JoinQuiz/>}/>
    <Route path="/join/:joinCode" element={<JoinQuiz/>}/>
    <Route path="/participant/:id" element={<ParticipantQuiz/>}/>
    <Route path="/participant/:id/result" element={<Result/>}/>
    <Route element={<ProtectedRoute/>}><Route element={<AppShell/>}>
      <Route path="/dashboard" element={<Dashboard/>}/>
      <Route path="/quizzes" element={<Quizzes/>}/>
    </Route></Route>
    <Route element={<ProtectedRoute roles={["SUPER_ADMIN","STAFF"]}/>}><Route element={<AppShell/>}>
      <Route path="/admin/quizzes" element={<Quizzes/>}/>
      <Route path="/admin/quizzes/new" element={<CreateQuiz/>}/>
    </Route></Route>
    <Route element={<ProtectedRoute roles={["SUPER_ADMIN"]}/>}><Route element={<AppShell/>}>
      <Route path="/admin" element={<Dashboard/>}/>
      <Route path="/admin/users" element={<UsersPage/>}/>
      <Route path="/admin/staff" element={<StaffPage/>}/>
      <Route path="/admin/analytics" element={<AnalyticsPage/>}/>
      <Route path="/admin/activity" element={<ActivityPage/>}/>
      <Route path="/admin/settings" element={<AccessDenied/>}/>
    </Route></Route>
    <Route path="/403" element={<AccessDenied/>}/>
    <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
  </Routes></AuthProvider>
}
