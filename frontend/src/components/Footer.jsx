import React from "react";
import siteImages from "../config/siteImages";
import { useSiteData, assetUrl } from "../utils/siteData";
export default function Footer(){
 const { data, ready } = useSiteData();
 const logo = data?.settings?.logo_path ? assetUrl(data.settings.logo_path) : ready ? siteImages.logo : "";
 const siteName = data?.settings?.site_name || "Your School Website";
 return <footer id="contact" className="site-footer"><div className="footer-main">
 {logo ? <img src={logo} alt="School logo"/> : <span/>}<div><h3>Explore</h3><a href="#ryan-group">About Us</a><a href="#curriculum">Academics</a><a href="#admissions">Admissions</a></div>
 <div><h3>Quick Links</h3><a href="#sports">Student Life</a><a href="#parent-resources">Parents Corner</a><a href="#alumni-network">Alumni Connect</a></div>
 <div><h3>Contact</h3><a href="tel:7600800500">7600800500</a><a href="#admissions">Enquire Now</a></div>
 </div><div className="footer-bottom">© {new Date().getFullYear()} {siteName}. All rights reserved.</div></footer>}
