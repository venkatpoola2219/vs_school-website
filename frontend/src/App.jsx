
import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import TopBar from "./components/TopBar";
import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import Footer from "./components/Footer";

import Enquiry from "./sections/Enquiry";
import EducationSection from "./sections/EducationSection";

import WebsiteDetailPage from "./pages/WebsiteDetailPage";
import SchoolPage from "./pages/SchoolPage";
import AdminPanel from "./admin/AdminPanel";
import CmsPage from "./pages/CmsPage";

// Common website layout
function WebsiteLayout() {
    return (
        <>
            <TopBar />

            <div className="hero-shell">
                <Navbar />
            </div>

            <main>
                <Outlet />
            </main>

            <Footer />
        </>
    );
}

// Home page
function HomePage() {
    return (
        <>
            <div className="hero-shell">
                <HeroSlider />
            </div>

            <EducationSection />
            <Enquiry />
        </>
    );
}

// Inner page
function InnerPage() {
    return <WebsiteDetailPage />;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Admin - No Header/Footer */}
                <Route path="/admin" element={<AdminPanel />} />

                {/* School website common layout */}
                <Route element={<WebsiteLayout />}>

                    <Route path="/" element={<HomePage />} />

                    <Route path="/page/:slug" element={<CmsPage />} />

                    <Route
                        path="/:section/:slug"
                        element={<InnerPage />}
                    />

                    {/* School page opened from the home page "Find a school" */}
                    <Route
                        path="/:board/:city/:school"
                        element={<SchoolPage />}
                    />

                </Route>

            </Routes>
        </BrowserRouter>
    );
}
