import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Activity, User, Settings, Crown, ChevronDown, BarChart3, TrendingUp, Target, Award, Trophy, Heart, Dumbbell, Watch, Pill, Moon, Utensils, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCartIcon } from "@/components/ShoppingCart";
import { LocaleSelector } from "@/components/LocaleSelector";
import TrustBarWithSecurity from "@/components/TrustBar";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useProtocolRecommendations } from "@/hooks/useProtocolRecommendations";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const { pendingCount } = useProtocolRecommendations({ status: 'pending' });

  // Core navigation - streamlined with Nutrition promoted
  const coreNavItems = [
    { href: "/nutrition", label: "Nutrition" },
    { href: "/experts", label: "Find Experts" },
    { href: "/shop", label: t('navigation.shop') },
  ];

  // My Plans dropdown items
  const myPlansItems = [
    { href: "/today", label: "Today", icon: Activity },
    { href: "/plans/90-day", label: "90-Day Plan", icon: TrendingUp },
    { href: "/nutrition/meal-plan", label: "7-Day Meal Plan", icon: Utensils },
  ];

  // Wellness Tools dropdown items
  const wellnessToolsItems = [
    { href: "/protocol-library", label: "Protocol Library", icon: Target },
    { href: "/pillars", label: "Symptom Tracking", icon: BarChart3 },
    { href: "/health-assistant", label: "Health Assistant", icon: Sparkles },
    { href: "/lis-results", label: "My LIS Results", icon: Activity },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <span className="text-xl font-albra font-bold">
                <span className="text-foreground">Biohack</span>
                <span className="text-primary italic">her</span>
                <sup className="text-xs font-normal ml-1">®</sup>
              </span>
              <span className="text-xs text-muted-foreground -mt-1 font-light tracking-wider">LIVE WELL LONGER</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* My Plans dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  My Plans <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-popover border border-border shadow-lg z-50">
                {myPlansItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link 
                        to={item.href} 
                        className={cn(
                          "cursor-pointer flex items-center gap-2",
                          isActive(item.href) && "text-primary bg-accent"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {coreNavItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-sm font-medium transition-colors relative",
                    isActive(item.href)
                      ? "text-primary bg-accent"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            
            {/* Wellness Tools dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium text-muted-foreground hover:text-primary"
                >
                  Wellness Tools <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-lg z-50">
                {wellnessToolsItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link 
                        to={item.href} 
                        className={cn(
                          "cursor-pointer flex items-center gap-2",
                          isActive(item.href) && "text-primary bg-accent"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            <LocaleSelector />
            <ShoppingCartIcon />
            <Link to="/upgrade">
              <Button variant="outline" size="sm" className="border-primary/30 hover:bg-primary/10">
                <Crown className="h-4 w-4 mr-1 text-primary" />
                {t('navigation.upgrade')}
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <User className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-lg z-50">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs text-muted-foreground">Quick Access</div>
                <DropdownMenuItem asChild>
                  <Link to="/achievements" className="flex items-center cursor-pointer text-xs">
                    <Award className="h-3 w-3 mr-2" />
                    Achievements
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/biohacking-toolkit" className="flex items-center cursor-pointer text-xs">
                    <Sparkles className="h-3 w-3 mr-2" />
                    Toolkit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/about" className="flex items-center cursor-pointer text-xs">
                    <Heart className="h-3 w-3 mr-2" />
                    About & Science
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs text-muted-foreground">Expert Partners</div>
                <DropdownMenuItem asChild>
                  <Link to="/experts" className="flex items-center cursor-pointer text-xs">
                    <User className="h-3 w-3 mr-2" />
                    Find Experts
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/expert/register" className="flex items-center cursor-pointer text-xs">
                    <Crown className="h-3 w-3 mr-2" />
                    Become an Expert
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin" className="flex items-center cursor-pointer text-xs">
                    <Settings className="h-3 w-3 mr-2 text-destructive" />
                    <span className="text-destructive font-semibold">Admin Panel</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile actions */}
          <div className="lg:hidden flex items-center space-x-2">
            <ShoppingCartIcon />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border bg-background">
            <div className="flex flex-col space-y-2">
              {/* My Plans - Mobile */}
              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-primary px-4 py-2 rounded-md">
                  My Plans <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4">
                  {myPlansItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "text-sm font-medium transition-colors hover:text-primary px-4 py-2 rounded-md flex items-center gap-2",
                          isActive(item.href)
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>

              {coreNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary px-4 py-2 rounded-md flex items-center justify-between",
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Wellness Tools - Mobile */}
              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-primary px-4 py-2 rounded-md">
                  Wellness Tools <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4">
                  {wellnessToolsItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "text-sm font-medium transition-colors hover:text-primary px-4 py-2 rounded-md flex items-center gap-2",
                          isActive(item.href)
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>

              <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-border">
                <div className="px-2">
                  <LocaleSelector />
                </div>
                <Link to="/upgrade" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full border-primary/30">
                    <Crown className="h-4 w-4 mr-2 text-primary" />
                    Upgrade to Premium
                  </Button>
                </Link>
                <Link to="/profile" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </Button>
                </Link>
                <Link to="/settings" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
        </div>
      </nav>
      <TrustBarWithSecurity />
    </>
  );
};

export default Navigation;