import { privacy, rules } from "@/assets/docs";
import { UIContext } from "@/contexts/UIContext";
import { X } from "lucide-react";
import { useContext, useEffect, useState } from "react";

export const FullOverlay: React.FC = () => {
  const ui = useContext(UIContext);

  if (!ui?.overlay.show) {
    return;
  }

  return (
    <div className="fixed max-w-[700px] w-full h-[100vh] flex p-5 flex-col bg-black z-50">
      <div className="w-full flex mb-2 z-auto h-20">
        <button onClick={() => ui.setOverlay(false, "")}>
          <X size={30} />
        </button>
      </div>
      <div style={{ overflowY: "auto" }} className="mt-5">
        {ui.overlay.text === "rules" && <div>{rules}</div>}
        {ui.overlay.text === "privacy" && <div>{privacy}</div>}
      </div>
    </div>
  );
};
