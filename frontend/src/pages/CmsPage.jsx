import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import CmsContent from "../components/CmsContent";

export default function CmsPage() {
    const { slug } = useParams();

    const [page, setPage] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        setPage(null);
        setError(false);

        api.get(`/api/pages/${encodeURIComponent(slug)}`)
            .then((r) => setPage(r.data))
            .catch(() => setError(true));
    }, [slug]);

    if (error) {
        return (
            <section className="page-section" style={{ paddingTop: 170 }}>
                <div className="section-inner">
                    <small className="section-eyebrow">PAGE NOT AVAILABLE</small>
                    <h1>We couldn't find this page</h1>
                    <p className="section-intro">This page may have been removed or is not currently published.</p>
                    <Link className="primary-button" to="/">Back to home</Link>
                </div>
            </section>
        );
    }

    if (!page) {
        return (
            <section className="page-section" style={{ paddingTop: 170 }}>
                <div className="section-inner"><p>Loading page...</p></div>
            </section>
        );
    }

    return (
        <>
            <div className="container pt-4" style={{ paddingTop: 150 }}>
                <nav aria-label="Breadcrumb" className="small text-muted">
                    <Link to="/" className="text-decoration-none">Home</Link>
                    <span className="mx-2">/</span>
                    <span>{page.title}</span>
                </nav>
            </div>
            <section className="page-section">
                <div className="section-inner">
                    {page.section && page.section !== "pages" && (
                        <small className="section-eyebrow">{String(page.section).toUpperCase()}</small>
                    )}
                    <h1>{page.title}</h1>
                    <CmsContent html={page.content} style={{ maxWidth: 900 }} />
                </div>
            </section>
        </>
    );
}
