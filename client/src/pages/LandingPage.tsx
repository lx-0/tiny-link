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
                  onClick={() =>
                    navigate(isAuthenticated ? "/app/dashboard" : "/app/login")
                  }
                >
                  {isAuthenticated ? "Go to Dashboard" : "Sign In"}
                </Button>
                {!isAuthenticated && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-transparent border-white hover:bg-white hover:text-primary"
                    onClick={() => navigate("/app/register")}
                  >
                    Create Account
                  </Button>
                )}
              </div>
            </div>

            <div className="md:w-1/2 w-full">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Create a Short Link</CardTitle>
                  <CardDescription>
                    Paste a long URL and get a short link instantly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="url">URL</Label>
                      <Input
                        id="url"
                        placeholder="https://example.com/very/long/url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
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
              onClick={() =>
                navigate(isAuthenticated ? "/app/dashboard" : "/app/register")
              }
            >
              {isAuthenticated
                ? "Go to Dashboard"
                : "Get Started - Free Forever"}
            </Button>
            {!isAuthenticated && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/app/login")}
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
