import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaGithub, FaCode, FaLock } from "react-icons/fa";
import SimpleNav from "@/components/SimpleNav";

export default function About() {
  return (
    <>
      <SimpleNav />
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">About TinyLink</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A privacy-focused, open-source URL shortener designed to give you complete control over your data.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-4">
              TinyLink was created with a simple mission: give individuals and organizations a way to shorten URLs 
              without surrendering control of their data to commercial services.
            </p>
            <p className="text-gray-700 mb-4">
              In a world where data privacy is increasingly important, we believe you should be able to 
              run essential services like URL shortening on your own infrastructure, with complete transparency 
              about how your data is handled.
            </p>
            <p className="text-gray-700">
              By being 100% open source and self-hosted, TinyLink ensures that your link data, 
              analytics, and user information stay under your control at all times.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Core Values</h2>
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <FaLock className="mr-2 text-primary" /> Privacy First
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Your data stays on your servers, with no tracking, telemetry, or data collection.</p>
              </CardContent>
            </Card>
            <Card className="mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <FaCode className="mr-2 text-primary" /> Open Source Freedom
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>100% open source under MIT license, free to modify and adapt to your needs.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <FaGithub className="mr-2 text-primary" /> Community Driven
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Built by and for privacy-conscious developers and organizations.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="text-center pb-2">
                <CardTitle>React</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600">
                Frontend Framework
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-center pb-2">
                <CardTitle>TypeScript</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600">
                Type Safety
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-center pb-2">
                <CardTitle>Express</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600">
                Backend Server
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-center pb-2">
                <CardTitle>Drizzle ORM</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-gray-600">
                Database ORM
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            TinyLink is open source and community driven. We welcome contributions, feature requests, and bug reports.
          </p>
          <a 
            href="https://github.com/lx-0/tinylink.git" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            <FaGithub className="mr-2" />
            View on GitHub
          </a>
        </div>
      </div>
    </>
  );
}