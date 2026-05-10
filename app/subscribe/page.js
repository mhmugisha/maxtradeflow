import Link from 'next/link';

export default function Subscribe() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Basic market signals',
        'Daily email updates',
        'Access to web dashboard',
        'Community support'
      ],
      buttonText: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'month',
      features: [
        'All Free features',
        'Real-time signals',
        'Advanced analytics',
        'Priority support',
        'API access',
        'Custom alerts'
      ],
      buttonText: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Elite',
      price: '$49',
      period: 'month',
      features: [
        'All Pro features',
        'Personal analyst',
        'Custom strategies',
        'Direct API integration',
        'White-label solutions',
        '24/7 phone support'
      ],
      buttonText: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-[#3a6070] text-lg max-w-2xl mx-auto">
            Get access to AI-powered trading signals and market analysis.
            Start with our free plan or upgrade for advanced features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-[#111e2e] border rounded-lg p-8 text-center ${
                plan.popular ? 'border-[#60c8d4] ring-2 ring-[#60c8d4]' : 'border-[#1a2e42]'
              }`}
            >
              {plan.popular && (
                <div className="bg-[#60c8d4] text-[#080d14] text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold mb-1 text-[#60c8d4]">{plan.price}</div>
              <div className="text-[#3a6070] mb-6">per {plan.period}</div>

              <ul className="text-left space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="text-[#1D9E75] mr-2">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-[#60c8d4] text-[#080d14] hover:bg-[#4da8b3]'
                    : 'border border-[#60c8d4] text-[#60c8d4] hover:bg-[#60c8d4] hover:text-[#080d14]'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="bg-[#111e2e] border border-[#1a2e42] rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a2e42]">
                  <th className="text-left py-3">Features</th>
                  <th className="text-center py-3">Free</th>
                  <th className="text-center py-3">Pro</th>
                  <th className="text-center py-3">Elite</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#1a2e42]">
                  <td className="py-3">Market Signals</td>
                  <td className="text-center text-[#1D9E75]">✓</td>
                  <td className="text-center text-[#1D9E75]">✓</td>
                  <td className="text-center text-[#1D9E75]">✓</td>
                </tr>
                <tr className="border-b border-[#1a2e42]">
                  <td className="py-3">Real-time Updates</td>
                  <td className="text-center text-[#e05555]">✗</td>
                  <td className="text-center text-[#1D9E75]">✓</td>
                  <td className="text-center text-[#1D9E75]">✓</td>
                </tr>
                <tr className="border-b border-[#1a2e42]">
                  <td className="py-3">API Access</td>
                  <td className="text-center text-[#e05555]">✗</td>
                  <td className="text-center text-[#1D9E75]">✓</td>
                  <td className="text-center text-[#1D9E75]">✓</td>
                </tr>
                <tr className="border-b border-[#1a2e42]">
                  <td className="py-3">Personal Analyst</td>
                  <td className="text-center text-[#e05555]">✗</td>
                  <td className="text-center text-[#e05555]">✗</td>
                  <td className="text-center text-[#1D9E75]">✓</td>
                </tr>
                <tr>
                  <td className="py-3">24/7 Support</td>
                  <td className="text-center text-[#e05555]">✗</td>
                  <td className="text-center text-[#e05555]">✗</td>
                  <td className="text-center text-[#1D9E75]">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 bg-[#111e2e] border-t border-[#1a2e42] py-8 rounded-lg text-center">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <Link href="/" className="text-[#c8dce8] hover:text-[#60c8d4]">Home</Link>
            <Link href="/forex" className="text-[#c8dce8] hover:text-[#60c8d4]">Forex</Link>
            <Link href="/indices" className="text-[#c8dce8] hover:text-[#60c8d4]">Indices</Link>
            <Link href="/subscribe" className="text-[#c8dce8] hover:text-[#60c8d4]">Subscribe</Link>
          </div>
          <p className="text-[#3a6070] text-sm">
            Data powered by cTrader/Pepperstone. Analysis generated by AI.
          </p>
        </footer>
      </div>
    </div>
  );
}