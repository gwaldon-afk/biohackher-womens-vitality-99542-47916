import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Activity, User, Settings, Crown, ChevronDown, BarChart3, TrendingUp, Target, Award, Trophy, Heart, Dumbbell, Watch, Pill, Moon, Utensils, Sparkles, Brain, Stethoscope, BookOpen, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon } from "@/components/ShoppingCart";
import { LocaleSelector } from "@/components/LocaleSelector";
import TrustBarWithSecurity from "@/components/TrustBar";
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

  // Streamlined core navigation - user journey focused
  const coreNavItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/goals-dashboard", label: "My Goals" },
    { href: "/experts", label: "Find Experts" },
    { href: "/shop", label: t('navigation.shop') },
  ];

  const assessmentItems = [
    { href: "/menomap", label: "MenoMap™", icon: Heart, description: "Track menopause journey" },
    { href: "/energy-loop", label: "Energy Loop", icon: Sparkles, description: "Optimize daily energy" },
    { href: "/symptoms", label: "Symptom Tracker", icon: Activity, description: "Log and analyze symptoms" },
    { href: "/lis-assessment", label: "Longevity Score", icon: TrendingUp, description: "Assess your health age" },
  ];

  const resourceItems = [
    { href: "/about", label: "About", icon: BookOpen },
    { href: "/research-evidence", label: "Science & Research", icon: Brain },
    { href: "/faq", label: "FAQ", icon: MessageCircle },
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
            {coreNavItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "text-primary bg-accent"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            
            {/* Assessments Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9 text-sm font-medium text-muted-foreground hover:text-primary">
                    <Stethoscope className="h-4 w-4 mr-1" />
                    Assessments
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      {assessmentItems.map((item) => (
                        <li key={item.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.href}
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                isActive(item.href) && "bg-accent"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <item.icon className="h-4 w-4 text-primary" />
                                <div className="text-sm font-medium leading-none">{item.label}</div>
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {item.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Resources Dropdown */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9 text-sm font-medium text-muted-foreground hover:text-primary">
                    <BookOpen className="h-4 w-4 mr-1" />
                    Resources
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-2 p-3">
                      {resourceItems.map((item) => (
                        <li key={item.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={item.href}
                              className={cn(
                                "flex items-center gap-2 select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                isActive(item.href) && "bg-accent"
                              )}
                            >
                              <item.icon className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
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
                  <Link to="/settings" className="flex items-center cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs text-muted-foreground">Quick Access</div>
                <DropdownMenuItem asChild>
                  <Link to="/health-assistant" className="flex items-center cursor-pointer text-xs">
                    <MessageCircle className="h-3 w-3 mr-2" />
                    AI Health Assistant
                  </Link>
                </DropdownMenuItem>
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
                  <Link to="/admin/experts" className="flex items-center cursor-pointer text-xs">
                    <Settings className="h-3 w-3 mr-2" />
                    Admin: Verify Experts
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
              {coreNavItems.map((item) => (
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

              {/* Assessments Group */}
              <Collapsible className="px-4">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground py-2">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Assessments
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col space-y-1 pl-6 pt-2">
                  {assessmentItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="text-sm text-muted-foreground hover:text-primary py-1.5"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Resources Group */}
              <Collapsible className="px-4">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground py-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Resources
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col space-y-1 pl-6 pt-2">
                  {resourceItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="text-sm text-muted-foreground hover:text-primary py-1.5"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
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
      <TrustBarWithSecurity />
    </>
  );
};

export default Navigation;