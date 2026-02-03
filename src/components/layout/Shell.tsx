import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { getRouteMeta } from "@/navigation/routeMeta";

function hasAppHistory() {
  // React Router sets a numeric `idx` in history.state for SPA navigation.
  // If the user landed directly, idx is usually 0 or undefined.
  const idx = (window.history.state as any)?.idx;
  return typeof idx === "number" && idx > 0;
}

function FlowHeader({ title, parentRoute }: { title: string; parentRoute?: string }) {
  const navigate = useNavigate();
  const onBack = () => {
    if (hasAppHistory()) navigate(-1);
    else navigate(parentRoute || "/");
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-3">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 truncate text-sm font-medium">{title}</div>
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} aria-label="Home">
          <Home className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

export function Shell() {
  const location = useLocation();
  const meta = getRouteMeta(location);

  if (meta.shell === "admin") {
    return <Outlet />;
  }

  if (meta.shell === "none") {
    // Marketing/static pages: keep top navigation, but no bottom nav.
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <Outlet />
      </div>
    );
  }

  if (meta.shell === "flow") {
    return (
      <div className="min-h-screen bg-background">
        <FlowHeader title={meta.title} parentRoute={meta.parentRoute} />
        <div className="mx-auto max-w-5xl px-0 pb-8">
          <Outlet />
        </div>
      </div>
    );
  }

  // App shell: existing top navigation + always-on bottom nav (mobile).
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      <Outlet />
      <MobileBottomNav />
    </div>
  );
}

