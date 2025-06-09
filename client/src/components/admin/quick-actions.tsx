import { Link } from "wouter";
import { 
  Building, 
  Users, 
  MessageCircle, 
  Home,
  Eye,
  FileText,
  Plus,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
  const actions = [
    {
      title: "Add Property",
      description: "List a new property",
      icon: <Building className="h-5 w-5" />,
      href: "/admin/properties/new",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Add Agent", 
      description: "Register new agent",
      icon: <Users className="h-5 w-5" />,
      href: "/admin/agents/new",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Messages Center",
      description: "All customer messages",
      icon: <MessageCircle className="h-5 w-5" />,
      href: "/admin/messages",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "All Properties",
      description: "Manage listings",
      icon: <Eye className="h-5 w-5" />,
      href: "/admin/properties",
      color: "bg-indigo-500 hover:bg-indigo-600"
    },
    {
      title: "Settings",
      description: "Site configuration",
      icon: <Settings className="h-5 w-5" />,
      href: "/admin/settings",
      color: "bg-gray-500 hover:bg-gray-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button
                variant="outline"
                className={`w-full h-20 flex flex-col items-center justify-center space-y-2 ${action.color} text-white border-none hover:scale-105 transition-all`}
              >
                {action.icon}
                <div className="text-center">
                  <div className="text-sm font-medium">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}