import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import HomePage from "@/pages/index";
import PropertiesPage from "@/pages/properties";
import PropertyPage from "@/pages/property";
import AgentsPage from "@/pages/agents";

// Admin Pages
import AdminDashboardPage from "@/pages/admin/index";
import AdminPropertiesPage from "@/pages/admin/properties";
import AdminPropertyNewPage from "@/pages/admin/properties/new";
import AdminPropertyEditPage from "@/pages/admin/properties/edit";
import AdminSettingsPage from "@/pages/admin/settings";
import AdminUsersPage from "@/pages/admin/users";

function Router() {
  return (
    <Switch>
      {/* Public pages */}
      <Route path="/" component={HomePage} />
      <Route path="/properties" component={PropertiesPage} />
      <Route path="/property/:id" component={PropertyPage} />
      <Route path="/agents" component={AgentsPage} />
      
      {/* Admin pages */}
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/admin/properties" component={AdminPropertiesPage} />
      <Route path="/admin/properties/new" component={AdminPropertyNewPage} />
      <Route path="/admin/properties/edit/:id" component={AdminPropertyEditPage} />
      <Route path="/admin/settings" component={AdminSettingsPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
