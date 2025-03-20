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
  const [location] = useLocation();
  
  // Determine if we're in the app section or not
  const isAppRoute = location.startsWith('/app');
  const isRedirectPage = location === '/not-found';
  
  // Special redirect route handling for short URLs - matched by :shortCode param
  // This will match any URL except those starting with /app/ or /api/ or specific routes
  const isShortUrlRoute = 
    !isAppRoute && 
    !location.startsWith('/api/') && 
    location !== '/' && 
    location !== '/not-found';
  
  return (
    <>
      {/* Landing page and public routes */}
      <Route path="/">
        <SimpleLayout>
          <LandingPage />
        </SimpleLayout>
      </Route>

      {/* App routes - all under /app/ */}
      <Route path="/app">
        <AppLayout>
          <Switch>
            <Route path="/app/dashboard">
              <AuthGuard requireAuth={true}>
                <Dashboard />
              </AuthGuard>
            </Route>
            
            <Route path="/app/login">
              <AuthGuard requireAuth={false} redirectTo="/app/dashboard">
                <Login />
              </AuthGuard>
            </Route>
            
            <Route path="/app/register">
              <AuthGuard requireAuth={false} redirectTo="/app/dashboard">
                <Register />
              </AuthGuard>
            </Route>
            
            {/* Default app route */}
            <Route path="/app">
              <AuthGuard requireAuth={true} redirectTo="/app/login">
                <Dashboard />
              </AuthGuard>
            </Route>
          </Switch>
        </AppLayout>
      </Route>
      
      {/* Redirect not-found page */}
      <Route path="/not-found">
        <SimpleLayout>
          <RedirectPage />
        </SimpleLayout>
      </Route>
      
      {/* Handle shortened URLs at root level */}
      {isShortUrlRoute && (
        <Route path="/:shortCode">
          <SimpleLayout>
            <RedirectPage />
          </SimpleLayout>
        </Route>
      )}
      
      {/* 404 page for any other routes */}
      {!isShortUrlRoute && location !== "/" && !isAppRoute && !isRedirectPage && (
        <Route>
          <SimpleLayout>
            <NotFound />
          </SimpleLayout>
        </Route>
      )}
    </>
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
