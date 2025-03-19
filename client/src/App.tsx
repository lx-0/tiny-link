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
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [_, navigate] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-blue-400 rounded-full"></div>
        </div>
      </div>
    );
  }

  // Once authenticated, render the children
  return isAuthenticated ? <>{children}</> : null;
}

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/register">
          <Register />
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
