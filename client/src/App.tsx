import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { SiteSettingsProvider } from "@/hooks/use-site-settings";
import { ProtectedAdminRoute } from "@/components/admin/protected-admin-route";
import { ProtectedAgentRoute } from "@/components/auth/protected-agent-route";
import { ProtectedClientRoute } from "@/components/auth/protected-client-route";
import { AdminSignoutTracker } from "@/components/admin/admin-signout";

// Public Pages
import HomePage from "@/pages/index";
import PropertiesPage from "@/pages/properties";
import PropertyPage from "@/pages/property";
import AgentsPage from "@/pages/agents";
import ContactPage from "@/pages/contact";
import PropertyCalculatorPage from "@/pages/property-calculator";
import HomeLoanPage from "@/pages/home-loan";
import LoginPage from "@/pages/login";
import MDPPropertiesPage from "@/pages/mdp-properties-page";
import DirectAdminAccess from "@/pages/direct-admin-access";
import { AgentProfile } from "@/pages/agent-profile";

// Agent Pages
import AgentDashboardPage from "@/pages/agent-dashboard";
import AgentPropertiesPage from "@/pages/agent/properties";

// Client Pages
import ClientDashboardPage from "@/pages/client-dashboard";
import ClientDashboardHomePage from "@/pages/client/dashboard";

// Admin Pages
import AdminDashboardPage from "@/pages/admin/index";
import AdminPropertiesPage from "@/pages/admin/properties";
import AdminPropertyNewPage from "@/pages/admin/properties/new";
import AdminPropertyEditPage from "@/pages/admin/property-edit";
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
import AdminHomeLoanInquiriesPage from "@/pages/admin/home-loan-inquiries";
import AdminHomepageImagesPage from "@/pages/admin/homepage-images";
import MessageDashboardPage from "@/pages/admin/message-dashboard";
import ClientManagementPage from "@/pages/admin/client-management";

function Router() {
  return (
    <Switch>
      {/* Public pages */}
      <Route path="/" component={HomePage} />
      <Route path="/properties" component={PropertiesPage} />
      <Route path="/property/:id" component={PropertyPage} />
      <Route path="/mdp-properties" component={MDPPropertiesPage} />
      <Route path="/agents" component={AgentsPage} />
      <Route path="/agent/:id" component={AgentProfile} />
      <Route path="/property-calculator" component={PropertyCalculatorPage} />
      <Route path="/home-loan" component={HomeLoanPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/admin-access" component={DirectAdminAccess} />
      
      {/* Agent pages - protected with agent-specific auth */}
      <Route path="/agent-dashboard" component={AgentDashboardPage} />
      <Route path="/agent/properties" component={AgentPropertiesPage} />
      
      {/* Client pages - protected with client-specific auth */}
      <Route path="/client-dashboard" component={ClientDashboardPage} />
      <Route path="/client/dashboard" component={ClientDashboardHomePage} />
      
      {/* Admin pages - protected with admin-specific auth */}
      <Route path="/admin">
        <ProtectedAdminRoute component={AdminDashboardPage} />
      </Route>
      <Route path="/admin/properties">
        <ProtectedAdminRoute component={AdminPropertiesPage} />
      </Route>
      <Route path="/admin/properties/new">
        <ProtectedAdminRoute component={AdminPropertyNewPage} />
      </Route>
      <Route path="/admin/properties/edit/:id">
        <ProtectedAdminRoute component={AdminPropertyEditPage} />
      </Route>
      <Route path="/admin/settings">
        <ProtectedAdminRoute component={AdminSettingsPage} />
      </Route>
      <Route path="/admin/users">
        <ProtectedAdminRoute component={AdminUsersPage} />
      </Route>
      <Route path="/admin/locations">
        <ProtectedAdminRoute component={AdminLocationsPage} />
      </Route>
      <Route path="/admin/contact">
        <ProtectedAdminRoute component={AdminContactPage} />
      </Route>
      <Route path="/admin/agents">
        <ProtectedAdminRoute component={AdminAgentsPage} />
      </Route>
      <Route path="/admin/agents/new">
        <ProtectedAdminRoute component={AdminAgentNewPage} />
      </Route>
      <Route path="/admin/agents/edit/:id">
        <ProtectedAdminRoute component={AdminAgentEditPage} />
      </Route>
      <Route path="/admin/analytics">
        <ProtectedAdminRoute component={AdminAnalyticsPage} />
      </Route>
      <Route path="/admin/inquiries">
        <ProtectedAdminRoute component={AdminInquiriesPage} />
      </Route>
      <Route path="/admin/clients">
        <ProtectedAdminRoute component={AdminClientsPage} />
      </Route>
      <Route path="/admin/profile">
        <ProtectedAdminRoute component={AdminProfilePage} />
      </Route>
      <Route path="/admin/property-types">
        <ProtectedAdminRoute component={AdminPropertyTypesPage} />
      </Route>
      <Route path="/admin/contact-messages">
        <ProtectedAdminRoute component={AdminContactMessagesPage} />
      </Route>
      <Route path="/admin/home-loan-inquiries">
        <ProtectedAdminRoute component={AdminHomeLoanInquiriesPage} />
      </Route>
      <Route path="/admin/message-dashboard">
        <ProtectedAdminRoute component={MessageDashboardPage} />
      </Route>
      <Route path="/admin/client-management">
        <ProtectedAdminRoute component={ClientManagementPage} />
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SiteSettingsProvider>
        <TooltipProvider>
          <Toaster />
          <AdminSignoutTracker />
          <Router />
        </TooltipProvider>
      </SiteSettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
