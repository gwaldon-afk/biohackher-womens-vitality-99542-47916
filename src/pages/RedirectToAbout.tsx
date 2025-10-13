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

  return null;
};
