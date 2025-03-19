import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RedirectPage from "@/pages/RedirectPage";

function Router() {
  return (
    <Switch>
      <Route path="/app" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/not-found" component={RedirectPage} />
      <Route path="/r/:shortCode" component={RedirectPage} />
      {/* Handle shortcodes directly at root path - but exclude paths that start with known routes */}
      <Route path="/:shortCode">
        {(params) => {
          const { shortCode } = params;
          // Skip routing to shortcode handler if it matches a known route
          if (['app', 'login', 'register', 'not-found', 'r', 'api'].includes(shortCode)) {
            return <NotFound />;
          }
          return <RedirectPage />;
        }}
      </Route>
      <Route path="/">
        {() => {
          // Redirect root to /app
          window.location.href = "/app";
          return null;
        }}
      </Route>
      <Route component={NotFound} />
    </Switch>
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
