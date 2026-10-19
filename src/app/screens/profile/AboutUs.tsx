export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          About Fundsarthi
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
          India's first integrated ecosystem that helps users discover
          properties, compare and apply for loans, connect with verified
          Vaastu experts, and make informed decisions through technology.
        </p>
      </section>

      {/* Mission */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">
          Our Mission
        </h2>

        <p className="text-muted-foreground leading-relaxed text-lg">
          To bring Property, Finance, and Vaastu together in one intelligent
          platform, helping individuals and families make smarter decisions
          for their homes and investments.
        </p>
      </section>

      {/* Services */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8">
          What We Offer
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Real Estate */}
          <div className="border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-4">
              🏠 Real Estate Solutions
            </h3>

            <p className="text-muted-foreground leading-relaxed">
              Explore verified property listings, project details, builder
              information, virtual tours, market insights, and personalized
              property recommendations for buying, selling, renting, or
              investing.
            </p>
          </div>

          {/* Loans */}
          <div className="border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-4">
              💰 Loan Assistance
            </h3>

            <p className="text-muted-foreground mb-4 leading-relaxed">
              Get connected with trusted lending partners and loan experts.
            </p>

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Home Loans</li>
              <li>• Loan Against Property</li>
              <li>• Business Loans</li>
              <li>• Personal Loans</li>
              <li>• MSME Loans</li>
              <li>• Corporate Loans</li>
            </ul>
          </div>

          {/* Vaastu */}
          <div className="border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold mb-4">
              🧭 Vaastu Consultation
            </h3>

            <p className="text-muted-foreground mb-4 leading-relaxed">
              Connect with experienced Vaastu consultants through our
              platform.
            </p>

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Residential Vaastu Consultation</li>
              <li>• Commercial Vaastu Consultation</li>
              <li>• Floor Plan Analysis</li>
              <li>• Property Vaastu Assessment</li>
              <li>• Personalized Recommendations</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">
          Our Vision
        </h2>

        <p className="text-muted-foreground leading-relaxed text-lg">
          To become India's most trusted Home Decision Platform by empowering
          individuals and families with everything they need to buy, finance,
          and enhance their dream property from a single destination.
        </p>
      </section>

      {/* Why Choose Us */}
      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8">
          Why Choose Us?
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            "One Platform for Property, Loans & Vaastu",
            "Verified Professionals & Trusted Partners",
            "Intelligent Recommendations & Insights",
            "Seamless Digital Experience",
            "Personalized Support at Every Step",
            "Transparent and User-Centric Approach",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 p-4 border rounded-lg"
            >
              <span className="text-green-600 font-bold text-lg">✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Promise */}
      <section className="bg-muted/40 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">
          Our Promise
        </h2>

        <p className="text-muted-foreground max-w-3xl mx-auto mb-6 leading-relaxed text-lg">
          We are committed to helping our users make smarter property and
          financial decisions while creating spaces that align with their
          goals, aspirations, and lifestyle.
        </p>

        <div className="text-2xl md:text-3xl font-bold">
          Buy Right. Finance Smart. Live Balanced.
        </div>
      </section>
    </div>
  );
}