import { useLocation } from "wouter";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RedirectPage from "@/pages/RedirectPage";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";

// Simple layout component
function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isAuthPage = location === '/login' || location === '/register';
  const isRedirectPage = location === '/not-found' || location.startsWith('/r/');
  
  // Don't show navbar on auth pages or redirect pages
  return (
    <>
      {!isAuthPage && !isRedirectPage && <Navbar />}
      <main className="min-h-screen bg-gray-50">{children}</main>
    </>
  );
}

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/dashboard">
          <AuthGuard requireAuth={true}>
            <Dashboard />
          </AuthGuard>
        </Route>
        <Route path="/">
          <AuthGuard requireAuth={true} redirectTo="/login">
            <Dashboard />
          </AuthGuard>
        </Route>
        <Route path="/login">
          <AuthGuard requireAuth={false} redirectTo="/dashboard">
            <Login />
          </AuthGuard>
        </Route>
        <Route path="/register">
          <AuthGuard requireAuth={false} redirectTo="/dashboard">
            <Register />
          </AuthGuard>
        </Route>
        <Route path="/not-found">
          <RedirectPage />
        </Route>
        <Route path="/r/:shortCode">
          <RedirectPage />
        </Route>
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
