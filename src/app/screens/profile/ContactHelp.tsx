import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";

export default function ContactHelp() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      category: "Vaastu",
      question: "What are the 5 elements of Vaastu Shastra?",
      answer:
        "Water, Earth, Air, Fire and Space are the five fundamental elements on which Vaastu Shastra is based.",
    },
    {
      category: "Real Estate",
      question: "What documents are required to buy a property?",
      answer:
        "Sale Deed, Title Deed, Encumbrance Certificate, Property Tax Receipts, Approved Building Plan, Occupancy Certificate, NOC and RERA Registration Certificate.",
    },
    {
      category: "Real Estate",
      question: "What is RERA?",
      answer:
        "RERA is the Real Estate Regulatory Authority established to protect homebuyers and ensure transparency in the real estate sector.",
    },
    {
      category: "Loan",
      question: "What is a Personal Loan?",
      answer:
        "A Personal Loan is an unsecured loan that provides financial support without requiring collateral.",
    },
    {
      category: "Loan",
      question: "How much personal loan can I get?",
      answer:
        "With Fundsarthi, personal loans may range from ₹50,000 up to ₹1 Crore depending on eligibility.",
    },
    {
      category: "Home Loan",
      question: "Do I get tax benefits on a Home Loan?",
      answer:
        "Yes. Tax benefits are available on both principal and interest components under applicable income tax provisions.",
    },
    {
      category: "Business Loan",
      question: "What is an unsecured business loan?",
      answer:
        "It is a loan that does not require collateral and is approved based on business performance and creditworthiness.",
    },
    {
      category: "MSME Loan",
      question: "Is GST mandatory for MSME Loan?",
      answer:
        "Yes. Previous year's GST returns are generally required for existing MSMEs applying for loans.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      {/* Contact Form */}
      <section>
        <h1 className="text-3xl font-bold mb-2">
          We'll Get In Touch With You
        </h1>

        <p className="text-muted-foreground mb-6">
          Have questions about Property, Loans, or Vaastu? Fill out the form
          and our team will contact you shortly.
        </p>

        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              className="border rounded-lg px-4 py-3"
            />

            <input
              type="email"
              placeholder="Email Address"
              className="border rounded-lg px-4 py-3"
            />

            <input
              type="tel"
              placeholder="Mobile Number"
              className="border rounded-lg px-4 py-3"
            />

            <select className="border rounded-lg px-4 py-3">
              <option>Select Inquiry Type</option>
              <option>Property</option>
              <option>Home Loan</option>
              <option>Personal Loan</option>
              <option>Business Loan</option>
              <option>MSME Loan</option>
              <option>Vaastu Consultation</option>
            </select>

            <select className="border rounded-lg px-4 py-3">
              <option>Preferred Call Time</option>
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Evening</option>
            </select>

            <select className="border rounded-lg px-4 py-3">
              <option>I am a</option>
              <option>Buyer</option>
              <option>Seller</option>
              <option>Investor</option>
              <option>Owner</option>
            </select>
          </div>

          <textarea
            rows={4}
            placeholder="Your Message"
            className="w-full mt-4 border rounded-lg px-4 py-3"
          />

          <button className="w-full mt-4 bg-primary text-primary-foreground rounded-lg py-3 font-medium">
            Submit
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <h2 className="text-3xl font-bold mb-6">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() =>
                  setOpenFaq(openFaq === index ? null : index)
                }
                className="w-full flex justify-between items-center p-4 text-left"
              >
                <div>
                  <p className="text-xs text-primary font-medium mb-1">
                    {faq.category}
                  </p>

                  <p className="font-medium">
                    {faq.question}
                  </p>
                </div>

                {openFaq === index ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>

              {openFaq === index && (
                <div className="px-4 pb-4 text-muted-foreground">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}