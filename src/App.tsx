
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LocalizationProvider } from "./contexts/LocalizationContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertiesForSale from "./pages/PropertiesForSale";
import PropertiesForRent from "./pages/PropertiesForRent";
import PropertyDetail from "./pages/PropertyDetail";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PropertyOwnerDashboard from "./pages/PropertyOwnerDashboard";
import RealEstateServicesDashboard from "./pages/RealEstateServicesDashboard";
import UserDashboard from "./components/UserDashboard";
import Bookings from "./pages/Bookings";
import ListProperty from "./pages/ListProperty";
import Partners from "./pages/Partners";
import Subscription from "./pages/Subscription";
import News from "./pages/News";
import FAQSection from "./components/FAQSection";
import Setup from "./pages/Setup";
import NotFound from "./pages/NotFound";
import AdminRoute from "./components/routes/AdminRoute";
import Notifications from "./pages/Notifications";
import Suggestions from "./pages/Suggestions";
import AiAssistant from "./pages/AiAssistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LocalizationProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<Home />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/sale" element={<PropertiesForSale />} />
                <Route path="/properties/rent" element={<PropertiesForRent />} />
                <Route path="/property/:id" element={<PropertyDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQSection />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route path="/property-owner-dashboard" element={<PropertyOwnerDashboard />} />
                <Route path="/real-estate-services" element={<RealEstateServicesDashboard />} />
                <Route path="/user-dashboard" element={<UserDashboard />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/list-property" element={<ListProperty />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/news" element={<News />} />
                <Route path="/assistant" element={<AiAssistant />} />
                <Route path="/suggestions" element={<Suggestions />} />
                <Route path="/setup" element={<Setup />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </AuthProvider>
      </LocalizationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
