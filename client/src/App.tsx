import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { SiteSettingsProvider } from "@/hooks/use-site-settings";
import { NotificationProvider } from "@/hooks/use-notifications";

// Pages
import HomePage from "@/pages/index";
import PropertiesPage from "@/pages/properties";
import PropertyPage from "@/pages/property";
import AgentsPage from "@/pages/agents";
import ContactPage from "@/pages/contact";
import PropertyCalculatorPage from "@/pages/property-calculator";

// Admin Pages
import AdminDashboardPage from "@/pages/admin/index";
import AdminPropertiesPage from "@/pages/admin/properties";
import AdminPropertyNewPage from "@/pages/admin/properties/new";
import AdminPropertyEditPage from "@/pages/admin/properties/edit";
import AdminSettingsPage from "@/pages/admin/settings";
import AdminUsersPage from "@/pages/admin/users";
import AdminLocationsPage from "@/pages/admin/locations";
import AdminAgentsPage from "@/pages/admin/agents";
import AdminAgentNewPage from "@/pages/admin/agents/new";
import AdminAgentEditPage from "@/pages/admin/agents/edit";
import AdminContactPage from "@/pages/admin/contact";
import AdminAnalyticsPage from "@/pages/admin/analytics";
import AdminInquiriesPage from "@/pages/admin/inquiries";
import AdminClientsPage from "@/pages/admin/clients";
import AdminProfilePage from "@/pages/admin/profile";
import AdminPropertyTypesPage from "@/pages/admin/property-types";
import AdminContactMessagesPage from "@/pages/admin/contact-messages";

function Router() {
  return (
    <Switch>
      {/* Public pages */}
      <Route path="/" component={HomePage} />
      <Route path="/properties" component={PropertiesPage} />
      <Route path="/property/:id" component={PropertyPage} />
      <Route path="/agents" component={AgentsPage} />
      <Route path="/property-calculator" component={PropertyCalculatorPage} />
      <Route path="/contact" component={ContactPage} />
      
      {/* Admin pages */}
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/admin/properties" component={AdminPropertiesPage} />
      <Route path="/admin/properties/new" component={AdminPropertyNewPage} />
      <Route path="/admin/properties/edit/:id" component={AdminPropertyEditPage} />
      <Route path="/admin/settings" component={AdminSettingsPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/locations" component={AdminLocationsPage} />
      <Route path="/admin/contact" component={AdminContactPage} />
      <Route path="/admin/agents" component={AdminAgentsPage} />
      <Route path="/admin/agents/new" component={AdminAgentNewPage} />
      <Route path="/admin/agents/edit/:id" component={AdminAgentEditPage} />
      <Route path="/admin/analytics" component={AdminAnalyticsPage} />
      <Route path="/admin/inquiries" component={AdminInquiriesPage} />
      <Route path="/admin/clients" component={AdminClientsPage} />
      <Route path="/admin/profile" component={AdminProfilePage} />
      <Route path="/admin/property-types" component={AdminPropertyTypesPage} />
      <Route path="/admin/contact-messages" component={AdminContactMessagesPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SiteSettingsProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </NotificationProvider>
      </SiteSettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
