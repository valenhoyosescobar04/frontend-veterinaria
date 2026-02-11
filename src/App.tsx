import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/Layout/ProtectedRoute";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { OwnerLayout} from "@/components/Layout/OwnerLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Owners from "./pages/Owners";
import Appointments from "./pages/Appointments";
import MedicalRecords from "./pages/MedicalRecords";
import Prescriptions from "./pages/Prescriptions";
import Inventory from "./pages/Inventory";
import Services from "./pages/Services";
import InformedConsents from "./pages/InformedConsents";
import Agenda from "./pages/Agenda";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import OwnerMyAppointments from "./pages/owner/OwnerMyAppointments";
import OwnerBookAppointment from "./pages/owner/OwnerBookAppointment";
import OwnerMyPets from "./pages/owner/OwnerMyPets";
import OwnerAvailableServices from "./pages/owner/OwnerAvailableServices";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                    <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />

                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout>
                                        <Dashboard />
                                    </DashboardLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/patients"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout>
                                        <Patients />
                                    </DashboardLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/owners"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout>
                                        <Owners />
                                    </DashboardLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/appointments"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout>
                                        <Appointments />
                                    </DashboardLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/medical-records"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout>
                                        <MedicalRecords />
                                    </DashboardLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/prescriptions"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout>
                                        <Prescriptions />
                                    </DashboardLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/inventory"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout>
                                        <Inventory />
                                    </DashboardLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/services"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout>
                                        <Services />
                                    </DashboardLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/informed-consents"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout>
                                        <InformedConsents />
                                    </DashboardLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/agenda"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout>
                                        <Agenda />
                                    </DashboardLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/reports"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout>
                                        <Reports />
                                    </DashboardLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/users"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout>
                                        <Users />
                                    </DashboardLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout>
                                        <Settings />
                                    </DashboardLayout>
                                </ProtectedRoute>
                            }
                        />

                        {/* Owner Routes */}
                        <Route
                            path="/owner/appointments"
                            element={
                                <ProtectedRoute>
                                    <OwnerLayout>
                                        <OwnerMyAppointments />
                                    </OwnerLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/owner/book-appointment"
                            element={
                                <ProtectedRoute>
                                    <OwnerLayout>
                                        <OwnerBookAppointment />
                                    </OwnerLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/owner/pets"
                            element={
                                <ProtectedRoute>
                                    <OwnerLayout>
                                        <OwnerMyPets />
                                    </OwnerLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/owner/services"
                            element={
                                <ProtectedRoute>
                                    <OwnerLayout>
                                        <OwnerAvailableServices />
                                    </OwnerLayout>
                                </ProtectedRoute>
                            }
                        />

                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </AuthProvider>
    </QueryClientProvider>
);

export default App;