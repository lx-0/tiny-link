import { useState, useRef } from "react";
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
import { 
  Loader2, 
  ChevronDown, 
  LogOut, 
  Settings, 
  User as UserIcon, 
  Copy, 
  Share2, 
  QrCode,
  ArrowRight,
  RefreshCw,
  Download,
  Pencil
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import NormalizedLink from "@/components/ui/normalized-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useClipboard } from "@/hooks/useClipboard";
import QRCode from 'qrcode';

export default function LandingPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { copy } = useClipboard();
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [shortUrl, setShortUrl] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [shortCodeError, setShortCodeError] = useState("");
  const [customShortCodeError, setCustomShortCodeError] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [showQrCode, setShowQrCode] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [shortCode, setShortCode] = useState("");
  const [customShortCode, setCustomShortCode] = useState("");
  const [baseUrl, setBaseUrl] = useState(window.location.origin);
  const [urlId, setUrlId] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Handle sign out
  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  // Generate QR code for the shortened URL
  const generateQRCode = async (url: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000',
          light: '#fff'
        }
      });
      setQrCodeDataUrl(dataUrl);
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
  };

  // Reset the URL form and hide results
  const handleReset = () => {
    setUrl("");
    setShortUrl("");
    setShowResult(false);
    setQrCodeDataUrl("");
  };

  // Share the shortened URL
  const handleShare = async () => {
    if (navigator.share && shortUrl) {
      try {
        await navigator.share({
          title: 'Check out this link',
          text: 'I shortened this URL with TinyLink',
          url: shortUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to copy to clipboard
        handleCopy();
      }
    } else {
      // Fallback to copy to clipboard
      handleCopy();
    }
  };

  // Copy the shortened URL to clipboard
  const handleCopy = () => {
    const fullUrl = `${baseUrl}/${shortCode}`;
    copy(fullUrl);
    toast({
      title: "Copied to clipboard",
      description: fullUrl,
    });
  };

  // Handle updating an existing shortcode
  const handleUpdateShortcode = async () => {
    // Clear previous errors
    setShortCodeError("");
    
    if (!shortCode) {
      setShortCodeError("Shortcode is required");
      return;
    }
    
    if (shortCode.length < 5) {
      setShortCodeError("Shortcodes must be at least 5 characters long");
      return;
    }

    setIsUpdating(true);

    try {
      // Update the URL with the new shortcode
      const response = await apiRequest("PATCH", `/api/urls/${urlId}`, {
        shortCode,
      });

      if (response) {
        // Update the full URL with the new shortcode
        const fullUrl = `${baseUrl}/${shortCode}`;
        setShortUrl(fullUrl);
        
        // Generate new QR code
        await generateQRCode(fullUrl);
        
        // Show success message
        toast({
          title: "Shortcode updated!",
          description: "Your custom shortcode has been updated successfully.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update shortcode. This shortcode may already be in use.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Download QR code as PNG
  const handleDownloadQr = () => {
    if (!qrCodeDataUrl) return;
    
    const a = document.createElement('a');
    a.href = qrCodeDataUrl;
    a.download = `tinylink-${shortCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleQuickCreate = async () => {
    // Clear previous errors
    setCustomShortCodeError("");
    
    // Clear previous errors
    setUrlError("");
    
    if (!url) {
      setUrlError("URL is required");
      return;
    }

    // Hide any previous results
    setShowResult(false);
    setShowQrCode(false);

    // Basic URL validation
    let originalUrl = url;
    if (
      !originalUrl.startsWith("http://") &&
      !originalUrl.startsWith("https://")
    ) {
      originalUrl = `https://${originalUrl}`;
    }
    
    // Validate if URL has a valid domain with TLD
    try {
      const urlObj = new URL(originalUrl);
      const hostnameParts = urlObj.hostname.split('.');
      
      // Check if there's at least a domain and a TLD (minimum 2 parts)
      if (hostnameParts.length < 2) {
        setUrlError("Please enter a valid URL with a domain and TLD (e.g., example.com)");
        return;
      }
      
      // Check if TLD is not empty
      if (hostnameParts[hostnameParts.length - 1].length === 0) {
        setUrlError("Please enter a valid URL with a proper TLD (e.g., .com, .org)");
        return;
      }
    } catch (e) {
      setUrlError("Please enter a valid URL");
      return;
    }

    // Validate custom shortcode if provided
    if (isAuthenticated && customShortCode && customShortCode.length < 5) {
      setCustomShortCodeError("Shortcodes must be at least 5 characters long");
      return;
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

      // Use custom shortcode if provided and valid, otherwise generate a random one
      let shortCodeToUse = "";
      
      if (isAuthenticated && customShortCode) {
        shortCodeToUse = customShortCode;
      } else {
        // Ensure random code is at least 5 characters
        shortCodeToUse = nanoid(7); // Default is 7 which is > 5
      }
      
      setShortCode(shortCodeToUse);

      // Create the URL
      const response = await apiRequest("POST", "/api/urls", {
        originalUrl,
        shortCode: shortCodeToUse,
      });

      if (response) {
        // Create the full URL
        const origin = window.location.origin;
        setBaseUrl(origin);
        const fullUrl = `${origin}/${shortCodeToUse}`;
        
        // Update state with the new short URL
        setShortUrl(fullUrl);
        
        // Generate QR code in background, don't show it yet
        await generateQRCode(fullUrl);
        
        // Show result view
        setShowResult(true);
        
        // Show success message
        toast({
          title: "URL shortened!",
          description: "Your URL has been shortened successfully.",
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

  // QR Code modal
  const renderQrCodeModal = () => {
    return (
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code for your shortened URL</DialogTitle>
            <DialogDescription>
              Scan this QR code to access your link, or download it to use elsewhere.
            </DialogDescription>
          </DialogHeader>
          
          {qrCodeDataUrl && (
            <div className="flex flex-col items-center justify-center p-4">
              <div className="bg-white p-4 rounded-lg border shadow-sm mb-4">
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code" 
                  className="w-64 h-64" 
                />
              </div>
              <div className="text-sm text-gray-500 mb-4 text-center">
                <p>This QR code links to: <span className="font-mono">{`${baseUrl}/${shortCode}`}</span></p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex gap-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={handleDownloadQr}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PNG
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowQrModal(false)}
              className="flex-1"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  const mainContent = (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V8.5M13.5 3L19 8.5M13.5 3V7C13.5 7.82843 14.1716 8.5 15 8.5H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 17H15M9 13H15M9 9H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="ml-2 text-xl font-bold text-gray-900">TinyLink</span>
              </div>
            </div>
            
            {user ? (
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                        {user.email?.split('@')[0] || 'User'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/app/dashboard")}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="text-gray-700" asChild
                  onClick={() => {
                    window.scrollTo(0, 0);
                    navigate("/app/login");
                  }}
                >
                  <span>Log in</span>
                </Button>
                <Button className="bg-primary text-white hover:bg-primary/90"
                  onClick={() => {
                    window.scrollTo(0, 0);
                    navigate("/app/register");
                  }}
                >
                  <span>Sign up</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

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
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (url) handleQuickCreate();
                  }} className="space-y-4">
                    <div>
                      <Input
                        id="url"
                        className="text-sm font-mono border-2 py-5 focus-visible:ring-primary"
                        placeholder="https://example.com/very/long/url/that/needs/shortening"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        readOnly={showResult}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        className="w-full bg-primary text-white hover:bg-primary/90"
                        disabled={isCreating || !url}
                      >
                        {isCreating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Shortening...
                          </>
                        ) : (
                          <>
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Shorten URL
                          </>
                        )}
                      </Button>
                      
                      {isAuthenticated && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate("/app/dashboard")}
                          className="whitespace-nowrap"
                        >
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          My Links
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 7V9H13V7H11ZM11 11V17H13V11H11ZM4 12C4 16.41 7.59 20 12 20C16.41 20 20 16.41 20 12C20 7.59 16.41 4 12 4C7.59 4 4 7.59 4 12Z" fill="currentColor"/>
                      </svg>
                      <span>Enter your link above — HTTPS is added automatically</span>
                    </div>
                  </form>
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

                <CardContent className="flex flex-col space-y-4 pt-4 pb-6">
                  {showResult ? (
                    <div className="space-y-5">
                      <div>
                        <Label htmlFor="shortUrl" className="text-sm font-medium mb-2 flex items-center">
                          <ArrowRight className="w-4 h-4 mr-2" /> 
                          Your shortened URL
                        </Label>
                        <div className="flex flex-col space-y-4">
                          {/* Single URL display with copy button */}
                          {isAuthenticated ? (
                            <div className="flex items-center w-full">
                              <div className="whitespace-nowrap text-sm font-mono bg-gray-100 px-2 py-5 rounded-l-md border-y border-l overflow-hidden text-ellipsis" style={{maxWidth: '40%'}}>
                                {baseUrl}/
                              </div>
                              <form 
                                className="flex-1 flex"
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  if (shortCode) handleUpdateShortcode();
                                }}
                              >
                                <div className="w-full flex flex-col">
                                  <Input
                                    id="shortCode"
                                    value={shortCode}
                                    onChange={(e) => {
                                      setShortCode(e.target.value);
                                      // Clear any previous errors
                                      setShortCodeError("");
                                      // Regenerate QR code when shortcode changes
                                      generateQRCode(`${baseUrl}/${e.target.value}`);
                                    }}
                                    className={`text-sm font-mono border-2 py-5 rounded-none focus-visible:ring-primary w-full ${shortCodeError ? "border-red-500" : ""}`}
                                    placeholder="custom-code"
                                  />
                                  {shortCodeError && (
                                    <p className="text-xs text-red-500 mt-1">
                                      {shortCodeError}
                                    </p>
                                  )}
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  type="button"
                                  onClick={handleCopy}
                                  title="Copy to clipboard"
                                  className="ml-0 rounded-l-none rounded-r-md"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </form>
                            </div>
                          ) : (
                            <div className="flex items-center w-full">
                              <Input
                                id="shortUrl"
                                value={`${baseUrl}/${shortCode}`}
                                readOnly
                                className="text-sm font-mono bg-white border-2 py-3 focus-visible:ring-primary flex-1 rounded-r-none"
                              />
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={handleCopy}
                                title="Copy to clipboard"
                                className="ml-0 rounded-l-none"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-3 mt-3">
                        <div className="flex space-x-2 justify-center">
                          <Button 
                            className="flex-1" 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowQrModal(true)}
                          >
                            <QrCode className="mr-2 h-4 w-4" />
                            Show QR Code
                          </Button>
                          <Button 
                            className="flex-1" 
                            variant="outline"
                            size="sm" 
                            onClick={handleReset}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            New URL
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {isAuthenticated && (
                          <div className="flex flex-col space-y-4">
                            <div className="flex items-center">
                              <div className="whitespace-nowrap overflow-hidden text-ellipsis text-sm font-mono bg-gray-100 px-2 py-5 rounded-l-md border-y border-l" style={{maxWidth: '40%'}}>
                                {baseUrl}/
                              </div>
                              <div className="flex-grow flex flex-col">
                                <Input
                                  id="customShortCode"
                                  value={customShortCode}
                                  onChange={(e) => {
                                    setCustomShortCode(e.target.value);
                                    setCustomShortCodeError("");
                                  }}
                                  placeholder="custom-code (optional)"
                                  className={`text-sm font-mono border-2 py-5 rounded-l-none focus-visible:ring-primary w-full ${customShortCodeError ? "border-red-500" : ""}`}
                                />
                                {customShortCodeError && (
                                  <p className="text-xs text-red-500 mt-1">
                                    {customShortCodeError}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      

                      </div>

                      {!isAuthenticated && (
                        <div className="text-center text-xs text-gray-500 mt-2">
                          <p>Sign in to use custom codes</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>

                <CardFooter className="bg-gray-50 mt-2 text-xs text-gray-500 flex justify-center border-t pt-3">
                  <div className="flex flex-col space-y-2 items-center">
                    <div className="flex space-x-3">
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Custom codes require account
                      </span>
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12H15M7 8H17M11 16H13M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Analytics with account
                      </span>
                    </div>
                    {!isAuthenticated && (
                      <div className="text-primary/80 font-medium">
                        <span 
                          className="cursor-pointer hover:underline" 
                          onClick={() => {
                            window.scrollTo(0, 0);
                            navigate("/app/register");
                          }}
                        >
                          Create free account
                        </span>
                      </div>
                    )}
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
  
  return (
    <>
      {mainContent}
      {renderQrCodeModal()}
    </>
  );
}
