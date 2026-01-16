import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface RedirectToAboutProps {
  tab: string;
}

export const RedirectToAbout = ({ tab }: RedirectToAboutProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/about?tab=${tab}`, { replace: true });
  }, [navigate, tab]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
};
