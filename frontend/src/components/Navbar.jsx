
import React, { useEffect, useState } from "react";
import siteImages from "../config/siteImages";
import { Link, useLocation } from "react-router-dom";
import api from "../api";
import { defaultNavItems } from "./defaultMenus";




export default function Navbar() {

    const [mobile, setMobile] = useState(false);
    const [active, setActive] = useState("");
    const [scrolled, setScrolled] = useState(false);
    const [logo, setLogo] = useState(siteImages.logo);
    const [navItems, setNavItems] = useState(defaultNavItems);

    const location = useLocation();

    useEffect(() => {
        api.get("/site-data").then(({data}) => {
            if (data.settings?.logo_path) setLogo(data.settings.logo_path.startsWith("http") ? data.settings.logo_path : `${api.defaults.baseURL.replace("/api", "")}${data.settings.logo_path}`);
            if (data.menus?.length) {
                const grouped = new Map();
                data.menus.forEach(item => { if (!grouped.has(item.parent_label)) grouped.set(item.parent_label, []); grouped.get(item.parent_label).push([item.label, item.url]); });
                setNavItems(Array.from(grouped.entries()));
            }
        }).catch(() => {});
    }, []);

    useEffect(() => {
        setMobile(false);
        setActive("");
        window.scrollTo(0, 0);
    }, [location.pathname]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={`site-header ${location.pathname !== "/" ? "inner-page-header" : ""} ${scrolled ? "is-scrolled" : ""}`}>

            <Link className="school-logo" to="/">
                <img src={logo} alt="School Logo" />
            </Link>

            <nav className={`main-navigation ${mobile ? "is-open" : ""}`}>

                {navItems.map(([label, links]) => (
                    <div
                        className={`nav-item ${active === label ? "mobile-active" : ""}`}
                        key={label}
                    >

                        <button
                            type="button"
                            className="nav-link"
                            onClick={() =>
                                setActive(active === label ? "" : label)
                            }
                        >
                            {label}
                            <span className="chevron">⌄</span>
                        </button>

                        <div className="mega-menu">

                            <h3>{label}</h3>

                            {links.map(([text, path]) => (
                                <Link
                                    key={text}
                                    to={path}
                                    onClick={() => {
                                        setMobile(false);
                                        setActive("");
                                    }}
                                >
                                    {text}
                                    <span>›</span>
                                </Link>
                            ))}

                        </div>

                    </div>
                ))}

            </nav>

            <button
                type="button"
                className="menu-toggle"
                onClick={() => setMobile(!mobile)}
                aria-label="Toggle Menu"
                aria-expanded={mobile}
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

        </header>
    );
}
