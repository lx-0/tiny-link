import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nanoid } from "nanoid";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { FaGithub } from "react-icons/fa";

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleQuickCreate = async () => {
    if (!url) {
      toast({
        title: "URL is required",
        description: "Please enter a URL to shorten",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    let originalUrl = url;
    if (
      !originalUrl.startsWith("http://") &&
      !originalUrl.startsWith("https://")
    ) {
      originalUrl = `https://${originalUrl}`;
    }

    setIsCreating(true);

    try {
      if (!isAuthenticated) {
        // Create a temporary session or require login
        navigate(
          "/app/login?redirect=/?url=" + encodeURIComponent(originalUrl),
        );
        return;
      }

      // Generate a random short code
      const shortCode = nanoid(7);

      // Create the URL
      const response = await apiRequest("POST", "/api/urls", {
        originalUrl,
        shortCode,
      });

      if (response) {
        // Show success message
        toast({
          title: "URL shortened!",
          description: "Your URL has been shortened successfully.",
        });

        // Reset form
        setUrl("");

        // Copy to clipboard
        const baseUrl = window.location.origin;
        const fullUrl = `${baseUrl}/${shortCode}`;
        navigator.clipboard.writeText(fullUrl);

        // Show copied message
        toast({
          title: "Copied to clipboard",
          description: fullUrl,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to shorten URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero section */}
      <div className="bg-primary text-white py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                🔐 TinyLink
              </h1>
              <p className="text-xl md:text-2xl mb-8">
                Your private, self-hosted URL shortener with full data ownership
                and no tracking.
              </p>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => {
                    window.scrollTo(0, 0);
                    navigate(isAuthenticated ? "/app/dashboard" : "/app/login");
                  }}
                >
                  {isAuthenticated ? "Go to Dashboard" : "Sign In"}
                </Button>
                {!isAuthenticated && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-white hover:bg-white hover:text-primary"
                    onClick={() => {
                      window.scrollTo(0, 0);
                      navigate("/app/register");
                    }}
                  >
                    Create Account
                  </Button>
                )}
              </div>
              
              <div className="flex mt-4 text-sm space-x-4">
                <span 
                  className="text-white/80 hover:text-white cursor-pointer transition-colors"
                  onClick={() => {
                    window.scrollTo(0, 0);
                    navigate("/about");
                  }}
                >
                  About
                </span>
                <span 
                  className="text-white/80 hover:text-white cursor-pointer transition-colors"
                  onClick={() => {
                    window.scrollTo(0, 0);
                    navigate("/privacy");
                  }}
                >
                  Privacy
                </span>
                <span 
                  className="text-white/80 hover:text-white cursor-pointer transition-colors"
                  onClick={() => {
                    window.scrollTo(0, 0);
                    navigate("/terms");
                  }}
                >
                  Terms
                </span>
              </div>
            </div>

            <div className="md:w-1/2 w-full">
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gray-50 border-b pb-3">
                  <CardTitle className="flex items-center text-xl">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.5 12C13.5 15.18 10.93 17.75 7.75 17.75C4.57 17.75 2 15.18 2 12C2 8.82 4.57 6.25 7.75 6.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 12C10 8.69 12.69 6 16 6C19.31 6 22 8.69 22 12C22 15.31 19.31 18 16 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Your Long URL
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <Input
                        id="url"
                        className="text-sm font-mono border-2 py-5 focus-visible:ring-primary"
                        placeholder="https://example.com/very/long/url/that/needs/shortening"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 7V9H13V7H11ZM11 11V17H13V11H11ZM4 12C4 16.41 7.59 20 12 20C16.41 20 20 16.41 20 12C20 7.59 16.41 4 12 4C7.59 4 4 7.59 4 12Z" fill="currentColor"/>
                      </svg>
                      <span>Enter your link above — HTTPS is added automatically</span>
                    </div>
                  </div>
                </CardContent>

                <CardHeader className="bg-gray-50 border-t border-b py-3 mt-2">
                  <CardTitle className="flex items-center text-xl">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.5 10C8.5 6.82 11.07 4.25 14.25 4.25C17.43 4.25 20 6.82 20 10C20 13.18 17.43 15.75 14.25 15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 10C12 13.31 9.31 16 6 16C2.69 16 0 13.31 0 10C0 6.69 2.69 4 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    TinyLink
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col space-y-4 pt-4">
                  <div className="flex space-x-2">
                    <Button
                      className="flex-1 py-6"
                      onClick={handleQuickCreate}
                      disabled={isCreating || !url}
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Shorten URL"
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="py-5 text-xs" 
                      onClick={() => {
                        window.scrollTo(0, 0);
                        navigate(isAuthenticated ? "/app/dashboard" : "/app/login");
                      }}
                    >
                      {isAuthenticated ? "My Links" : "Sign In"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="py-5 text-xs"
                      onClick={() => {
                        window.scrollTo(0, 0);
                        navigate(isAuthenticated ? "/app/dashboard" : "/app/register");
                      }}
                    >
                      {isAuthenticated ? "Create New" : "Create Account"}
                    </Button>
                  </div>
                </CardContent>

                <CardFooter className="bg-gray-50 mt-2 text-xs text-gray-500 flex justify-center border-t pt-3">
                  <div className="flex space-x-3">
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Custom codes with account
                    </span>
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12H15M7 8H17M11 16H13M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Free tracking analytics
                    </span>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>🔒 Privacy First</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Self-hosted solution that gives you complete data ownership
                  with no third-party tracking or data mining.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📊 Click Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Track link performance with detailed statistics while keeping
                  all analytics data on your own servers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>✨ Custom Branding</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Use your own domain and branding to build trust with
                  recipients instead of generic third-party links.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>🛡️ Enhanced Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Transparent, open-source code with no hidden tracking
                  mechanisms and full control over security settings.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📱 QR Code Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Generate QR codes for your links to easily share in printed
                  materials or display on marketing materials.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🌐 100% Open Source</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Fully open-source with MIT license - customize it to suit your
                  needs with no vendor lock-in or subscriptions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Take back control of your data
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            TinyLink is 100% open source with MIT license - self-host it on your
            own infrastructure to ensure complete data ownership, enhance
            security, and escape vendor lock-in forever.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => {
                window.scrollTo(0, 0);
                navigate(isAuthenticated ? "/app/dashboard" : "/app/register");
              }}
            >
              {isAuthenticated
                ? "Go to Dashboard"
                : "Get Started - Free Forever"}
            </Button>
            {!isAuthenticated && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  window.scrollTo(0, 0);
                  navigate("/app/login");
                }}
              >
                Log In
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() =>
                window.open("https://github.com/lx-0/tiny-link.git", "_blank")
              }
            >
              <FaGithub className="mr-2 h-4 w-4" />
              View on GitHub
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
