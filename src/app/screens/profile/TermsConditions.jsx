import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  ChevronRight,
  Scale,
  Building2,
  Landmark,
  Home,
  AlertCircle,
  Mail,
  Phone,
} from "lucide-react";

export default function TermsConditions() {
  const navigate = useNavigate();

  const sections = [
    { id: "about", number: "01", title: "About Fundsarthi", icon: FileText },
    { id: "loan", number: "02", title: "Loan Services", icon: Landmark },
    {
      id: "real-estate",
      number: "03",
      title: "Real Estate Services",
      icon: Building2,
    },
    {
      id: "vastu",
      number: "04",
      title: "Vastu Consultation",
      icon: Home,
    },
    {
      id: "technology",
      number: "05",
      title: "Technology Platform Only",
      icon: ShieldCheck,
    },
    {
      id: "responsibilities",
      number: "06",
      title: "User Responsibilities",
      icon: FileText,
    },
    {
      id: "third-party",
      number: "07",
      title: "Third-Party Services",
      icon: Scale,
    },
    {
      id: "payments",
      number: "08",
      title: "Payments",
      icon: FileText,
    },
    {
      id: "verification",
      number: "09",
      title: "Property Verification",
      icon: Building2,
    },
    {
      id: "loan-disclaimer",
      number: "10",
      title: "Loan Disclaimer",
      icon: AlertCircle,
    },
    {
      id: "vastu-disclaimer",
      number: "11",
      title: "Vastu Disclaimer",
      icon: AlertCircle,
    },
    {
      id: "intellectual",
      number: "12",
      title: "Intellectual Property",
      icon: FileText,
    },
    {
      id: "liability",
      number: "13",
      title: "Limitation of Liability",
      icon: Scale,
    },
    {
      id: "conduct",
      number: "14",
      title: "User Conduct",
      icon: ShieldCheck,
    },
    {
      id: "termination",
      number: "15",
      title: "Suspension & Termination",
      icon: AlertCircle,
    },
    {
      id: "privacy",
      number: "16",
      title: "Privacy",
      icon: ShieldCheck,
    },
    {
      id: "changes",
      number: "17",
      title: "Changes to Terms",
      icon: FileText,
    },
    {
      id: "jurisdiction",
      number: "18",
      title: "Governing Law & Jurisdiction",
      icon: Scale,
    },
    {
      id: "contact",
      number: "19",
      title: "Contact Us",
      icon: Mail,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">

      {/* =========================================
          HEADER
      ========================================= */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-[72px] flex items-center justify-between">

          <div className="flex items-center gap-4">

            <button
              onClick={() => navigate(-1)}
              className="
                w-10 h-10
                rounded-xl
                border border-slate-200
                bg-white
                flex items-center justify-center
                hover:bg-slate-50
                hover:border-slate-300
                transition-all
              "
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>

            <div>
              <div className="font-bold text-lg tracking-tight">
                Fundsarthi
              </div>

              <div className="text-xs text-slate-500">
                Legal & Policies
              </div>
            </div>

          </div>

          <div
            className="
              hidden sm:flex
              items-center gap-2
              px-4 py-2
              rounded-full
              bg-slate-50
              border border-slate-200
              text-sm text-slate-600
            "
          >
            <ShieldCheck className="w-4 h-4" />
            Terms & Conditions
          </div>

        </div>
      </header>


      {/* =========================================
          HERO
      ========================================= */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 md:py-20">

          <div className="max-w-4xl">

            <div
              className="
                inline-flex
                items-center
                gap-2
                px-3 py-1.5
                rounded-full
                bg-slate-100
                border border-slate-200
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-slate-600
                mb-6
              "
            >
              <Scale className="w-3.5 h-3.5" />
              Legal Document
            </div>

            <h1
              className="
                text-4xl
                md:text-6xl
                font-bold
                tracking-[-0.04em]
                leading-[1.05]
                text-slate-950
              "
            >
              Terms & Conditions
            </h1>

            <p
              className="
                mt-5
                text-lg
                md:text-xl
                leading-8
                text-slate-500
                max-w-3xl
              "
            >
              Please read these terms carefully before using the
              Fundsarthi platform and its services.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <div
                className="
                  px-4 py-2.5
                  rounded-xl
                  bg-slate-50
                  border border-slate-200
                  text-sm text-slate-600
                "
              >
                Fundsarthi Master App
              </div>

              <div
                className="
                  px-4 py-2.5
                  rounded-xl
                  bg-slate-50
                  border border-slate-200
                  text-sm text-slate-600
                "
              >
                Legal Information
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =========================================
          MAIN CONTENT
      ========================================= */}
      <main className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">

        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-10">


          {/* =====================================
              SIDEBAR
          ===================================== */}
          <aside className="hidden lg:block">

            <div className="sticky top-28">

              <div
                className="
                  text-xs
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-400
                  mb-4
                "
              >
                On this page
              </div>

              <nav
                className="
                  space-y-1
                  max-h-[calc(100vh-160px)]
                  overflow-y-auto
                  pr-2
                "
              >

                {sections.map((section) => {
                  const Icon = section.icon;

                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="
                        group
                        flex
                        items-center
                        gap-3
                        px-3
                        py-2.5
                        rounded-xl
                        text-sm
                        text-slate-500
                        hover:bg-white
                        hover:text-slate-900
                        hover:shadow-sm
                        transition-all
                      "
                    >

                      <span
                        className="
                          w-7 h-7
                          rounded-lg
                          bg-slate-100
                          group-hover:bg-slate-900
                          group-hover:text-white
                          flex
                          items-center
                          justify-center
                          transition-colors
                        "
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </span>

                      <span className="flex-1">
                        {section.title}
                      </span>

                      <ChevronRight
                        className="
                          w-3.5 h-3.5
                          opacity-0
                          -translate-x-1
                          group-hover:opacity-100
                          group-hover:translate-x-0
                          transition-all
                        "
                      />

                    </a>
                  );
                })}

              </nav>

            </div>

          </aside>


          {/* =====================================
              DOCUMENT CONTENT
          ===================================== */}
          <article className="min-w-0">


            {/* INTRO */}
            <div
              className="
                bg-slate-950
                text-white
                rounded-3xl
                p-7 md:p-10
                mb-8
                shadow-xl
              "
            >

              <div className="flex items-start gap-4">

                <div
                  className="
                    shrink-0
                    w-11 h-11
                    rounded-2xl
                    bg-white/10
                    border border-white/10
                    flex items-center justify-center
                  "
                >
                  <ShieldCheck className="w-5 h-5" />
                </div>

                <div>

                  <h2 className="text-xl font-semibold">
                    Welcome to Fundsarthi Master App
                  </h2>

                  <p
                    className="
                      mt-3
                      text-slate-300
                      leading-7
                    "
                  >
                    By accessing or using the Platform, you agree
                    to be bound by these Terms & Conditions. If you
                    do not agree, please discontinue use of the Platform.
                  </p>

                </div>

              </div>

            </div>


            {/* =====================================
                SECTION 01
            ===================================== */}
            <div className="space-y-5">

              <Section
                id="about"
                number="01"
                title="About Fundsarthi"
              >
                <p>
                  Fundsarthi is a technology platform that facilitates
                  connections between users and independent service
                  providers in the following categories:
                </p>

                <BulletList
                  items={[
                    "Loan Assistance",
                    "Real Estate Listings",
                    "Vastu Consultation",
                  ]}
                />

                <p>
                  Fundsarthi does not directly provide banking services,
                  real estate brokerage services, Vastu consultancy,
                  legal advice, financial advice, or engineering services.
                </p>

                <p>
                  Our role is limited to providing a digital platform
                  for users to discover, connect, communicate, and
                  transact with independent third-party providers.
                </p>
              </Section>


              {/* SECTION 02 */}
              <Section
                id="loan"
                number="02"
                title="Loan Services"
              >
                <p>
                  Fundsarthi acts only as a Distribution Partner
                  (DSA)/Referral Partner of banks, NBFCs, and
                  financial institutions.
                </p>

                <BulletList
                  items={[
                    "Collects user information after obtaining consent.",
                    "Forwards applications to partner banks/NBFCs.",
                    "Facilitates communication between applicants and lenders.",
                    "Does not sanction loans.",
                    "Does not approve or reject loan applications.",
                    "Cannot guarantee loan approval.",
                    "Cannot influence interest rates.",
                    "Cannot guarantee processing timelines.",
                  ]}
                />

                <Notice>
                  Loan approval is solely at the discretion of the
                  respective lender.
                </Notice>
              </Section>


              {/* SECTION 03 */}
              <Section
                id="real-estate"
                number="03"
                title="Real Estate Services"
              >
                <p>
                  Fundsarthi provides a digital marketplace where
                  builders, property owners, brokers, buyers, sellers,
                  and tenants may list or browse properties.
                </p>

                <BulletList
                  items={[
                    "Fundsarthi is not a real estate broker.",
                    "Fundsarthi does not verify legal ownership of every property.",
                    "Fundsarthi does not guarantee the accuracy of listings.",
                    "Fundsarthi is not responsible for negotiations.",
                    "Fundsarthi is not a party to any sale, purchase, rental, lease, or agreement.",
                  ]}
                />

                <Notice>
                  Users are solely responsible for conducting legal,
                  financial, and technical due diligence before entering
                  into any transaction.
                </Notice>
              </Section>


              {/* SECTION 04 */}
              <Section
                id="vastu"
                number="04"
                title="Vastu Consultation"
              >
                <p>
                  Fundsarthi provides an online appointment booking
                  platform connecting users with independent Vastu
                  consultants.
                </p>

                <BulletList
                  items={[
                    "Fundsarthi does not provide Vastu advice.",
                    "Does not certify consultant recommendations.",
                    "Does not guarantee consultation outcomes.",
                    "Is not liable for business, personal, financial, emotional, architectural, or spiritual decisions made based on consultation.",
                  ]}
                />

                <p>
                  The consultant alone is responsible for advice provided.
                </p>
              </Section>


              {/* SECTION 05 */}
              <Section
                id="technology"
                number="05"
                title="Technology Platform Only"
              >
                <p>
                  Fundsarthi is solely a technology intermediary.
                  The Platform merely enables users to interact with
                  independent third parties.
                </p>

                <p>
                  Fundsarthi is not:
                </p>

                <BulletList
                  items={[
                    "A bank",
                    "An NBFC",
                    "A housing finance company",
                    "A real estate broker",
                    "A property developer",
                    "A Vastu consultancy firm",
                    "An engineering company",
                    "An architectural consultancy",
                  ]}
                />
              </Section>


              {/* SECTION 06 */}
              <Section
                id="responsibilities"
                number="06"
                title="User Responsibilities"
              >
                <p>Users agree to:</p>

                <BulletList
                  items={[
                    "Provide accurate information.",
                    "Upload genuine documents.",
                    "Maintain confidentiality of login credentials.",
                    "Comply with applicable laws.",
                    "Avoid fraudulent activities.",
                  ]}
                />

                <Notice>
                  Providing false documents may result in account suspension.
                </Notice>
              </Section>


              {/* SECTION 07 */}
              <Section
                id="third-party"
                number="07"
                title="Third-Party Services"
              >
                <p>
                  Services offered by banks, NBFCs, brokers, builders,
                  property owners, and Vastu consultants are independent
                  of Fundsarthi.
                </p>

                <p>
                  Fundsarthi shall not be liable for:
                </p>

                <BulletList
                  items={[
                    "Service quality",
                    "Delays",
                    "Cancellations",
                    "Misconduct",
                    "Negligence",
                    "Incorrect advice",
                    "Financial loss",
                  ]}
                />
              </Section>


              {/* SECTION 08 */}
              <Section
                id="payments"
                number="08"
                title="Payments"
              >
                <Notice>
                  Currently, the Fundsarthi app does not collect payments
                  through the platform. If payment services are introduced
                  in the future, applicable payment, cancellation, and
                  refund policies will be published.
                </Notice>

                <p>
                  Certain services may require payment. Fundsarthi may
                  collect payments on behalf of service providers where
                  applicable.
                </p>

                <p>
                  Any refund shall be governed by the respective service
                  provider's refund policy unless otherwise stated.
                </p>
              </Section>


              {/* SECTION 09 */}
              <Section
                id="verification"
                number="09"
                title="Property Verification"
              >
                <p>
                  Fundsarthi does not independently verify:
                </p>

                <BulletList
                  items={[
                    "Title ownership",
                    "Legal approvals",
                    "RERA registration",
                    "Encumbrances",
                    "Building approvals",
                    "Tax status",
                  ]}
                />

                <Notice>
                  Users must independently verify all property-related
                  information.
                </Notice>
              </Section>


              {/* SECTION 10 */}
              <Section
                id="loan-disclaimer"
                number="10"
                title="Loan Disclaimer"
              >
                <p>
                  Loan approval depends upon:
                </p>

                <BulletList
                  items={[
                    "Credit score",
                    "Lender eligibility",
                    "Documentation",
                    "Income",
                    "Banking policies",
                    "Internal underwriting",
                  ]}
                />

                <Notice>
                  Fundsarthi cannot guarantee loan approval.
                </Notice>
              </Section>


              {/* SECTION 11 */}
              <Section
                id="vastu-disclaimer"
                number="11"
                title="Vastu Disclaimer"
              >
                <p>
                  Vastu consultation is based on traditional beliefs
                  and personal interpretations. Results may vary.
                </p>

                <p>
                  Fundsarthi makes no warranty regarding:
                </p>

                <BulletList
                  items={[
                    "Financial success",
                    "Health improvement",
                    "Business growth",
                    "Family relationships",
                    "Property appreciation",
                  ]}
                />

                <Notice>
                  Users accept consultations at their own discretion.
                </Notice>
              </Section>


              {/* SECTION 12 */}
              <Section
                id="intellectual"
                number="12"
                title="Intellectual Property"
              >
                <p>
                  All Platform content including logo, branding,
                  software, UI, graphics, and content belongs to
                  Fundsarthi unless otherwise specified.
                </p>
              </Section>


              {/* SECTION 13 */}
              <Section
                id="liability"
                number="13"
                title="Limitation of Liability"
              >
                <p>
                  Fundsarthi shall not be liable for:
                </p>

                <BulletList
                  items={[
                    "Indirect losses",
                    "Business losses",
                    "Loan rejection",
                    "Property disputes",
                    "Consultant advice",
                    "Fraud by third parties",
                    "Data inaccuracies supplied by users or providers",
                    "Consequential damages",
                  ]}
                />

                <Notice>
                  Where liability cannot be excluded under applicable
                  law, Fundsarthi's aggregate liability shall not exceed
                  the amount, if any, paid by the user to Fundsarthi
                  for the relevant service.
                </Notice>
              </Section>


              {/* SECTION 14 */}
              <Section
                id="conduct"
                number="14"
                title="User Conduct"
              >
                <p>Users shall not:</p>

                <BulletList
                  items={[
                    "Misuse the Platform.",
                    "Upload illegal content.",
                    "Impersonate others.",
                    "Attempt unauthorized access.",
                    "Violate intellectual property rights.",
                    "Interfere with Platform operations.",
                  ]}
                />
              </Section>


              {/* SECTION 15 */}
              <Section
                id="termination"
                number="15"
                title="Suspension & Termination"
              >
                <p>
                  Fundsarthi reserves the right to suspend or terminate
                  any account for:
                </p>

                <BulletList
                  items={[
                    "Fraud",
                    "Misuse",
                    "Illegal activity",
                    "Violation of these Terms",
                  ]}
                />
              </Section>


              {/* SECTION 16 */}
              <Section
                id="privacy"
                number="16"
                title="Privacy"
              >
                <p>
                  User information shall be collected and processed
                  in accordance with the Fundsarthi Privacy Policy.
                </p>

                <p>
                  By using the Platform, users consent to sharing
                  necessary information with partner banks, brokers,
                  builders, Vastu consultants, and other relevant
                  service providers for the requested services.
                </p>
              </Section>


              {/* SECTION 17 */}
              <Section
                id="changes"
                number="17"
                title="Changes to Terms"
              >
                <p>
                  Fundsarthi reserves the right to modify these Terms
                  at any time. Continued use of the Platform after
                  changes constitutes acceptance of the updated Terms.
                </p>
              </Section>


              {/* SECTION 18 */}
              <Section
                id="jurisdiction"
                number="18"
                title="Governing Law & Jurisdiction"
              >
                <p>
                  These Terms shall be governed by the laws of India.
                </p>

                <Notice>
                  Any disputes shall be subject to the exclusive
                  jurisdiction of the courts located in Gurugram,
                  Haryana.
                </Notice>
              </Section>


              {/* =====================================
                  SECTION 19 - CONTACT
              ===================================== */}
              <section
                id="contact"
                className="
                  scroll-mt-28
                  rounded-3xl
                  bg-white
                  border border-slate-200
                  p-7 md:p-10
                  shadow-sm
                "
              >

                <div className="flex items-start gap-5">

                  <div
                    className="
                      w-12 h-12
                      rounded-2xl
                      bg-slate-950
                      text-white
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >
                    <Mail className="w-5 h-5" />
                  </div>

                  <div className="flex-1">

                    <div className="flex items-center gap-3">

                      <span
                        className="
                          text-sm
                          font-bold
                          text-slate-400
                        "
                      >
                        19
                      </span>

                      <h2
                        className="
                          text-2xl
                          md:text-3xl
                          font-bold
                          tracking-tight
                        "
                      >
                        Contact Us
                      </h2>

                    </div>


                    <div
                      className="
                        mt-7
                        grid
                        sm:grid-cols-2
                        gap-4
                      "
                    >

                      {/* EMAIL */}
                      <div
                        className="
                          rounded-2xl
                          bg-slate-50
                          border border-slate-200
                          p-5
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wider
                            text-slate-400
                          "
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </div>

                        <p
                          className="
                            mt-2
                            font-medium
                            text-slate-900
                          "
                        >
                          info@fundsarthi.in
                        </p>

                      </div>


                      {/* PHONE */}
                      <div
                        className="
                          rounded-2xl
                          bg-slate-50
                          border border-slate-200
                          p-5
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wider
                            text-slate-400
                          "
                        >
                          <Phone className="w-4 h-4" />
                          Phone
                        </div>

                        <p
                          className="
                            mt-2
                            font-medium
                            text-slate-900
                          "
                        >
                          +91 9971333431
                        </p>

                      </div>

                    </div>


                    <p className="mt-5 text-sm text-slate-500">
                      Fundsarthi · www.Fundsarthi.in
                    </p>

                  </div>

                </div>

              </section>

            </div>

          </article>

        </div>

      </main>


      {/* =========================================
          FOOTER
      ========================================= */}
      <footer className="border-t border-slate-200 bg-white">

        <div
          className="
            max-w-7xl
            mx-auto
            px-5 md:px-8
            py-8
            flex
            flex-col
            md:flex-row
            gap-3
            items-center
            justify-between
            text-sm
            text-slate-500
          "
        >

          <span>
            © {new Date().getFullYear()} Fundsarthi
          </span>

          <span>
            Terms & Conditions
          </span>

        </div>

      </footer>

    </div>
  );
}


/* =============================================
   SECTION COMPONENT
============================================= */

function Section({
  id,
  number,
  title,
  children,
}) {
  return (
    <section
      id={id}
      className="
        scroll-mt-28
        bg-white
        border border-slate-200
        rounded-3xl
        p-7 md:p-10
        shadow-sm
        hover:shadow-md
        transition-shadow
      "
    >

      <div className="flex gap-5">

        {/* NUMBER */}
        <div
          className="
            shrink-0
            w-10 h-10
            rounded-xl
            bg-slate-100
            flex
            items-center
            justify-center
            text-xs
            font-bold
            text-slate-500
          "
        >
          {number}
        </div>


        {/* CONTENT */}
        <div className="min-w-0 flex-1">

          <h2
            className="
              text-xl
              md:text-2xl
              font-bold
              tracking-tight
              text-slate-950
            "
          >
            {title}
          </h2>

          <div
            className="
              mt-5
              space-y-4
              text-[15px]
              leading-7
              text-slate-600
            "
          >
            {children}
          </div>

        </div>

      </div>

    </section>
  );
}


/* =============================================
   BULLET LIST
============================================= */

function BulletList({ items }) {
  return (
    <ul className="space-y-2.5 my-4">

      {items.map((item, index) => (
        <li
          key={index}
          className="
            flex
            items-start
            gap-3
          "
        >

          <span
            className="
              mt-[11px]
              w-1.5
              h-1.5
              rounded-full
              bg-slate-400
              shrink-0
            "
          />

          <span>
            {item}
          </span>

        </li>
      ))}

    </ul>
  );
}


/* =============================================
   NOTICE / DISCLAIMER
============================================= */

function Notice({ children }) {
  return (
    <div
      className="
        my-5
        rounded-2xl
        border border-amber-200
        bg-amber-50
        px-5 py-4
        text-sm
        leading-6
        text-amber-900
      "
    >

      <div className="flex gap-3">

        <AlertCircle
          className="
            w-5 h-5
            mt-0.5
            shrink-0
            text-amber-600
          "
        />

        <div>
          {children}
        </div>

      </div>

    </div>
  );
}