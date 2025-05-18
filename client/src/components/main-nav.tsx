import * as React from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/auth-buttons";

export function MainNav({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
    >
      <Link href="/">
        <Button variant="link" className="text-lg font-semibold">
          Home
        </Button>
      </Link>
      <Link href="/properties">
        <Button variant="link" className="text-lg font-semibold">
          Properties
        </Button>
      </Link>
      <Link href="/mdp-properties">
        <Button variant="link" className="text-lg font-semibold">
          MDP Properties
        </Button>
      </Link>
      <Link href="/agents">
        <Button variant="link" className="text-lg font-semibold">
          Agents
        </Button>
      </Link>
      <Link href="/contact">
        <Button variant="link" className="text-lg font-semibold">
          Contact
        </Button>
      </Link>
      <div className="ml-auto flex items-center">
        <LoginButton />
      </div>
    </nav>
  );
}