import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RedirectPage from "@/pages/RedirectPage";
import { getCurrentUser } from "@/lib/supabase";

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [_, navigate] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          navigate('/login');
        }
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Authentication error:', error);
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
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
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
