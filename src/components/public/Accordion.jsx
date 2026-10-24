import { useState } from "react";
import { Minus, Plus } from "lucide-react";

export default function Accordion({ items = [], defaultOpen = 0, className = "" }) {
  const [openIndex, setOpenIndex] = useState(defaultOpen);

  return (
    <div className={`divide-y divide-white/8 border-y border-white/8 ${className}`}>
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? -1 : index)}
              className="flex w-full items-center justify-between gap-6 py-5 text-left"
              aria-expanded={open}
            >
              <span className={`text-sm font-medium transition ${open ? "text-white" : "text-slate-300"}`}>
                {item.question}
              </span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
                  open ? "border-brand-400/40 bg-brand-500/15 text-brand-200" : "border-white/10 text-slate-500"
                }`}
              >
                {open ? <Minus size={13} /> : <Plus size={13} />}
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-5 text-xs leading-relaxed text-slate-400 sm:text-[13px]">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
