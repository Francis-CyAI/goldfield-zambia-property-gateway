
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "./contexts/AuthContext";
import { LocalizationProvider } from "./contexts/LocalizationContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PropertyOwnerDashboard from "./pages/PropertyOwnerDashboard";
import RealEstateServicesDashboard from "./pages/RealEstateServicesDashboard";
import UserDashboard from "./components/UserDashboard";
import Bookings from "./pages/Bookings";
import ListProperty from "./pages/ListProperty";
import Partners from "./pages/Partners";
import Subscription from "./pages/Subscription";
import News from "./pages/News";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LocalizationProvider>
        <AuthContextProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<Home />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/property/:id" element={<PropertyDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/property-owner-dashboard" element={<PropertyOwnerDashboard />} />
                <Route path="/real-estate-services" element={<RealEstateServicesDashboard />} />
                <Route path="/user-dashboard" element={<UserDashboard />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/list-property" element={<ListProperty />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/news" element={<News />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </AuthContextProvider>
      </LocalizationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
