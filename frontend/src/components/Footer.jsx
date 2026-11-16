import React from "react";
import siteImages from "../config/siteImages";
export default function Footer(){return <footer id="contact" className="site-footer"><div className="footer-main">
 <img src={siteImages.logo} alt="School logo"/><div><h3>Explore</h3><a href="#ryan-group">About Us</a><a href="#curriculum">Academics</a><a href="#admissions">Admissions</a></div>
 <div><h3>Quick Links</h3><a href="#sports">Student Life</a><a href="#parent-resources">Parents Corner</a><a href="#alumni-network">Alumni Connect</a></div>
 <div><h3>Contact</h3><a href="tel:7600800500">7600800500</a><a href="#admissions">Enquire Now</a></div>
 </div><div className="footer-bottom">© {new Date().getFullYear()} Your School Website. Update with your institution details.</div></footer>}
