import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import { buildSchoolContent } from "./schoolTemplates/content";
import ClassicTemplate from "./schoolTemplates/ClassicTemplate";
import ModernTemplate from "./schoolTemplates/ModernTemplate";
import ElegantTemplate from "./schoolTemplates/ElegantTemplate";
import BoldTemplate from "./schoolTemplates/BoldTemplate";
import "./schoolPages.css";

// School page: /:board/:city/:school  (for example /cbse/hyderabad/delhi-public-school)
// The design and the content are chosen in Admin -> Schools. Anything left empty
// there is filled with sample (dummy) content.
const TEMPLATES = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  elegant: ElegantTemplate,
  bold: BoldTemplate,
};

export default function SchoolPage() {
  const { board, city, school } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    setData(null);

    api
      .get(`/api/schools/${board}/${city}/${school}`)
      .then(({ data }) => active && setData(data))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [board, city, school]);

  if (loading) {
    return (
      <section className="page-section" style={{ paddingTop: 170 }}>
        <div className="section-inner"><p>Loading school page...</p></div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="page-section" style={{ paddingTop: 170 }}>
        <div className="section-inner">
          <small className="section-eyebrow">SCHOOL NOT FOUND</small>
          <h1>We couldn't find this school</h1>
          <p className="section-intro">Please go back and select a valid board, city and school.</p>
          <Link className="primary-button" to="/">Back to home</Link>
        </div>
      </section>
    );
  }

  const content = buildSchoolContent(data);
  const Template = TEMPLATES[content.template] || ClassicTemplate;

  return <Template c={content} />;
}
