import { FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-4 mt-auto border-t">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <div className="flex items-center space-x-1 text-gray-600">
          <FaGithub className="h-5 w-5" />
          <span>Created by </span>
          <a 
            href="https://github.com/lx-0" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium hover:underline text-gray-800"
          >
            @lx-0
          </a>
          <span className="mx-2">|</span>
          <a 
            href="https://github.com/lx-0/tinylink.git" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium hover:underline text-gray-800"
          >
            Repository
          </a>
        </div>
      </div>
    </footer>
  );
}