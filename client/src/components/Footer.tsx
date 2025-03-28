import { FaGithub } from "react-icons/fa";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="bg-gray-100 py-6 mt-auto border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Links */}
          <div className="flex space-x-6 mb-4 md:mb-0">
            <Link href="/about">
              <span
                className="text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                onClick={() => window.scrollTo(0, 0)}
              >
                About
              </span>
            </Link>
            <Link href="/terms">
              <span
                className="text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                onClick={() => window.scrollTo(0, 0)}
              >
                Terms
              </span>
            </Link>
            <Link href="/privacy">
              <span
                className="text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                onClick={() => window.scrollTo(0, 0)}
              >
                Privacy
              </span>
            </Link>
            <Link href={isAuthenticated ? "/app/dashboard" : "/app/login"}>
              <span
                className="text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                onClick={() => window.scrollTo(0, 0)}
              >
                Dashboard
              </span>
            </Link>
          </div>

          {/* Social & Creator */}
          <div className="flex items-center space-x-4 text-gray-600">
            <a
              href="https://github.com/lx-0/tiny-link.git"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-gray-800 transition-colors"
              aria-label="GitHub Repository"
            >
              <FaGithub className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} TinyLink - An open-source URL
          shortener.
        </div>
      </div>
    </footer>
  );
}
