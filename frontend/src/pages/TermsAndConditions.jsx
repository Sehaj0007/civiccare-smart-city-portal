const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-[#0a0f0a] text-gray-300 px-6 py-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#7ED957] mb-6">
          Terms & Conditions
        </h1>

        <p className="mb-4">
          By accessing and using CivicCare, you agree to comply with the following terms
          and conditions.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          User Responsibilities
        </h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Provide accurate and truthful complaint information</li>
          <li>Avoid misuse or false reporting</li>
          <li>Respect community guidelines</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          Platform Usage
        </h2>
        <p>
          CivicCare acts as a digital medium between citizens and authorities.
          Resolution timelines depend on governing departments.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          Termination
        </h2>
        <p>
          We reserve the right to suspend accounts that violate these terms
          without prior notice.
        </p>

        <p className="mt-10 text-sm text-gray-500">
          Last updated: January 2024
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;
