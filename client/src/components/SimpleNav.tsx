import { Home } from "lucide-react";
import NormalizedLink from "./ui/normalized-link";

export default function SimpleNav() {
  return (
    <div className="bg-white py-4 shadow-sm">
      <div className="container mx-auto px-4 flex items-center">
        <NormalizedLink href="/" className="flex items-center text-primary hover:text-primary/80 transition-colors">
          <Home className="w-5 h-5 mr-2" />
          <span className="font-medium">Back to Home</span>
        </NormalizedLink>
      </div>
    </div>
  );
}