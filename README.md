# Fundsarthi - Fintech Lead Generation Platform

A comprehensive mobile-first fintech lead generation platform with multiple modules including loan applications, real estate listings, vastu consultations with booking system, calculators, and partner onboarding.

## Design System

- **Primary Color**: Teal (#0F766E)
- **Accent Color**: Soft Gold (#D4AF37)
- **Background**: #F9FAFB
- **Card Background**: White
- **Typography**: Inter (body), Poppins (headings)
- **Border Radius**: 16-20px
- **Mobile Size**: 360x800px

## Features

### 1. Authentication Flow
- Login with mobile number
- OTP verification
- Profile setup

### 2. Home Dashboard
- Loan approval readiness indicator
- Quick actions grid
- Loan journey tracker
- Financial calculators access

### 3. Loan Module
- Multiple loan categories (Home, Personal, Car, Education, Business, Credit Card)
- Loan application form with progress tracking
- Application success confirmation
- Track application status with timeline

### 4. Calculators
- **EMI Calculator**: Calculate monthly payments with interactive sliders
- **Eligibility Calculator**: Check loan eligibility based on income
- **Credit Score Estimator**: Estimate credit score with visual gauge

### 5. Real Estate Module
- Property listings with Buy/Sell/Rent tabs
- Property detail view with amenities
- Partner contact information
- Site visit scheduling

### 6. Vastu Consultation (with Booking System)
- **User Flow**:
  - Browse vastu experts with filters
  - View expert profiles with ratings
  - Select date and time slots
  - Book consultation
  - Booking confirmation with details

### 7. Consultant Dashboard (Separate Portal)
- Consultant login
- Dashboard with today's and upcoming bookings
- Booking detail view with client information
- Slot management with calendar
- Add/edit/block time slots

### 8. Partner Onboarding
- Partner application form
- Service type selection (Loan DSA, Real Estate, Vastu)
- Benefits showcase

### 9. Profile Management
- User profile with personal details
- My Applications tracker
- My Vastu Bookings
- Settings and logout

## Navigation Structure

```
/                           → Login
/otp                        → OTP Verification
/profile-setup              → Profile Setup
/home                       → Home Dashboard (with bottom nav)
/loans                      → Loan Categories
/loan-application/:type     → Loan Application Form
/application-success        → Application Success
/track-application/:id      → Track Application Status
/calculator/emi             → EMI Calculator
/calculator/eligibility     → Eligibility Calculator
/calculator/credit-score    → Credit Score Estimator
/property                   → Property Listing
/property/:id               → Property Detail
/vastu                      → Vastu Experts Listing
/vastu/expert/:id           → Expert Detail with Booking
/vastu/booking-confirmation → Booking Confirmation
/consultant/login           → Consultant Login
/consultant/dashboard       → Consultant Dashboard
/consultant/booking/:id     → Booking Detail
/consultant/slots           → Slot Management
/become-partner             → Partner Application
/profile                    → User Profile
/my-applications            → My Loan Applications
/my-bookings                → My Vastu Bookings
```

## Key Components

- **BottomNav**: Main navigation for user flow (Home, Loans, Property, Vastu, Profile)
- **Interactive Sliders**: For calculators
- **Date Picker**: For vastu booking
- **Time Slot Grid**: Available consultation times
- **Progress Indicators**: For loan applications
- **Status Badges**: Application and booking statuses
- **Calendar Grid**: For consultant slot management

## User Flows

1. **Loan Application Flow**: Home → Loans → Application Form → Success → Track
2. **Vastu Booking Flow**: Home/Vastu → Expert List → Expert Detail → Select Date/Time → Book → Confirmation
3. **Consultant Flow**: Consultant Login → Dashboard → View Bookings → Manage Slots
4. **Property Flow**: Home/Property → Listing → Property Detail → Contact Partner

## Technologies

- React with TypeScript
- React Router (Data mode)
- Tailwind CSS v4
- Radix UI components
- Lucide React icons
- Recharts (if needed for visualizations)
