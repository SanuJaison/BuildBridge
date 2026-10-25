import { Link } from "react-router-dom";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { Avatar, Artwork } from "../ui/Avatar";
import CategoryIcon from "./CategoryIcon";

export default function ProjectCard({ project, featured = false }) {
  if (!project) return null;

  return (
    <article data-card className="surface surface-hover group relative flex h-full flex-col overflow-hidden rounded-2xl">
      <Link
        to={`/portfolio/${project.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`View project ${project.title}`}
        data-cursor-label="View project"
      />
      <div className="relative overflow-hidden">
        <Artwork
          src={project.images?.[0]}
          alt={project.title}
          label={project.category?.name}
          icon={(props) => <CategoryIcon name={project.category?.icon} {...props} />}
          rounded="rounded-none"
          className={`w-full ${featured ? "aspect-[16/10] lg:aspect-[16/9]" : "aspect-[4/3]"}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/55 via-transparent to-transparent opacity-80" />
        <span className="absolute left-4 top-4 chip border-white/15 bg-ink-950/55 text-[10px] text-white/80 backdrop-blur">
          {project.category?.name || "Selected work"}
        </span>
        <span className="absolute bottom-4 right-4 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full border border-white/20 bg-ink-950/50 text-white opacity-0 backdrop-blur transition group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={15} />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className={`line-clamp-2 font-semibold tracking-tight text-white ${featured ? "text-xl" : "text-[15px]"}`}>
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">{project.summary}</p>

        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {(project.technologies || []).slice(0, 3).map((tech) => (
            <span key={tech} className="chip px-2 py-0.5 text-[10px]">
              {tech}
            </span>
          ))}
        </div>

        {project.provider ? (
          <div className="mt-auto flex items-center gap-2 border-t border-white/[0.07] pt-3.5">
            <Avatar src={project.provider.avatar} name={project.provider.displayName} size="xs" />
            <Link
              to={`/providers/${project.provider.slug}`}
              className="relative z-20 flex min-w-0 items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white"
            >
              <span className="truncate">{project.provider.displayName}</span>
              {project.provider.verified ? <BadgeCheck size={10} className="shrink-0 text-sky-300" /> : null}
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
