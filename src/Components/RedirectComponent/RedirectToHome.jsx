import React from "react";
import { useNavigate } from "react-router-dom";

export function RedirectToHome() {
  const navigate = useNavigate();
  React.useEffect(() => {
    // Replace with your conditional logic
    const shouldRedirect = true;
    if (shouldRedirect) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  return null; // Render nothing, as this component only redirects
}
