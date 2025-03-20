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
import LandingPage from "@/pages/LandingPage";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";

// App layout component with navbar
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">{children}</main>
    </>
  );
}

// Simple layout without navbar
function SimpleLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen">{children}</main>
  );
}

function Router() {
  return (
    <Switch>
      {/* Landing page */}
      <Route path="/">
        <SimpleLayout>
          <LandingPage />
        </SimpleLayout>
      </Route>

      {/* App routes */}
      <Route path="/app/dashboard">
        <AppLayout>
          <AuthGuard requireAuth={true}>
            <Dashboard />
          </AuthGuard>
        </AppLayout>
      </Route>
      
      <Route path="/app/login">
        <SimpleLayout>
          <AuthGuard requireAuth={false} redirectTo="/app/dashboard">
            <Login />
          </AuthGuard>
        </SimpleLayout>
      </Route>
      
      <Route path="/app/register">
        <SimpleLayout>
          <AuthGuard requireAuth={false} redirectTo="/app/dashboard">
            <Register />
          </AuthGuard>
        </SimpleLayout>
      </Route>
      
      {/* Default app route redirects to dashboard */}
      <Route path="/app">
        <AppLayout>
          <AuthGuard requireAuth={true} redirectTo="/app/login">
            <Dashboard />
          </AuthGuard>
        </AppLayout>
      </Route>
      
      {/* Redirect not-found page */}
      <Route path="/not-found">
        <SimpleLayout>
          <RedirectPage />
        </SimpleLayout>
      </Route>
      
      {/* Handle shortened URLs */}
      <Route path="/r/:shortCode">
        <SimpleLayout>
          <RedirectPage />
        </SimpleLayout>
      </Route>
      
      {/* 404 page for any other routes */}
      <Route>
        <SimpleLayout>
          <NotFound />
        </SimpleLayout>
      </Route>
    </Switch>
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
