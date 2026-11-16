import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./NewWebsite.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function NewWebsite() {
    const { board, city, school } = useParams();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError(false);

        fetch(`${API}/api/schools/${board}/${city}/${school}`)
            .then((res) => (res.ok ? res.json() : Promise.reject()))
            .then((result) => {
                setData(result);
                setLoading(false);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, [board, city, school]);

    if (loading) {
        return (
            <div className="mcb-website-error">
                <p>Loading...</p>
            </div>
        );
    }

    const schoolName = data?.name;
    const websiteURL = data?.url;

    const isValidURL = (() => {
        try {
            const url = new URL(websiteURL);
            return url.protocol === "https:" || url.protocol === "http:";
        } catch {
            return false;
        }
    })();

    if (error || !schoolName || !isValidURL) {
        return (
            <div className="mcb-website-error">
                <h2>Website not found</h2>
                <p>Please select a valid school.</p>
            </div>
        );
    }

    return (
        <div className="mcb-website-container">

            <div className="mcb-website-header">
                <h2>{schoolName}</h2>
                <a
                    href={websiteURL}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Open Website ↗
                </a>
            </div>

            <div className="mcb-website-frame">
                <iframe
                    src={websiteURL}
                    title={schoolName}
                    className="mcb-school-iframe"
                    allowFullScreen
                />
            </div>

        </div>
    );
}