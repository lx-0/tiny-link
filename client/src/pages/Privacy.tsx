import SimpleNav from "@/components/SimpleNav";

export default function Privacy() {
  return (
    <>
      <SimpleNav />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Privacy Commitment</h2>
          <p>
            TinyLink was built with privacy as a core principle. As a self-hosted, open-source application, 
            we've designed it to give you full control over all data collection and storage.
          </p>
          <p>
            Unlike commercial URL shortening services which often track user behavior and sell that data, 
            TinyLink keeps your link data on your own servers, with complete transparency about how information is collected and used.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Information Collection</h2>
          <p>
            TinyLink collects the following information about URLs:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Original URLs and their corresponding shortened links</li>
            <li>Creation date and time</li>
            <li>Click statistics (number of clicks, time of clicks)</li>
            <li>User account information (if user accounts are enabled)</li>
          </ul>
          <p className="mt-4">
            This information is stored solely on your own servers or database and is not transmitted to any third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How Information Is Used</h2>
          <p>
            The collected information is used exclusively for:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Redirecting shortened links to their original URLs</li>
            <li>Providing analytics on link usage to link creators</li>
            <li>Authentication and user account management</li>
            <li>System administration and maintenance</li>
          </ul>
          <p className="mt-4">
            As the administrator of your TinyLink instance, you have full control over data retention periods and how data is used.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">No Third-Party Sharing</h2>
          <p>
            By design, TinyLink does not share any data with third parties. There are:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>No third-party analytics services</li>
            <li>No advertising networks</li>
            <li>No data brokers</li>
            <li>No tracking cookies from external sources</li>
          </ul>
          <p className="mt-4">
            This ensures that your link data and user information remain private and under your control.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Administrator Responsibilities</h2>
          <p>
            As the administrator of a self-hosted TinyLink instance, you are responsible for:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Ensuring your deployment complies with applicable privacy laws and regulations</li>
            <li>Securing the server and database against unauthorized access</li>
            <li>Implementing appropriate data retention and deletion policies</li>
            <li>Informing your users about your specific privacy practices</li>
            <li>Handling any requests for data access or deletion from your users</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Security Measures</h2>
          <p>
            TinyLink implements several security features to protect your data:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Secure authentication using Supabase Auth</li>
            <li>Database security through parameterized queries</li>
            <li>Input validation to prevent injection attacks</li>
            <li>Optional user account requirement for creating links</li>
          </ul>
          <p className="mt-4">
            As a self-hosted application, the overall security also depends on your server configuration, 
            updates, and other security measures you implement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Transparency and Open Source</h2>
          <p>
            TinyLink's complete source code is available for review on GitHub, ensuring full transparency about how data is handled. 
            There are no hidden tracking mechanisms or data collection routines.
          </p>
          <p>
            We believe in transparency as a privacy principle, which is why we've made TinyLink 100% open source under the MIT license.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Updates To This Policy</h2>
          <p>
            This privacy policy may be updated as the software evolves. As a self-hosted application, 
            you should review the privacy policy that comes with each version you choose to deploy.
          </p>
        </section>
      </div>

      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <p className="text-center text-gray-600">
          Last updated: March 20, 2025
        </p>
      </div>
    </div>
    </>
  );
}