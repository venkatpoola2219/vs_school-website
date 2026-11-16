import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSlider.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* Custom Dropdown Component */

function FinderDropdown({
  placeholder,
  options,
  value,
  onChange,
  disabled
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div
      className={`mcb-dropdown ${open ? "mcb-dropdown-open" : ""}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className="mcb-dropdown-toggle"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{value || placeholder}</span>
        <span className="mcb-dropdown-arrow"></span>
      </button>

      {open && !disabled && (
        <div className="mcb-dropdown-menu" role="listbox">
          {options.map((item) => (
            <button
              type="button"
              key={item.slug}
              className={`mcb-dropdown-option ${
                value === item.name ? "mcb-option-active" : ""
              }`}
              onClick={() => {
                onChange(item); // pass the whole { name, slug }
                setOpen(false);
              }}
              role="option"
              aria-selected={value === item.name}
            >
              {item.name}
            </button>
          ))}

          {options.length === 0 && (
            <div className="mcb-dropdown-empty">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SchoolFinder() {
  const [boards, setBoards] = useState([]);
  const [cities, setCities] = useState([]);
  const [schools, setSchools] = useState([]);

  const [board, setBoard] = useState(null);   // { name, slug }
  const [city, setCity] = useState(null);
  const [school, setSchool] = useState(null);

  const navigate = useNavigate();

  // Load boards once
  useEffect(() => {
    fetch(`${API}/api/boards`)
      .then((res) => res.json())
      .then(setBoards)
      .catch((err) => console.error("Boards error:", err));
  }, []);

  // Load cities when board changes
  useEffect(() => {
    if (!board) {
      setCities([]);
      return;
    }
    fetch(`${API}/api/cities?board=${board.slug}`)
      .then((res) => res.json())
      .then(setCities)
      .catch((err) => console.error("Cities error:", err));
  }, [board]);

  // Load schools when board + city change
  useEffect(() => {
    if (!board || !city) {
      setSchools([]);
      return;
    }
    fetch(`${API}/api/schools?board=${board.slug}&city=${city.slug}`)
      .then((res) => res.json())
      .then(setSchools)
      .catch((err) => console.error("Schools error:", err));
  }, [board, city]);

  const handleFind = (e) => {
    e.preventDefault();

    if (!board || !city || !school) {
      alert("Please select Board, City and School");
      return;
    }

    navigate(`/${board.slug}/${city.slug}/${school.slug}`);
  };

  return (
    <div className="mcb-school-finder">

      <h2 className="mcb-finder-title">
        Find a school near you!
      </h2>

      <form
        className="mcb-finder-form"
        onSubmit={handleFind}
      >

        <div className="mcb-finder-field">
          <FinderDropdown
            placeholder="Select Board"
            options={boards}
            value={board?.name}
            onChange={(item) => {
              setBoard(item);
              setCity(null);
              setSchool(null);
            }}
          />
        </div>

        <div className="mcb-finder-field">
          <FinderDropdown
            placeholder="Select City"
            options={cities}
            value={city?.name}
            disabled={!board}
            onChange={(item) => {
              setCity(item);
              setSchool(null);
            }}
          />
        </div>

        <div className="mcb-finder-field">
          <FinderDropdown
            placeholder="Select School"
            options={schools}
            value={school?.name}
            disabled={!city}
            onChange={setSchool}
          />
        </div>

        <button
          type="submit"
          className="mcb-finder-button"
        >
          Find
        </button>

      </form>
    </div>
  );
}