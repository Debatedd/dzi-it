"use client";

import { deleteRoom } from "../actions";

export default function DeleteRoomButton({ code, title }: { code: string; title: string }) {
  return (
    <form
      action={deleteRoom}
      onSubmit={(e) => {
        if (!confirm(`Изтриване на „${title}"? Резултатите на учениците също ще се изтрият.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="code" value={code} />
      <button
        type="submit"
        className="text-sm px-3 py-1.5 rounded-lg"
        style={{ background: "var(--wrong-bg)", border: "1px solid var(--wrong-border)", color: "var(--wrong-text)", cursor: "pointer" }}
      >
        Изтрий
      </button>
    </form>
  );
}
