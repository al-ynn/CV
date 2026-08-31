import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import { useContent } from "../lib/content";
import { HomeRenderer } from "./Home";

export default function HomePreview() {
  const { token } = useParams();
  const content = useContent();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/homepage/preview-data/${token}`)
      .then(({ data }) => setData(data))
      .catch(() => setError(true));
  }, [token]);

  if (error) {
    return (
      <div className="min-h-screen grid place-items-center bg-canvas">
        <p className="font-mono text-xs tracking-[0.25em] text-pk">PREVIEW LINK EXPIRED OR INVALID</p>
      </div>
    );
  }
  if (!data || content.loading) {
    return <div className="min-h-screen grid place-items-center bg-canvas font-mono text-xs text-ink3 animate-blink">LOADING PREVIEW…</div>;
  }

  return (
    <div className="bg-canvas min-h-screen" data-testid="home-preview">
      <div className="sticky top-0 z-50 bg-amb/15 border-b border-amb/40 px-5 py-2.5 text-center font-mono text-[10px] tracking-[0.25em] uppercase text-amb">
        Preview Mode — unpublished homepage draft · link expires in 2 hours
      </div>
      <HomeRenderer config={data.homepage} content={content} />
    </div>
  );
}
