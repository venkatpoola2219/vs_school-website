
import React, { useEffect, useMemo, useState } from "react";
import siteImages from "../config/siteImages";
import { Link, useLocation } from "react-router-dom";
import { useSiteData, assetUrl } from "../utils/siteData";
import { useCurrentSchool, enquiryUrl, ENQUIRY_PATH } from "../utils/currentSchool";
import { defaultNavItems } from "./defaultMenus";




// true on desktop with a mouse: menus open on hover. false on phones/touch: menus open on tap.
const canHover = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (min-width: 701px)").matches;

export default function Navbar() {

    const [mobile, setMobile] = useState(false);
    const [active, setActive] = useState("");
    const [scrolled, setScrolled] = useState(false);
    const { data, ready } = useSiteData();
    const currentSchool = useCurrentSchool();

    // Show the admin logo. Until we know it, show nothing (not the old default logo).
    const logo = data?.settings?.logo_path
        ? assetUrl(data.settings.logo_path)
        : ready ? siteImages.logo : "";

    const navItems = useMemo(() => {
        if (!data?.menus?.length) return defaultNavItems;
        const grouped = new Map();
        data.menus.forEach(item => {
            if (!grouped.has(item.parent_label)) grouped.set(item.parent_label, []);
            grouped.get(item.parent_label).push([item.label, item.url]);
        });
        return Array.from(grouped.entries());
    }, [data]);

    const location = useLocation();

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
                {logo && <img src={logo} alt="School Logo" />}
            </Link>

            <nav className={`main-navigation ${mobile ? "is-open" : ""}`}>

                {navItems.map(([label, links]) => (
                    <div
                        className={`nav-item ${active === label ? "mobile-active" : ""}`}
                        key={label}
                        onMouseEnter={() => canHover() && setActive(label)}
                        onMouseLeave={() => canHover() && setActive("")}
                        onBlur={(e) => {
                            // close when keyboard focus leaves this menu item
                            if (!e.currentTarget.contains(e.relatedTarget)) {
                                setActive((cur) => (cur === label ? "" : cur));
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") setActive("");
                        }}
                    >

                        <button
                            type="button"
                            className="nav-link"
                            aria-expanded={active === label}
                            onClick={() =>
                                canHover()
                                    ? setActive(label)
                                    : setActive(active === label ? "" : label)
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
                                    to={path === ENQUIRY_PATH ? enquiryUrl(currentSchool) : path}
                                    onClick={() => {
                                        setMobile(false);
                                        setActive("");
                                        if (document.activeElement) document.activeElement.blur();
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
