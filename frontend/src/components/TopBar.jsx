import React from "react";
import { Link } from "react-router-dom";
import { useCurrentSchool, enquiryUrl } from "../utils/currentSchool";

export default function TopBar() {
  // On a school page the offer link opens the enquiry form for that school
  const school = useCurrentSchool();

  return (
    <div className="topbar">
      <div className="topbar-inner">

        <a href="tel:7600800500">7600800500</a>

        {school ? (
          <Link className="top-offer" to={enquiryUrl(school)}>
            Enquire Now for Early Bird Benefits
          </Link>
        ) : (
          <a className="top-offer" href="#admissions">
            Enquire Now for Early Bird Benefits
          </a>
        )}

        <a className="top-admission" href="#admissions">
          Delhi Admission
        </a>

        <div className="social-icons">
          <a href="#"><i className="fab fa-facebook-f"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
          <a href="#"><i className="fab fa-linkedin-in"></i></a>
          <a href="#"><i className="fab fa-x-twitter"></i></a>
          <a href="#" target="_blank" rel="noreferrer">
            <i className="fab fa-youtube"></i>
          </a>
        </div>

      </div>
    </div>
  );
}
