const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error ?? "Request failed.");
  return data as T;
}

export const api = {
  login: (body: { username: string; password: string }) => request<{ user: User }>(`/auth/login`, { method: "POST", body: JSON.stringify(body) }),
  logout: () => request<{ ok: true }>(`/auth/logout`, { method: "POST" }),
  me: () => request<{ user: User }>(`/auth/me`),
  users: () => request<{ users: User[] }>(`/users`),
  staff: () => request<{ staff: Staff[] }>(`/staff`),
  createStaff: (body: unknown) => request(`/staff`, { method: "POST", body: JSON.stringify(body) }),
  updateStaffPermissions: (id: string, permissions: string[]) => request(`/staff/${id}/permissions`, { method: "PATCH", body: JSON.stringify({ permissions }) }),
  deleteStaff: (id: string) => request(`/staff/${id}`, { method: "DELETE" }),
  quizzes: () => request<{ quizzes: Quiz[] }>(`/quizzes`),
  quiz: (id: string) => request<{ quiz: Quiz }>(`/quizzes/${id}`),
  createQuiz: (body: unknown) => request(`/quizzes`, { method: "POST", body: JSON.stringify(body) }),
  publishQuiz: (id: string) => request(`/quizzes/${id}/publish`, { method: "POST" }),
  startQuiz: (id: string) => request(`/quizzes/${id}/start`, { method: "POST" }),
  endQuiz: (id: string) => request(`/quizzes/${id}/end`, { method: "POST" }),
  results: (quizId: string) => request<{ results: Result[] }>(`/results/quiz/${quizId}`),
  analytics: () => request<Analytics>(`/analytics/overview`),
  activity: () => request<{ logs: Activity[] }>(`/activity`),
  join: (code: string, body: { name: string; collegeId?: string }) => request<JoinResponse>(`/join/${code}`, { method: "POST", body: JSON.stringify(body) }),
  participant: (id: string) => request<ParticipantResponse>(`/participant/session/${id}`),
  answer: (id: string, body: { questionId: string; selectedOptionId: string; responseTime: number }) => request(`/participant/session/${id}/answer`, { method: "POST", body: JSON.stringify(body) }),
  complete: (id: string) => request<{ result: Result }>(`/participant/session/${id}/complete`, { method: "POST" })
};

export type User = { id: string; fullName: string; username: string; role: "SUPER_ADMIN"|"STAFF"|"USER"|"PARTICIPANT"; permissions: string[]; collegeId?: string; department?: string; year?: string; section?: string; email?: string; phone?: string; isActive?: boolean; createdAt?: string; lastLoginAt?: string };
export type Staff = User & { permissions: string[] };
export type Quiz = { id: string; title: string; description?: string; subject: string; department?: string; year?: string; difficulty: string; status: string; joinCode: string; timeLimit?: number; leaderboardEnabled: boolean; questions?: Question[]; _count?: { questions: number; sessions: number; participants?: number }; createdBy?: { fullName: string; username: string } };
export type Question = { id: string; questionText: string; questionType: string; points: number; timeLimit?: number; order: number; options: { id: string; optionText: string; order: number }[] };
export type Result = { id: string; score: number; totalPoints: number; correctAnswers: number; incorrectAnswers: number; accuracy: number; timeTaken: number; rank?: number; participant?: { name: string; collegeId?: string } };
export type Activity = { id: string; action: string; createdAt: string; ipAddress?: string; user?: { username: string; fullName: string; role: string } };
export type Analytics = { overview: { users: number; staff: number; quizzes: number; results: number }; topQuizzes: Quiz[] };
export type JoinResponse = { participant: { id: string; sessionId: string; name: string }; quiz: Quiz & { questions: Question[] } };
export type ParticipantResponse = { participant: { id: string; name: string; completedAt?: string }; quiz: Quiz & { questions: Question[] }; answers: { questionId: string; selectedOptionId: string; isCorrect: boolean; pointsEarned: number }[] };
