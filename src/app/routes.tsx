import { createBrowserRouter, Navigate } from "react-router";

// Auth Screens
import Login from "./screens/auth/Login";
import OTPVerification from "./screens/auth/OTPVerification";

// Main Screens
import Home from "./screens/home/Home";
import LoanCategories from "./screens/loan/LoanCategories";
import LoanApplication from "./screens/loan/LoanApplication";
import ApplicationSuccess from "./screens/loan/ApplicationSuccess";
import TrackApplication from "./screens/loan/TrackApplication";

// Calculators
import EMICalculator from "./screens/calculators/EMICalculator";
import EligibilityCalculator from "./screens/calculators/EligibilityCalculator";
import CreditScoreEstimator from "./screens/calculators/CreditScoreEstimator";

// Property
import PropertyListing from "./screens/property/PropertyListing";
import PropertyDetail from "./screens/property/PropertyDetail";
import ListYourProperty from "./screens/property/ListYourProperty";
import PropertySubmitSuccess from "./screens/property/PropertySubmitSuccess";
import Wishlist from "./screens/profile/Wishlist";

// Vastu
import VastuHome from "./screens/vastu/VastuHome";
import ExpertDetail from "./screens/vastu/ExpertDetail";
import BookingConfirmation from "./screens/vastu/BookingConfirmation";
import ConsultantApplication from "./screens/vastu/ConsultantApplication";
import BookConsultation from "./screens/vastu/BookConsultation";

// Consultant
import ConsultantLogin from "./screens/consultant/ConsultantLogin";
import ConsultantDashboard from "./screens/consultant/ConsultantDashboard";
import BookingDetail from "./screens/consultant/BookingDetail";
import SlotManagement from "./screens/consultant/SlotManagement";
import TrackConsultation from "./screens/vastu/TrackConsultation";

// Others
import BecomePartner from "./screens/partner/BecomePartner";
import Profile from "./screens/profile/Profile";
import MyApplications from "./screens/profile/MyApplications";
import MyBookings from "./screens/profile/MyBookings";
import Notifications from "./screens/profile/Notifications";
import Settings from "./screens/profile/Settings";
import MyConsultations from "./screens/profile/MyConsultations";
import Activities from "./screens/profile/Activities";
import MyProperties from "./screens/property/MyProperties";
import Terms from "./screens/profile/Terms";
import ContactHelp from "./screens/profile/ContactHelp";
import PrivacyPolicy from "./screens/profile/PrivacyPolicy.tsx";
import AboutUs from "./screens/profile/AboutUs.tsx";
import ManageSlots from "./screens/vastu/ManageSlots";
import TermsConditions from "./screens/profile/TermsConditions";


// =======================
// 🔐 AUTH CHECK
// =======================
const isLoggedIn = () => {
  return localStorage.getItem("isLoggedIn") === "true";
};


// =======================
// 🔐 PROTECTED ROUTE
// =======================
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  return isLoggedIn() ? children : <Navigate to="/" />;
};


// =======================
// 🚀 ROUTER
// =======================
export const router = createBrowserRouter([

  // 🔓 PUBLIC ROUTES
  {
    path: "/",
    element: isLoggedIn() ? <Navigate to="/home" /> : <Login />,
  },
  {
    path: "/otp",
    element: <OTPVerification />,
  },
  // 🔐 PROTECTED ROUTES
  {
    path: "/home",
    element: (
      <PrivateRoute>
        <Home />
      </PrivateRoute>
    ),
  },
  {
    path: "/loans",
    element: (
      <PrivateRoute>
        <LoanCategories />
      </PrivateRoute>
    ),
  },
  {
    path: "/loan-application/:type",
    element: (
      <PrivateRoute>
        <LoanApplication />
      </PrivateRoute>
    ),
  },
  {
    path: "/application-success/:id",
    element: (
      <PrivateRoute>
        <ApplicationSuccess />
      </PrivateRoute>
    ),
  },
  {
    path: "/track-application/:id",
    element: (
      <PrivateRoute>
        <TrackApplication />
      </PrivateRoute>
    ),
  },

  // Calculators
  {
    path: "/calculator/emi",
    element: (
      <PrivateRoute>
        <EMICalculator />
      </PrivateRoute>
    ),
  },
  {
    path: "/calculator/eligibility",
    element: (
      <PrivateRoute>
        <EligibilityCalculator />
      </PrivateRoute>
    ),
  },
  {
    path: "/calculator/credit-score",
    element: (
      <PrivateRoute>
        <CreditScoreEstimator />
      </PrivateRoute>
    ),
  },

  // Property
  {
    path: "/property",
    element: (
      <PrivateRoute>
        <PropertyListing />
      </PrivateRoute>
    ),
  },
  {
    path: "/property/:id",
    element: (
      <PrivateRoute>
        <PropertyDetail />
      </PrivateRoute>
    ),
  },
  {
    path: "/property/list-your-property",
    element: (
      <PrivateRoute>
        <ListYourProperty />
      </PrivateRoute>
    ),
  },
  {
    path: "/property/submit-success/:id",
    element: (
      <PrivateRoute>
        <PropertySubmitSuccess />
      </PrivateRoute>
    ),
  },
  {
    path: "/my-properties",
    element: (
      <PrivateRoute>
        <MyProperties />
      </PrivateRoute>
    ),
  },
  {
    path: "/wishlist",
    element: (
      <PrivateRoute>
        <Wishlist />
      </PrivateRoute>
    ),
  },

  // Vastu
  {
    path: "/vastu",
    element: (
      <PrivateRoute>
        <VastuHome />
      </PrivateRoute>
    ),
  },
  {
    path: "/vastu/expert/:id",
    element: (
      <PrivateRoute>
        <ExpertDetail />
      </PrivateRoute>
    ),
  },
  {
    path: "/vastu/booking-confirmation",
    element: (
      <PrivateRoute>
        <BookingConfirmation />
      </PrivateRoute>
    ),
  },
  {
    path: "/vastu/apply-consultant",
    element: (
      <PrivateRoute>
        <ConsultantApplication />
      </PrivateRoute>
    ),
  },
  {
  path: "/manage-slots",
    element: (
      <PrivateRoute>
        <ManageSlots />
      </PrivateRoute>
    ),
  },

  // Consultant
  {
    path: "/consultant/login",
    element: <ConsultantLogin />,
  },
  {
    path: "/consultant/dashboard",
    element: (
      <PrivateRoute>
        <ConsultantDashboard />
      </PrivateRoute>
    ),
  },
  {
    path: "/consultant/booking/:id",
    element: (
      <PrivateRoute>
        <BookingDetail />
      </PrivateRoute>
    ),
  },
  {
    path: "/consultant/slots",
    element: (
      <PrivateRoute>
        <SlotManagement />
      </PrivateRoute>
    ),
  },

  // Profile & Others
  {
    path: "/become-partner",
    element: (
      <PrivateRoute>
        <BecomePartner />
      </PrivateRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <PrivateRoute>
        <Profile />
      </PrivateRoute>
    ),
  },
  {
    path: "/my-applications",
    element: (
      <PrivateRoute>
        <MyApplications />
      </PrivateRoute>
    ),
  },
  {
    path: "/activities",
    element: (
      <PrivateRoute>
        <Activities />
      </PrivateRoute>
    ),
  },
  {
    path: "/my-bookings",
    element: (
      <PrivateRoute>
        <MyBookings />
      </PrivateRoute>
    ),
  },
  {
    path: "/my-consultations",
    element: (
      <PrivateRoute>
        <MyConsultations />
      </PrivateRoute>
    ),
  },
  {
    path: "/track-consultation/:id",
    element: (
      <PrivateRoute>
        <TrackConsultation />
      </PrivateRoute>
    ),
  },
  {
    path: "/notifications",
    element: (
      <PrivateRoute>
        <Notifications />
      </PrivateRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <PrivateRoute>
        <Settings />
      </PrivateRoute>
    ),
  },
  {
  path: "/terms",
  element: (
    <PrivateRoute>
      <Terms />
    </PrivateRoute>
  ),
},

{
  path: "/contact-help",
  element: (
    <PrivateRoute>
      <ContactHelp />
    </PrivateRoute>
  ),
},
{
  path: "/privacy-policy",
  element: (
    <PrivateRoute>
      <PrivacyPolicy />
    </PrivateRoute>
  ),
},

{
  path: "/about-us",
  element: (
    <PrivateRoute>
      <AboutUs />
    </PrivateRoute>
  ),
},

{
  path: "/terms-conditions",
  element: (
    <PrivateRoute>
      <TermsConditions />
    </PrivateRoute>
  ),
},

{
  path: "/vastu/book-consultation/:id",
  element: (
    <PrivateRoute>
      <BookConsultation />
    </PrivateRoute>
  ),
},

]);