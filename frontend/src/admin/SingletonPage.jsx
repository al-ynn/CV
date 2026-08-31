import { useEffect, useState } from "react";
import api, { formatApiError } from "../lib/api";
import { useContent } from "../lib/content";
import { Field } from "./fields";
import { Save } from "lucide-react";

export default function SingletonPage({ schema, name }) {
  const { refresh } = useContent();
  const [data, setData] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.get(`/admin/singleton/${name}`).then(({ data }) => { setData(data); setDirty(false); });
  }, [name]);

  const save = async () => {
    try {
      await api.put(`/admin/singleton/${name}`, data);
      setMsg("✓ Saved — live on the site");
      setDirty(false);
      refresh();
    } catch (err) {
      setMsg(formatApiError(err.response?.data?.detail));
    }
  };

  if (!data) return <p className="font-mono text-xs text-ink3 animate-blink">LOADING…</p>;

  return (
    <div data-testid={`singleton-${name}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <span className="font-mono text-[10px] tracking-[0.3em] text-violet">ADMIN / {schema.title}</span>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">{schema.title}</h1>
        </div>
        <button onClick={save} data-testid={`${name}-save`}
          className={`h-10 px-6 font-mono text-[10px] tracking-[0.2em] uppercase font-semibold inline-flex items-center gap-2 ${
            dirty ? "bg-violet" : "border border-line text-ink3"
          }`}
          style={dirty ? { color: "var(--bg)" } : {}}>
          <Save size={13} /> {dirty ? "Save Changes" : "Saved"}
        </button>
      </div>

      <div className="panel p-5 sm:p-7 grid sm:grid-cols-2 gap-x-6 gap-y-4 max-w-4xl">
        {schema.fields.map((f, i) =>
          f.type === "section" ? (
            <div key={i} className="sm:col-span-2"><Field def={f} item={data} onChange={setData} /></div>
          ) : (
            <div key={f.key} className={f.type === "textarea" || f.type === "list" || f.type === "pipelist" ? "sm:col-span-2" : ""}>
              <Field def={f} item={data} onChange={(v) => { setData(v); setDirty(true); }} />
            </div>
          )
        )}
      </div>
      {msg && <p className={`mt-4 font-mono text-xs ${msg.startsWith("✓") ? "text-grn" : "text-pk"}`} data-testid="singleton-msg">{msg}</p>}
    </div>
  );
}
