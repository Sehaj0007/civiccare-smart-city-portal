const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#0a0f0a] text-gray-300 px-6 py-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#7ED957] mb-6">
          Privacy Policy
        </h1>

        <p className="mb-4">
          CivicCare respects your privacy and is committed to protecting your personal data.
          This Privacy Policy explains how we collect, use, and safeguard your information.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          Information We Collect
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Personal details such as name, email, and contact number</li>
          <li>Location data for complaint resolution</li>
          <li>Uploaded images and complaint descriptions</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          How We Use Your Data
        </h2>
        <p>
          Your data is used strictly to process complaints, improve civic services,
          and provide transparency between citizens and authorities.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          Data Security
        </h2>
        <p>
          We implement industry-standard security measures to protect your data.
          Your information is never sold to third parties.
        </p>

        <p className="mt-10 text-sm text-gray-500">
          Last updated: January 2024
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
