import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs = ({ items, className = "" }: BreadcrumbsProps) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-sm ${className}`}>
      <Link 
        to="/" 
        className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={item.href} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {isLast ? (
              <span className="text-foreground font-medium">{item.label}</span>
            ) : (
              <Link 
                to={item.href}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
