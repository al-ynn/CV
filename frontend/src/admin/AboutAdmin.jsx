import { useState } from "react";
import AboutList, { AboutLiveLink } from "./AboutList";
import AboutEditor from "./AboutEditor";

export default function AboutAdmin() {
  const [editingId, setEditingId] = useState(null);
  return editingId ? (
    <AboutEditor profileId={editingId} onBack={() => setEditingId(null)} />
  ) : (
    <>
      <AboutList onEdit={setEditingId} />
      <div className="mt-6"><AboutLiveLink /></div>
    </>
  );
}
