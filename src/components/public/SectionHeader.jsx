export default function SectionHeader({ eyebrow, title, description, action, className = "", align = "left" }) {
  return (
    <div
      className={`flex flex-col gap-5 ${
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"
      } ${className}`}
    >
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="mt-3 text-balance heading-lg text-white">{title}</h2>
        {description ? <p className="mt-4 text-pretty text-sm leading-relaxed text-slate-400">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
