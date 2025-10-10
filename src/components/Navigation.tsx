import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Activity, User, Settings, Crown, ChevronDown, BarChart3, TrendingUp, Target, Award, Trophy, Heart, Dumbbell, Watch, Pill, Moon, Utensils, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon } from "@/components/ShoppingCart";
import { LocaleSelector } from "@/components/LocaleSelector";
import TrustBar from "@/components/TrustBar";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
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

  const simpleNavItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/pillars", label: "Pillars" },
    { href: "/symptoms", label: "Assessments" },
  ];

  const myJourneyItems = [
    { href: "/dashboard", label: t('navigation.dashboard'), icon: BarChart3 },
    { href: "/analytics", label: "Analytics", icon: TrendingUp },
    { href: "/symptom-trends", label: "Symptom Trends", icon: Heart },
    { href: "/achievements", label: "Achievements", icon: Award },
    { href: "/progress", label: "Progress Tracking", icon: Target },
    { href: "/reports", label: "Reports", icon: Trophy },
  ];

  const toolkitItems = [
    { href: "/biohacking-toolkit", label: "Biohacking Tools", icon: Sparkles },
    { href: "/wearables", label: "Wearables", icon: Watch },
    { href: "/supplements", label: "Supplements", icon: Pill },
    { href: "/therapies", label: "Therapies", icon: Dumbbell },
    { href: "/sleep", label: "Sleep", icon: Moon },
    { href: "/nutrition", label: "Nutrition", icon: Utensils },
  ];

  const [myJourneyOpen, setMyJourneyOpen] = useState(false);
  const [toolkitOpen, setToolkitOpen] = useState(false);

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
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {simpleNavItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link to={item.href}>
                    <NavigationMenuLink
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                        isActive(item.href)
                          ? "text-primary bg-accent/50"
                          : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}

              {/* My Journey Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-muted-foreground hover:text-primary">
                  My Journey
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 bg-popover border border-border shadow-lg z-50">
                    {myJourneyItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.href}>
                          <Link to={item.href}>
                            <NavigationMenuLink
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                isActive(item.href) && "bg-accent/50 text-primary"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <div className="text-sm font-medium leading-none">{item.label}</div>
                              </div>
                            </NavigationMenuLink>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Toolkit Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-muted-foreground hover:text-primary">
                  Toolkit
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 bg-popover border border-border shadow-lg z-50">
                    {toolkitItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.href}>
                          <Link to={item.href}>
                            <NavigationMenuLink
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                isActive(item.href) && "bg-accent/50 text-primary"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <div className="text-sm font-medium leading-none">{item.label}</div>
                              </div>
                            </NavigationMenuLink>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/shop">
                  <NavigationMenuLink
                    className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
                      isActive("/shop")
                        ? "text-primary bg-accent/50"
                        : "text-muted-foreground"
                    )}
                  >
                    Shop
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/faq">
                  <NavigationMenuLink
                    className={cn(
                      "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
                      isActive("/faq")
                        ? "text-primary bg-accent/50"
                        : "text-muted-foreground"
                    )}
                  >
                    FAQ
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

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
              <DropdownMenuContent align="end" className="w-48 bg-popover border border-border shadow-lg z-50">
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Profile
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
              {simpleNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary px-4 py-2 rounded-md",
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* My Journey Collapsible */}
              <Collapsible open={myJourneyOpen} onOpenChange={setMyJourneyOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  My Journey
                  <ChevronDown className={cn("h-4 w-4 transition-transform", myJourneyOpen && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4">
                  {myJourneyItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-2 text-sm transition-colors hover:text-primary px-4 py-2 rounded-md",
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

              {/* Toolkit Collapsible */}
              <Collapsible open={toolkitOpen} onOpenChange={setToolkitOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Toolkit
                  <ChevronDown className={cn("h-4 w-4 transition-transform", toolkitOpen && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4">
                  {toolkitItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-2 text-sm transition-colors hover:text-primary px-4 py-2 rounded-md",
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

              <Link
                to="/shop"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary px-4 py-2 rounded-md",
                  isActive("/shop")
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                Shop
              </Link>

              <Link
                to="/faq"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary px-4 py-2 rounded-md",
                  isActive("/faq")
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </Link>

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
                <Link to="/settings" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </div>
            </div>
          </div>
        )}
        </div>
      </nav>
      <TrustBar />
    </>
  );
};

export default Navigation;