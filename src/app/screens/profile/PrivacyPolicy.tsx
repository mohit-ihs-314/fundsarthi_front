import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ShieldCheck,
  LockKeyhole,
  Database,
  UserRound,
  FileText,
  Cookie,
  Share2,
  Scale,
  Smartphone,
  Landmark,
  Mail,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  Settings,
  Globe2,
} from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  const sections = [
    {
      id: "information",
      number: "01",
      title: "Information We Collect",
      icon: Database,
    },
    {
      id: "usage",
      number: "02",
      title: "How We Use Your Information",
      icon: Eye,
    },
    {
      id: "consent",
      number: "03",
      title: "Consent & Communication",
      icon: CheckCircle2,
    },
    {
      id: "retention",
      number: "04",
      title: "Consent Validity & Retention",
      icon: Database,
    },
    {
      id: "sharing",
      number: "05",
      title: "Information Sharing",
      icon: Share2,
    },
    {
      id: "cookies",
      number: "06",
      title: "Cookies & Tracking",
      icon: Cookie,
    },
    {
      id: "withdrawal",
      number: "07",
      title: "Withdrawal of Consent",
      icon: Settings,
    },
    {
      id: "security",
      number: "08",
      title: "Security",
      icon: LockKeyhole,
    },
    {
      id: "rights",
      number: "09",
      title: "Your Rights & Choices",
      icon: UserRound,
    },
    {
      id: "advertising",
      number: "10",
      title: "Third-Party Advertising",
      icon: Globe2,
    },
    {
      id: "links",
      number: "11",
      title: "Third-Party Websites",
      icon: Globe2,
    },
    {
      id: "grievance",
      number: "12",
      title: "Grievance Address",
      icon: Mail,
    },
    {
      id: "changes",
      number: "13",
      title: "Changes to Privacy Policy",
      icon: FileText,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">

      {/* =====================================================
          HEADER
      ====================================================== */}
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
                Privacy & Security
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
            Privacy Policy
          </div>

        </div>
      </header>


      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="bg-white border-b border-slate-200">

        <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 md:py-20">

          <div className="max-w-4xl">

            {/* Badge */}
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
              <LockKeyhole className="w-3.5 h-3.5" />
              Privacy & Data Protection
            </div>


            {/* Heading */}
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
              Privacy Policy
            </h1>


            {/* Description */}
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
              Your privacy matters. Learn how Fundsarthi collects,
              uses, processes, stores, shares, and protects your
              personal data.
            </p>


            {/* Meta Cards */}
            <div className="mt-8 flex flex-wrap gap-3">

              <div
                className="
                  flex items-center gap-2
                  px-4 py-2.5
                  rounded-xl
                  bg-slate-50
                  border border-slate-200
                  text-sm text-slate-600
                "
              >
                <ShieldCheck className="w-4 h-4" />
                Data Protection
              </div>

              <div
                className="
                  flex items-center gap-2
                  px-4 py-2.5
                  rounded-xl
                  bg-slate-50
                  border border-slate-200
                  text-sm text-slate-600
                "
              >
                <Scale className="w-4 h-4" />
                Applicable Law
              </div>

              <div
                className="
                  flex items-center gap-2
                  px-4 py-2.5
                  rounded-xl
                  bg-slate-50
                  border border-slate-200
                  text-sm text-slate-600
                "
              >
                <LockKeyhole className="w-4 h-4" />
                Secure Processing
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          MAIN
      ====================================================== */}
      <main className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">

        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-10">


          {/* =================================================
              SIDEBAR
          ================================================= */}
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


          {/* =================================================
              CONTENT
          ================================================= */}
          <article className="min-w-0">


            {/* =================================================
                PRIVACY PROMISE
            ================================================= */}
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
                    w-12 h-12
                    rounded-2xl
                    bg-white/10
                    border border-white/10
                    flex items-center justify-center
                  "
                >
                  <ShieldCheck className="w-6 h-6" />
                </div>

                <div>

                  <h2 className="text-xl font-semibold">
                    Your Data. Your Trust. Our Responsibility.
                  </h2>

                  <p
                    className="
                      mt-3
                      text-slate-300
                      leading-7
                    "
                  >
                    Fund Sarthi is committed to protecting the privacy
                    and security of your personal data. This Privacy
                    Policy explains how we collect, receive, use,
                    process, store, disclose, transfer, and protect
                    your personal data when you use our Services.
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                01 INFORMATION
            ================================================= */}
            <div className="space-y-5">

              <Section
                id="information"
                number="01"
                title="Information We Collect"
              >

                <p>
                  To provide and improve our Services, process your
                  applications, comply with applicable legal and
                  regulatory requirements, and enhance your experience,
                  Fund Sarthi may collect, receive, store, process,
                  and use different categories of personal data.
                </p>


                <SubHeading>
                  Information Provided by You
                </SubHeading>

                <BulletList
                  items={[
                    "Full name",
                    "Mobile number",
                    "Email address",
                    "Residential or correspondence address",
                    "City, State and PIN Code",
                    "Date of birth",
                    "PAN, Aadhaar or other government-issued identity details where required and permitted",
                    "Employment, income and financial information",
                    "Bank account and payment-related information",
                    "KYC documents and supporting records",
                    "Loan application details and related documents",
                    "Other information voluntarily submitted by you",
                  ]}
                />


                <SubHeading>
                  Information Collected Automatically
                </SubHeading>

                <BulletList
                  items={[
                    "IP address",
                    "Browser type and version",
                    "Device type and operating system",
                    "Unique device identifiers",
                    "Internet service provider details",
                    "Website usage information",
                    "Date and time of access",
                    "Referring and exit pages",
                    "Clickstream data",
                    "Approximate location information where permitted",
                    "Cookies, pixels, SDKs and similar technologies",
                  ]}
                />


                <SubHeading>
                  Mobile Device Information
                </SubHeading>

                <p>
                  Where you access our Services through a mobile device
                  or mobile application, we may collect limited device
                  information necessary for the proper functioning of
                  our Services.
                </p>


                <Notice>
                  Fund Sarthi does not access or collect photographs,
                  videos, contacts, call logs, SMS messages, microphone,
                  camera, media files, telephony functions, or other
                  sensitive device resources unless specifically required
                  for a requested Service, disclosed in advance, and
                  permitted by applicable law with your consent.
                </Notice>

              </Section>


              {/* =================================================
                  02 USAGE
              ================================================= */}
              <Section
                id="usage"
                number="02"
                title="How We Use Your Information"
              >

                <p>
                  Fund Sarthi processes your personal data solely for
                  lawful purposes and only to the extent necessary for
                  providing its Services, complying with applicable
                  obligations, and improving user experience.
                </p>

                <BulletList
                  items={[
                    "Process enquiries and applications.",
                    "Facilitate loan or financial product applications.",
                    "Verify your identity.",
                    "Assess eligibility for financial products.",
                    "Provide customer support and grievance redressal.",
                    "Comply with contractual and regulatory obligations.",
                    "Send transactional communications and account notifications.",
                    "Provide marketing communications where permitted and consented to.",
                    "Analyse usage and improve Services.",
                    "Provide location-based features where permitted.",
                    "Prevent fraud, identity theft and unauthorized access.",
                    "Engage authorized third-party service providers.",
                    "Maintain account, application and transaction records.",
                  ]}
                />

              </Section>


              {/* =================================================
                  03 CONSENT
              ================================================= */}
              <Section
                id="consent"
                number="03"
                title="Consent & Communication"
              >

                <p>
                  Where required under applicable law, your consent
                  shall be obtained in a free, specific, informed,
                  unconditional, and unambiguous manner before processing
                  your personal data.
                </p>

                <p>
                  Where you provide consent, Fund Sarthi, its authorized
                  representatives, business partners, service providers,
                  lending partners, Banks, NBFCs, and other regulated
                  financial institutions associated with your application
                  may contact you through legally permissible communication
                  channels.
                </p>

                <BulletList
                  items={[
                    "Telephone calls",
                    "SMS messages",
                    "WhatsApp messages",
                    "Email",
                    "In-app notifications",
                    "Interactive Voice Response (IVR)",
                    "Other legally permissible modes of communication",
                  ]}
                />

                <Notice>
                  You may withdraw consent for promotional communications
                  or opt out of marketing communications. Transactional,
                  security-related, regulatory, or necessary service
                  communications may continue.
                </Notice>

              </Section>


              {/* =================================================
                  04 RETENTION
              ================================================= */}
              <Section
                id="retention"
                number="04"
                title="Consent Validity & Data Retention"
              >

                <div
                  className="
                    rounded-2xl
                    bg-slate-50
                    border border-slate-200
                    p-5
                    mb-5
                  "
                >

                  <div className="flex items-center gap-3">

                    <div
                      className="
                        w-10 h-10
                        rounded-xl
                        bg-white
                        border border-slate-200
                        flex items-center justify-center
                      "
                    >
                      <Database className="w-5 h-5" />
                    </div>

                    <div>

                      <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                        Consent validity
                      </p>

                      <p className="text-lg font-bold text-slate-900">
                        180 Days
                      </p>

                    </div>

                  </div>

                </div>

                <p>
                  Your consent for processing your application shall
                  remain valid for a period of one hundred and eighty
                  (180) days from the date of submission of your
                  application or until your application is processed,
                  withdrawn, or otherwise closed, whichever occurs earlier,
                  unless a longer period is required by applicable law
                  or provided with your express consent.
                </p>

                <p>
                  Fund Sarthi retains personal data only for as long as
                  reasonably necessary to fulfil the purposes for which
                  it was collected, including providing Services,
                  processing applications, compliance, accounting,
                  audit, dispute resolution, fraud prevention, and
                  enforcement of legal rights.
                </p>

                <Notice>
                  When personal data is no longer required, it may be
                  securely deleted, anonymized, or irreversibly destroyed
                  in accordance with applicable law and internal policies.
                </Notice>

              </Section>


              {/* =================================================
                  05 SHARING
              ================================================= */}
              <Section
                id="sharing"
                number="05"
                title="Information Sharing"
              >

                <p>
                  Fund Sarthi respects the confidentiality of your
                  personal data and does not sell, rent, trade, or
                  otherwise disclose your personal data to third parties
                  for their independent marketing or commercial purposes.
                </p>

                <p>
                  Your personal data may be disclosed on a need-to-know
                  basis to the following categories of recipients:
                </p>

                <BulletList
                  items={[
                    "Banks, NBFCs, financial institutions and lending partners.",
                    "Technology vendors and authorized service providers.",
                    "Payment service providers.",
                    "KYC verification agencies.",
                    "Credit Information Companies and credit bureaus.",
                    "Account Aggregators.",
                    "Affiliates and group companies where necessary.",
                    "Courts, law enforcement and regulatory authorities where legally required.",
                    "Successor entities in mergers, acquisitions or corporate transactions.",
                  ]}
                />

                <Notice>
                  Personal data shared with third parties is subject to
                  applicable confidentiality, security, and data
                  protection obligations.
                </Notice>

              </Section>


              {/* =================================================
                  06 COOKIES
              ================================================= */}
              <Section
                id="cookies"
                number="06"
                title="Cookies & Tracking Technologies"
              >

                <p>
                  Cookies are small data files stored on your computer
                  that help enhance your experience on our Website.
                  We use both session cookies and persistent cookies.
                </p>


                <div className="grid sm:grid-cols-2 gap-4">

                  <InfoCard
                    icon={Cookie}
                    title="Session Cookies"
                    text="Temporary cookies that expire when you close your browser or log out."
                  />

                  <InfoCard
                    icon={Settings}
                    title="Persistent Cookies"
                    text="Cookies that remain for an extended period and may remember login preferences or settings."
                  />

                </div>


                <p>
                  You can manage cookies through your browser settings.
                  Disabling cookies may prevent certain products or
                  services requiring sign-in from functioning properly.
                </p>

              </Section>


              {/* =================================================
                  07 WITHDRAWAL
              ================================================= */}
              <Section
                id="withdrawal"
                number="07"
                title="Withdrawal of Consent"
              >

                <p>
                  You may withdraw your consent for the processing of
                  your personal data at any time by submitting a request
                  to info@fundsarthi.in or through another mechanism
                  made available by Fund Sarthi.
                </p>

                <p>
                  Withdrawal of consent does not affect the lawfulness
                  of processing carried out before withdrawal.
                </p>

                <Notice>
                  Withdrawal of consent may result in suspension,
                  restriction, or termination of services where processing
                  is necessary to provide those Services.
                </Notice>

                <p>
                  Fund Sarthi may continue to retain certain personal
                  data where retention is required or permitted under
                  applicable law, regulatory requirements, contractual
                  obligations, fraud prevention requirements, dispute
                  resolution, or legal claims.
                </p>

              </Section>


              {/* =================================================
                  08 SECURITY
              ================================================= */}
              <Section
                id="security"
                number="08"
                title="Security of Your Personal Information"
              >

                <p>
                  Fund Sarthi is committed to protecting the
                  confidentiality, integrity, availability, and security
                  of your personal data.
                </p>

                <SubHeading>
                  Our security measures may include
                </SubHeading>

                <BulletList
                  items={[
                    "Encryption of data in transit and at rest where appropriate.",
                    "Least-privilege access controls.",
                    "Authentication mechanisms.",
                    "Firewalls and secure server infrastructure.",
                    "System monitoring.",
                    "Vulnerability assessments.",
                    "Regular security reviews.",
                    "Employee confidentiality obligations.",
                    "Industry-standard information security practices.",
                  ]}
                />

                <Notice>
                  No method of transmission over the Internet or
                  electronic storage system can be guaranteed to be
                  completely secure.
                </Notice>

                <p>
                  You are responsible for maintaining the confidentiality
                  of your account credentials, including username,
                  password, OTP, and other authentication credentials.
                </p>

              </Section>


              {/* =================================================
                  09 RIGHTS
              ================================================= */}
              <Section
                id="rights"
                number="09"
                title="Your Rights & Choices"
              >

                <p>
                  Fund Sarthi is committed to providing transparency
                  and control over the collection, use, and processing
                  of your personal data.
                </p>

                <BulletList
                  items={[
                    "Choose the personal data you provide, subject to mandatory information requirements.",
                    "Withdraw consent where processing is based on consent.",
                    "Request correction or updating of personal information.",
                    "Request erasure or deletion where permissible under applicable law.",
                    "Opt out of promotional communications.",
                    "Manage communication preferences where available.",
                  ]}
                />

                <Notice>
                  Certain information may be mandatory for identity
                  verification, regulatory compliance, and provision
                  of Services.
                </Notice>

              </Section>


              {/* =================================================
                  10 ADVERTISING
              ================================================= */}
              <Section
                id="advertising"
                number="10"
                title="Third-Party Advertisers & Tracking"
              >

                <p>
                  Fund Sarthi may engage third-party advertising
                  networks, analytics providers, marketing partners,
                  and other service providers to display advertisements,
                  measure advertising effectiveness, analyse Website
                  usage, and improve relevance of content and advertising.
                </p>

                <p>
                  These parties may use cookies, web beacons, pixel
                  tags, SDKs, advertising identifiers, and similar
                  technologies.
                </p>

                <BulletList
                  items={[
                    "Measure advertising campaign effectiveness.",
                    "Provide personalized advertisements and content.",
                    "Analyse Website traffic and user behaviour.",
                    "Improve Website and Service performance.",
                    "Prevent fraud, abuse, and unauthorized activities.",
                  ]}
                />

                <Notice>
                  Fund Sarthi does not sell your personal data to third
                  parties for monetary consideration.
                </Notice>

              </Section>


              {/* =================================================
                  11 LINKS
              ================================================= */}
              <Section
                id="links"
                number="11"
                title="Third-Party Websites"
              >

                <p>
                  The Website may contain links to websites, mobile
                  applications, or online services operated by third
                  parties, including Banks, NBFCs, insurance companies,
                  payment service providers, business partners,
                  advertisers, and other external providers.
                </p>

                <p>
                  These links are provided for convenience and do not
                  constitute an endorsement or approval by Fund Sarthi.
                </p>

                <Notice>
                  Fund Sarthi does not control and is not responsible
                  for the content, security, availability, or privacy
                  practices of third-party websites or services.
                </Notice>

              </Section>


              {/* =================================================
                  12 GRIEVANCE
              ================================================= */}
              <section
                id="grievance"
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
                      shrink-0
                      w-12 h-12
                      rounded-2xl
                      bg-slate-950
                      text-white
                      flex items-center justify-center
                    "
                  >
                    <Mail className="w-5 h-5" />
                  </div>

                  <div className="flex-1">

                    <div className="flex items-center gap-3">

                      <span className="text-sm font-bold text-slate-400">
                        12
                      </span>

                      <h2
                        className="
                          text-2xl
                          md:text-3xl
                          font-bold
                          tracking-tight
                        "
                      >
                        Grievance Address
                      </h2>

                    </div>


                    <p className="mt-5 text-[15px] leading-7 text-slate-600">
                      If you have questions, concerns, requests, or
                      complaints regarding this Privacy Policy or the
                      collection, use, processing, disclosure, retention,
                      or security of your personal data, you may contact
                      Fund Sarthi using the details below.
                    </p>


                    <div className="mt-7 grid gap-4">

                      {/* Grievance Officer */}
                      <div
                        className="
                          rounded-2xl
                          bg-slate-50
                          border border-slate-200
                          p-5
                        "
                      >

                        <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                          Grievance Officer
                        </p>

                        <p className="mt-2 font-semibold text-slate-900">
                          Fund Sarthi
                        </p>

                        <div className="mt-4 flex items-start gap-3">

                          <Mail className="w-4 h-4 mt-1 text-slate-400" />

                          <div>
                            <p className="text-xs text-slate-400">
                              Email
                            </p>

                            <p className="text-sm font-medium text-slate-800">
                              info@fundsarthi.in
                            </p>
                          </div>

                        </div>

                      </div>


                      {/* Registered Office */}
                      <div
                        className="
                          rounded-2xl
                          bg-slate-50
                          border border-slate-200
                          p-5
                        "
                      >

                        <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                          Registered Office
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          P-66, Ashiyana Block,
                          <br />
                          Sector-48, Gurgaon-1222018
                        </p>

                      </div>


                      {/* Communication Address */}
                      <div
                        className="
                          rounded-2xl
                          bg-slate-50
                          border border-slate-200
                          p-5
                        "
                      >

                        <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                          Communication Address
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          270B, Tower-B1,
                          <br />
                          Spaze Itech Park,
                          <br />
                          Sector-49, Sohna Road,
                          <br />
                          Gurgaon-1222018
                        </p>

                      </div>

                    </div>


                    <Notice>
                      Fund Sarthi shall acknowledge and endeavour to
                      resolve grievances or requests within the timelines
                      prescribed under applicable law.
                    </Notice>

                  </div>

                </div>

              </section>


              {/* =================================================
                  13 CHANGES
              ================================================= */}
              <Section
                id="changes"
                number="13"
                title="Changes to This Privacy Policy"
              >

                <p>
                  Fund Sarthi reserves the right to amend, modify,
                  update, or revise this Privacy Policy from time to
                  time to reflect changes in applicable laws,
                  regulations, regulatory directions, industry standards,
                  technology, business operations, or the manner in
                  which personal data is processed.
                </p>

                <p>
                  Changes become effective upon publication on the
                  Website unless otherwise specified.
                </p>

                <Notice>
                  Where required under applicable law, Fund Sarthi may
                  notify users of material changes through email, SMS,
                  in-app notifications, or other appropriate means.
                </Notice>

              </Section>


              {/* =================================================
                  EFFECTIVE DATE
              ================================================= */}
              <div
                className="
                  rounded-3xl
                  border border-slate-200
                  bg-white
                  p-7 md:p-10
                  shadow-sm
                "
              >

                <div className="flex items-start gap-4">

                  <div
                    className="
                      w-11 h-11
                      rounded-2xl
                      bg-slate-100
                      flex items-center justify-center
                      shrink-0
                    "
                  >
                    <FileText className="w-5 h-5 text-slate-600" />
                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-slate-900">
                      Policy Dates
                    </h2>

                    <div className="mt-4 grid sm:grid-cols-2 gap-4">

                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                          Effective Date
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                          29/08/2026
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                          Last Updated
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                          29/08/2026
                        </p>
                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </article>

        </div>

      </main>


      {/* =====================================================
          FOOTER
      ====================================================== */}
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

          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Privacy & Data Protection
          </span>

        </div>

      </footer>

    </div>
  );
}


/* =========================================================
   SECTION COMPONENT
========================================================= */

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

        {/* Number */}
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


        {/* Content */}
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


/* =========================================================
   SUB HEADING
========================================================= */

function SubHeading({ children }) {
  return (
    <h3
      className="
        pt-3
        text-sm
        font-bold
        uppercase
        tracking-wider
        text-slate-800
      "
    >
      {children}
    </h3>
  );
}


/* =========================================================
   BULLET LIST
========================================================= */

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


/* =========================================================
   NOTICE
========================================================= */

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


/* =========================================================
   INFO CARD
========================================================= */

function InfoCard({
  icon: Icon,
  title,
  text,
}) {
  return (
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
          w-10 h-10
          rounded-xl
          bg-white
          border border-slate-200
          flex items-center justify-center
        "
      >
        <Icon className="w-5 h-5 text-slate-600" />
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>

    </div>
  );
}