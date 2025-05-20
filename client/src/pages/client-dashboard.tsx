import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Search, MessageSquare, Bell } from "lucide-react";

export default function ClientDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  
  // Redirect if not logged in as client
  useEffect(() => {
    if (!user) {
      setLocation("/login");
    } else if (user.role !== "client" && !user.isAdmin) {
      // Redirect non-clients (except admins who can view everything)
      if (user.role === "agent") {
        setLocation("/agent-dashboard");
      }
    }
  }, [user, setLocation]);
  
  const handleLogout = () => {
    logout();
    setLocation("/login");
  };
  
  if (!user) {
    return null; // Don't render anything while redirecting
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Client Dashboard</h1>
        <div>
          <span className="mr-4">Welcome, {user.fullName || user.username}</span>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5 text-primary" />
              Property Search
            </CardTitle>
            <CardDescription>Find your dream property</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default" className="w-full" onClick={() => setLocation("/properties")}>
              Search Properties
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Bookmark className="mr-2 h-5 w-5 text-primary" />
              Saved Properties
            </CardTitle>
            <CardDescription>Properties you've bookmarked</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default" className="w-full" onClick={() => setLocation("/client/saved-properties")}>
              View Saved
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" />
              My Inquiries
            </CardTitle>
            <CardDescription>Your property inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default" className="w-full" onClick={() => setLocation("/client/inquiries")}>
              View Inquiries
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Property alerts and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default" className="w-full" onClick={() => setLocation("/client/notifications")}>
              View Notifications
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Featured Properties</CardTitle>
            <CardDescription>Properties that match your preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground text-center py-6">
                No featured properties to display yet. Start browsing to see recommendations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Searches</CardTitle>
            <CardDescription>Your recent property searches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground text-center py-6">
                No recent searches to display
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}