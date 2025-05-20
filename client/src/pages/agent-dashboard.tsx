import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, FileText, Users, Mail } from "lucide-react";

export default function AgentDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  
  // Redirect if not logged in as agent
  useEffect(() => {
    if (!user) {
      setLocation("/login");
    } else if (user.role !== "agent") {
      // Redirect non-agents
      if (user.isAdmin) {
        setLocation("/admin");
      } else {
        setLocation("/client-dashboard");
      }
    }
  }, [user, setLocation]);
  
  const handleLogout = () => {
    logout();
    setLocation("/login");
  };
  
  if (!user || user.role !== "agent") {
    return null; // Don't render anything while redirecting
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Agent Dashboard</h1>
        <div>
          <span className="mr-4">Welcome, {user.fullName || user.username}</span>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Home className="mr-2 h-5 w-5 text-primary" />
              My Properties
            </CardTitle>
            <CardDescription>Manage your property listings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default" className="w-full" onClick={() => setLocation("/agent/properties")}>
              View Properties
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              Inquiries
            </CardTitle>
            <CardDescription>Client inquiries about your properties</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default" className="w-full" onClick={() => setLocation("/agent/inquiries")}>
              View Inquiries
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              Clients
            </CardTitle>
            <CardDescription>Manage your client relationships</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default" className="w-full" onClick={() => setLocation("/agent/clients")}>
              View Clients
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5 text-primary" />
              Messages
            </CardTitle>
            <CardDescription>Communication with clients</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default" className="w-full" onClick={() => setLocation("/agent/messages")}>
              View Messages
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent activity on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground text-center py-6">
                No recent activity to display
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}