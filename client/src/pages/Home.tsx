import { useEffect } from "react";

/**
 * Redirect to the trust agreement customizer in public folder
 */
export default function Home() {
  useEffect(() => {
    // Redirect to the actual trust agreement app
    window.location.href = '/index.html';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">Redirecting to Trust Agreement Customizer...</p>
      </div>
    </div>
  );
}

