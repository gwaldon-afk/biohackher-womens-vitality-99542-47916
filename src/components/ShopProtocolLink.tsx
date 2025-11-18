import { Button } from "@/components/ui/button";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ShopProtocolLinkProps {
  productId?: string;
  productName?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

/**
 * Button component that links to Shop page with optional product highlighting
 * Used on assessment results pages to drive conversion from recommendations to purchases
 */
const ShopProtocolLink = ({ 
  productId, 
  productName,
  variant = "outline",
  size = "sm",
  className = ""
}: ShopProtocolLinkProps) => {
  const navigate = useNavigate();

  const handleViewInShop = () => {
    if (productId) {
      // Navigate to shop with product highlighting
      navigate(`/shop?product=${productId}&from=assessment`);
    } else if (productName) {
      // Navigate to shop with search term
      navigate(`/shop?search=${encodeURIComponent(productName)}`);
    } else {
      // Navigate to shop homepage
      navigate('/shop');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleViewInShop}
      className={`gap-2 ${className}`}
    >
      <ShoppingCart className="h-4 w-4" />
      View in Shop
      <ExternalLink className="h-3 w-3" />
    </Button>
  );
};

export default ShopProtocolLink;
