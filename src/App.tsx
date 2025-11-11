import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Interns from "./pages/Interns";
import Certificates from "./pages/Certificates";
import Reports from "./pages/analytics/Reports";
import Performance from "./pages/analytics/Performance";
import Insights from "./pages/analytics/Insights";
import Departments from "./pages/management/Departments";
import Roles from "./pages/management/Roles";
import Permissions from "./pages/management/Permissions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/interns" element={<Interns />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/analytics/reports" element={<Reports />} />
              <Route path="/analytics/performance" element={<Performance />} />
              <Route path="/analytics/insights" element={<Insights />} />
              <Route path="/management/departments" element={<Departments />} />
              <Route path="/management/roles" element={<Roles />} />
              <Route path="/management/permissions" element={<Permissions />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
