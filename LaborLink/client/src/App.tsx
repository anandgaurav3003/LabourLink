import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import WorkerDashboard from "@/pages/worker-dashboard";
import EmployerDashboard from "@/pages/employer-dashboard";
import JobDetails from "@/pages/job-details";
import WorkerProfile from "@/pages/worker-profile";
import CreateJob from "@/pages/create-job";
import FindWorkers from "@/pages/find-workers";
import FindJobs from "@/pages/find-jobs";
import Messages from "@/pages/messages";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/jobs/:id" component={JobDetails} />
      <Route path="/workers/:id" component={WorkerProfile} />
      <Route path="/find-workers" component={FindWorkers} />
      <Route path="/find-jobs" component={FindJobs} />
      
      {/* Protected Routes */}
      <ProtectedRoute path="/worker-dashboard" component={WorkerDashboard} />
      <ProtectedRoute path="/employer-dashboard" component={EmployerDashboard} />
      <ProtectedRoute path="/create-job" component={CreateJob} />
      <ProtectedRoute path="/messages" component={Messages} />
      <ProtectedRoute path="/messages/:userId" component={Messages} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
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
