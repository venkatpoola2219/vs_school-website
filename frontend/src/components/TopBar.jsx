import React from "react";

export default function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-inner">

        <a href="tel:7600800500">7600800500</a>

        <a className="top-offer" href="#admissions">
          Enquire Now for Early Bird Benefits
        </a>

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
