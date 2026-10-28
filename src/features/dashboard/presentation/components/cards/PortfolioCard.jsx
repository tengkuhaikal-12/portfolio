import { Link } from "react-router-dom";
import { IoPencilOutline, IoTrashOutline } from "react-icons/io5";
import DefaultThumbnail from "@/features/dashboard/presentation/components/cards/DefaultThumbnail";

const ControlButtons = ({ onEdit, onDelete }) => (
  <div className="flex shrink-0 gap-2">
    <button
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onEdit();
      }}
      className="grid h-10 w-10 cursor-pointer touch-manipulation place-items-center border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] text-[var(--color-muted)] shadow-[2px_2px_0_var(--color-ink)] transition hover:-translate-y-0.5 hover:bg-[var(--color-accent)] hover:text-[var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      aria-label="Edit entry"
    >
      <IoPencilOutline size={18} />
    </button>
    <button
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onDelete();
      }}
      className="grid h-10 w-10 cursor-pointer touch-manipulation place-items-center border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] text-[var(--color-muted)] shadow-[2px_2px_0_var(--color-ink)] transition hover:-translate-y-0.5 hover:bg-[var(--color-danger)] hover:text-[var(--color-paper-light)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      aria-label="Delete entry"
    >
      <IoTrashOutline size={18} />
    </button>
  </div>
);

const PortfolioCard = ({
  item,
  meta,
  linkTo,
  thumbnailIndex = 0,
  isAdmin = false,
  onEdit,
  onDelete,
  carousel = false,
}) => {
  const content = (
    <>
      <div className={`${carousel ? "h-40 sm:h-48 lg:h-56" : "h-44 sm:h-52"} relative w-full shrink-0 overflow-hidden border-b-2 border-[var(--color-ink)]`}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            crossOrigin="anonymous"
            className="absolute inset-0 h-full w-full object-cover grayscale transition duration-300 group-hover:scale-[1.02] group-hover:grayscale-0"
            style={{ objectPosition: item.imagePosition || "50% 50%" }}
            loading="lazy"
          />
        ) : (
          <DefaultThumbnail index={thumbnailIndex} />
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-between gap-5 overflow-hidden p-5 sm:p-6">
        <div className="min-w-0">
          <div className="mb-3 w-fit border border-[var(--color-ink)] bg-[var(--color-paper)] px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--color-muted)]">
            {item.duration}
            {item.duration?.toLowerCase().includes("present") ? <span className="ml-1 text-[var(--color-accent)]">(ongoing)</span> : null}
          </div>
          <h3 className="line-clamp-2 break-words font-display text-2xl font-black uppercase leading-tight tracking-normal text-[var(--color-ink)] decoration-[var(--color-accent)] decoration-4 underline-offset-4 group-hover:underline sm:text-3xl">
            {item.title}
          </h3>
          {meta ? (
            <p className="mb-4 mt-2 line-clamp-1 break-words text-xs font-black uppercase tracking-[0.1em] text-[var(--color-muted)]">
              {meta}
            </p>
          ) : null}
          <p className={`${carousel ? "line-clamp-3 sm:line-clamp-4" : "line-clamp-3"} break-words text-sm leading-7 text-[var(--color-muted)]`}>
            {item.description}
          </p>
        </div>

        {isAdmin ? (
          <div className="self-end">
            <ControlButtons onEdit={onEdit} onDelete={onDelete} />
          </div>
        ) : null}
      </div>
    </>
  );

  const className = `group flex h-full min-h-0 touch-manipulation flex-col overflow-hidden border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] text-[var(--color-ink)] shadow-[6px_6px_0_var(--color-ink)] transition hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--color-ink)] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-4`;

  if (linkTo) {
    return (
      <Link to={linkTo} className={className} aria-label={`Open ${item.title}`}>
        {content}
      </Link>
    );
  }

  return <article className={className}>{content}</article>;
};

export default PortfolioCard;
