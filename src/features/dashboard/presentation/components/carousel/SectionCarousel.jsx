
import Button from "@/features/dashboard/presentation/components/common/Button";
import Container from "@/features/dashboard/presentation/components/common/Container";
import SectionHeader from "@/features/dashboard/presentation/components/common/SectionHeader";
import PortfolioCard from "@/features/dashboard/presentation/components/cards/PortfolioCard";
import CarouselControls from "@/features/dashboard/presentation/components/carousel/CarouselControls";
import CarouselDots from "@/features/dashboard/presentation/components/carousel/CarouselDots";
import { useCarousel } from "@/features/dashboard/presentation/hooks/useCarousel";
import {
  getItemDetailHref,
  getItemMeta,
} from "@/features/dashboard/presentation/utils/cardHelpers";
import "@/features/dashboard/presentation/styles/animations.css";

const EmptyCarouselCard = () => (
  <div className="flex h-full min-h-72 items-center justify-center border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] p-8 text-center shadow-[6px_6px_0_var(--color-ink)]">
    <p className="border-2 border-[var(--color-ink)] bg-[var(--color-paper)] px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-[var(--color-ink)] shadow-[4px_4px_0_var(--color-ink)]">
      No entries yet.
    </p>
  </div>
);

const DESKTOP_VISIBLE_COUNT = 3;

const getVisibleItems = (items, startIndex, visibleCount) => {
  if (!items.length) return [];

  const endIndex = Math.min(
    startIndex + visibleCount,
    items.length
  );

  return items.slice(startIndex, endIndex).map((item, offset) => ({
    item,
    index: startIndex + offset,
  }));
};

const SectionCarousel = ({
  id,
  config,
  items,
  isAdmin,
  onEdit,
  onDelete,
}) => {
  const {
    activeIndex,
    direction,
    goToPrevious,
    goToNext,
    goToIndex,
    handleWheel,
  } = useCarousel(items.length);

  const activeItem = items[activeIndex];

  const desktopPageCount = Math.ceil(
    items.length / DESKTOP_VISIBLE_COUNT
  );

  const desktopPageIndex = Math.floor(
    activeIndex / DESKTOP_VISIBLE_COUNT
  );

  const desktopStartIndex =
    desktopPageIndex * DESKTOP_VISIBLE_COUNT;

  const desktopItems = getVisibleItems(
    items,
    desktopStartIndex,
    DESKTOP_VISIBLE_COUNT
  );

  const hasMobilePagination = items.length > 1;
  const hasDesktopPagination =
    items.length > DESKTOP_VISIBLE_COUNT;

  const goToPreviousDesktopPage = () => {
    if (!hasDesktopPagination) return;

    const previousPage =
      (desktopPageIndex - 1 + desktopPageCount) %
      desktopPageCount;

    goToIndex(
      previousPage * DESKTOP_VISIBLE_COUNT,
      "previous"
    );
  };

  const goToNextDesktopPage = () => {
    if (!hasDesktopPagination) return;

    const nextPage =
      (desktopPageIndex + 1) % desktopPageCount;

    goToIndex(
      nextPage * DESKTOP_VISIBLE_COUNT,
      "next"
    );
  };

  const goToDesktopPage = (pageIndex) => {
    goToIndex(
      pageIndex * DESKTOP_VISIBLE_COUNT,
      pageIndex >= desktopPageIndex ? "next" : "previous"
    );
  };

  // Touchpad navigation follows the current responsive layout.
  const handleCarouselWheel = (event) => {
    const isDesktop = window.matchMedia(
      "(min-width: 1024px)"
    ).matches;

    if (isDesktop && hasDesktopPagination) {
      handleWheel(event, {
        onPrevious: goToPreviousDesktopPage,
        onNext: goToNextDesktopPage,
      });

      return;
    }

    handleWheel(event, {
      onPrevious: goToPrevious,
      onNext: goToNext,
    });
  };

  return (
    <section
      id={id}
      onWheel={handleCarouselWheel}
      className={`relative min-h-screen overflow-hidden border-b-2 border-[var(--color-ink)] px-4 py-16 sm:px-6 sm:py-20 ${config.dark
          ? "bg-[var(--color-panel)] text-[var(--color-paper-light)]"
          : "bg-[rgb(var(--color-paper-rgb)/0.9)] text-[var(--color-ink)]"
        }`}
    >
      {config.dark ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(var(--color-white-rgb)/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--color-white-rgb)/0.035)_1px,transparent_1px)] [background-size:32px_32px]" />

          <div className="pointer-events-none absolute right-0 top-0 h-2 w-1/3 bg-[var(--color-accent)]" />
        </>
      ) : null}

      <Container className="relative flex min-h-[calc(100vh-10rem)] flex-col overflow-hidden">
        <SectionHeader
          number={config.number}
          title={config.title}
          dark={config.dark}
          action={
            <Button
              to={config.viewAllHref}
              variant={config.dark ? "paper" : "orange"}
            >
              View All
            </Button>
          }
        />

        <div className="mt-8 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
          {/* Pagination status and navigation controls */}
          <div className="flex shrink-0 items-center justify-between gap-3">
            <div
              className={`text-[10px] font-black uppercase tracking-[0.16em] ${config.dark
                  ? "text-[var(--color-copy-muted)]"
                  : "text-[var(--color-muted)]"
                }`}
            >
              <span className="lg:hidden">
                {items.length
                  ? `Slide ${activeIndex + 1} / ${items.length}`
                  : "Slide 0 / 0"}
              </span>

              <span className="hidden lg:inline">
                {items.length
                  ? `Page ${desktopPageIndex + 1} / ${desktopPageCount}`
                  : "Page 0 / 0"}
              </span>
            </div>

            {hasMobilePagination ? (
              <CarouselControls
                onPrevious={goToPrevious}
                onNext={goToNext}
                label={config.title}
                className="lg:hidden"
              />
            ) : null}

            {hasDesktopPagination ? (
              <CarouselControls
                onPrevious={goToPreviousDesktopPage}
                onNext={goToNextDesktopPage}
                label={config.title}
                className="hidden lg:flex"
              />
            ) : null}
          </div>

          {/* Carousel cards */}
          <div className="min-h-0 flex-1 overflow-hidden">
            {activeItem ? (
              <>
                {/* Mobile: one card per slide */}
                <div
                  key={`mobile-${activeItem.id}`}
                  className={`portfolio-slide portfolio-slide-${direction} h-full lg:hidden`}
                >
                  <PortfolioCard
                    item={activeItem}
                    meta={getItemMeta(activeItem, config.key)}
                    linkTo={getItemDetailHref(activeItem, config)}
                    thumbnailIndex={activeIndex}
                    carousel
                    isAdmin={isAdmin}
                    onEdit={() =>
                      onEdit(config.collectionName, activeItem)
                    }
                    onDelete={() =>
                      onDelete(config.collectionName, activeItem.id)
                    }
                  />
                </div>

                {/* Desktop: up to three cards per page */}
                <div
                  key={`desktop-${desktopStartIndex}`}
                  className={`portfolio-slide portfolio-slide-${direction} hidden h-full grid-cols-3 gap-6 lg:grid`}
                >
                  {desktopItems.map(({ item, index }) => (
                    <PortfolioCard
                      key={item.id}
                      item={item}
                      meta={getItemMeta(item, config.key)}
                      linkTo={getItemDetailHref(item, config)}
                      thumbnailIndex={index}
                      carousel
                      isAdmin={isAdmin}
                      onEdit={() =>
                        onEdit(config.collectionName, item)
                      }
                      onDelete={() =>
                        onDelete(config.collectionName, item.id)
                      }
                    />
                  ))}
                </div>
              </>
            ) : (
              <EmptyCarouselCard />
            )}
          </div>

          {/* Mobile pagination dots */}
          {hasMobilePagination ? (
            <CarouselDots
              count={items.length}
              activeIndex={activeIndex}
              onSelect={goToIndex}
              label={config.title}
              className="lg:hidden"
            />
          ) : null}

          {/* Desktop pagination dots */}
          {hasDesktopPagination ? (
            <CarouselDots
              count={desktopPageCount}
              activeIndex={desktopPageIndex}
              onSelect={goToDesktopPage}
              label={`${config.title} page`}
              className="hidden lg:flex"
            />
          ) : null}
        </div>
      </Container>
    </section>
  );
};

export default SectionCarousel;
