import React,{useEffect,useState} from "react";
import {useParams,Link} from "react-router-dom";
import TopBar from "../components/TopBar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../api";

export default function CmsPage(){
 const {slug}=useParams(); const [page,setPage]=useState(null); const [error,setError]=useState(false);
 useEffect(()=>{api.get(`/pages/${slug}`).then(r=>setPage(r.data)).catch(()=>setError(true));},[slug]);
 return <><TopBar/><div className="hero-shell"><Navbar/></div><main className="section-pad"><div className="container">{error?<><h1>Page not found</h1><Link to="/">Back to home</Link></>:page?<><span className="eyebrow">{page.section}</span><h1 className="section-title">{page.title}</h1><div className="body-copy" style={{whiteSpace:'pre-wrap'}}>{page.content}</div></>:<p>Loading page...</p>}</div></main><Footer/></>;
}
