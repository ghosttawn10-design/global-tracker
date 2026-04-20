import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Track from "@/pages/Track";
import Analytics from "@/pages/Analytics";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminShipments from "@/pages/AdminShipments";
import AdminAnalytics from "@/pages/AdminAnalytics";
import AdminContacts from "@/pages/AdminContacts";
import AdminTestimonials from "@/pages/AdminTestimonials";
import AdminSettings from "@/pages/AdminSettings";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import CookiesPage from "@/pages/Cookies";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/admin/login" />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={() => <MainLayout><Home /></MainLayout>} />
      <Route path="/track" component={() => <MainLayout><Track /></MainLayout>} />
      <Route path="/analytics" component={() => <MainLayout><Analytics /></MainLayout>} />
      <Route path="/contact" component={() => <MainLayout><Contact /></MainLayout>} />
      <Route path="/privacy" component={() => <MainLayout><Privacy /></MainLayout>} />
      <Route path="/terms" component={() => <MainLayout><Terms /></MainLayout>} />
      <Route path="/cookies" component={() => <MainLayout><CookiesPage /></MainLayout>} />

      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={() => <ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      <Route path="/admin/shipments" component={() => <ProtectedAdminRoute><AdminShipments /></ProtectedAdminRoute>} />
      <Route path="/admin/analytics" component={() => <ProtectedAdminRoute><AdminAnalytics /></ProtectedAdminRoute>} />
      <Route path="/admin/contacts" component={() => <ProtectedAdminRoute><AdminContacts /></ProtectedAdminRoute>} />
      <Route path="/admin/testimonials" component={() => <ProtectedAdminRoute><AdminTestimonials /></ProtectedAdminRoute>} />
      <Route path="/admin/settings" component={() => <ProtectedAdminRoute><AdminSettings /></ProtectedAdminRoute>} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
