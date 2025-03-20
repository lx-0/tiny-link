export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Terms of Service</h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Welcome to TinyLink, a self-hosted URL shortening service. By using TinyLink, you agree to these Terms of Service. 
            Since TinyLink is self-hosted, these terms apply to your instance of the service and how you choose to deploy it.
          </p>
          <p>
            As an open-source, self-hosted application, TinyLink provides you with the software, but you are responsible for 
            how you deploy, operate, and manage your installation.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Your Responsibilities</h2>
          <p>
            When self-hosting TinyLink, you are responsible for:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Ensuring your deployment complies with applicable laws and regulations</li>
            <li>Securing your server and protecting user data</li>
            <li>Monitoring for and preventing potential abuse of your service</li>
            <li>Maintaining and updating your TinyLink installation</li>
            <li>Managing backups of your URL data and database</li>
            <li>Configuring appropriate rate limits and access controls</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Acceptable Use</h2>
          <p>
            You agree not to use TinyLink to shorten URLs that:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Contain malware, viruses, or other harmful code</li>
            <li>Facilitate phishing attacks or other fraudulent activities</li>
            <li>Promote illegal activities or violate applicable laws</li>
            <li>Infringe on intellectual property rights</li>
            <li>Contain content that is defamatory, obscene, or otherwise objectionable</li>
          </ul>
          <p className="mt-4">
            As the administrator of your TinyLink instance, you are responsible for establishing and enforcing acceptable use policies for your users.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Privacy and Data Protection</h2>
          <p>
            While TinyLink is designed with privacy in mind, you are responsible for:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Creating and maintaining a privacy policy appropriate for your instance</li>
            <li>Implementing appropriate data protection measures</li>
            <li>Complying with applicable privacy laws and regulations (such as GDPR, CCPA, etc.)</li>
            <li>Managing user consent for data collection and processing</li>
            <li>Handling data retention and deletion in accordance with your policies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Limitation of Liability</h2>
          <p>
            TinyLink is provided "as is" without warranties of any kind, either express or implied. In no event shall the 
            authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, 
            tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.
          </p>
          <p>
            You acknowledge that you are solely responsible for any consequences that may arise from your use, deployment, or 
            configuration of TinyLink.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Modifications to Terms</h2>
          <p>
            These terms may be updated from time to time as the software evolves. As a self-hosted application, you should 
            review the terms that come with each version you choose to deploy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Open Source License</h2>
          <p>
            TinyLink is licensed under the MIT License. This means you are free to use, modify, and distribute the software, 
            subject to the terms of that license, which include:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Including the original copyright notice and permission notice</li>
            <li>Understanding that the software is provided "as is" without warranty</li>
          </ul>
          <p className="mt-4">
            The full text of the MIT License is available in the LICENSE file included with the software.
          </p>
        </section>
      </div>

      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <p className="text-center text-gray-600">
          Last updated: March 20, 2025
        </p>
      </div>
    </div>
  );
}