import { useLocation } from "wouter";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RedirectPage from "@/pages/RedirectPage";
import LandingPage from "@/pages/LandingPage";
import About from "@/pages/About";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";

// App layout component with navbar
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-gray-50">{children}</main>
      <Footer />
    </div>
  );
}

// Simple layout without navbar
function SimpleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
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
      
      {/* Static pages */}
      <Route path="/about">
        <SimpleLayout>
          <About />
        </SimpleLayout>
      </Route>
      
      <Route path="/terms">
        <SimpleLayout>
          <Terms />
        </SimpleLayout>
      </Route>
      
      <Route path="/privacy">
        <SimpleLayout>
          <Privacy />
        </SimpleLayout>
      </Route>
      
      {/* Redirect not-found page */}
      <Route path="/not-found">
        <SimpleLayout>
          <RedirectPage />
        </SimpleLayout>
      </Route>
      
      {/* Handle shortened URLs at root level */}
      <Route path="/:shortCode">
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
