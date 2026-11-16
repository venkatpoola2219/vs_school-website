
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import TopBar from "./components/TopBar";
import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import Footer from "./components/Footer";

import Enquiry from "./sections/Enquiry";
import EducationSection from "./sections/EducationSection";


import WebsiteDetailPage from "./pages/WebsiteDetailPage";
import NewWebsite from "./NewWebsite";
import AdminPanel from "./admin/AdminPanel";
import CmsPage from "./pages/CmsPage";

function HomePage() {
    return (
        <>
            <TopBar />

            <div className="hero-shell">
                <Navbar />
                <HeroSlider />
               
            </div>

            <main>
                 {/* <AcademicsPage />
                <AdmissionsPage />
                <StudentLifePage />
                <ParentsPage />
                <AlumniPage /> */}
                 <EducationSection /> 
                 <Enquiry /> 
            </main>

            <Footer />
        </>
    );
}

function InnerPageLayout() {
    return (
        <>
            <TopBar />

            <div className="hero-shell">
                <Navbar />
            </div>

            <main>
                <WebsiteDetailPage />
            </main>

            <Footer />
        </>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/page/:slug" element={<CmsPage />} />

                <Route path="/" element={<HomePage />} />

                <Route
                    path="/:section/:slug"
                    element={<InnerPageLayout />}
                />

               <Route path="/:board/:city/:school" element={<NewWebsite />} />

            </Routes>
        </BrowserRouter>
    );
}
