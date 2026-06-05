import Button from "@/features/dashboard/presentation/components/common/Button";
import Container from "@/features/dashboard/presentation/components/common/Container";
import SectionHeader from "@/features/dashboard/presentation/components/common/SectionHeader";
import PortfolioCard from "@/features/dashboard/presentation/components/cards/PortfolioCard";
import CarouselControls from "@/features/dashboard/presentation/components/carousel/CarouselControls";
import CarouselDots from "@/features/dashboard/presentation/components/carousel/CarouselDots";
import { useCarousel } from "@/features/dashboard/presentation/hooks/useCarousel";
import { getItemDetailHref, getItemMeta } from "@/features/dashboard/presentation/utils/cardHelpers";
import "@/features/dashboard/presentation/styles/animations.css";

const EmptyCarouselCard = () => (
  <div className="flex h-full min-h-72 items-center justify-center border-2 border-[#151513] bg-[#fbf8f0] p-8 text-center shadow-[6px_6px_0_#151513]">
    <p className="border-2 border-[#151513] bg-[#f2efe7] px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-[#151513] shadow-[4px_4px_0_#151513]">
      No entries yet.
    </p>
  </div>
);

const DESKTOP_VISIBLE_COUNT = 3;

const getVisibleItems = (items, startIndex, visibleCount) => {
  if (!items.length) return [];
  const endIndex = Math.min(startIndex + visibleCount, items.length);

  return items.slice(startIndex, endIndex).map((item, offset) => ({
    item,
    index: startIndex + offset,
  }));
};

const SectionCarousel = ({ id, config, items, isAdmin, onEdit, onDelete }) => {
  const { activeIndex, direction, goToPrevious, goToNext, goToIndex } = useCarousel(items.length);
  const activeItem = items[activeIndex];
  const desktopPageCount = Math.ceil(items.length / DESKTOP_VISIBLE_COUNT);
  const desktopPageIndex = Math.floor(activeIndex / DESKTOP_VISIBLE_COUNT);
  const desktopStartIndex = desktopPageIndex * DESKTOP_VISIBLE_COUNT;
  const desktopItems = getVisibleItems(items, desktopStartIndex, DESKTOP_VISIBLE_COUNT);
  const hasMobilePagination = items.length > 1;
  const hasDesktopPagination = items.length > DESKTOP_VISIBLE_COUNT;

  const goToPreviousDesktopPage = () => {
    if (!hasDesktopPagination) return;
    const previousPage = (desktopPageIndex - 1 + desktopPageCount) % desktopPageCount;
    goToIndex(previousPage * DESKTOP_VISIBLE_COUNT, "previous");
  };

  const goToNextDesktopPage = () => {
    if (!hasDesktopPagination) return;
    const nextPage = (desktopPageIndex + 1) % desktopPageCount;
    goToIndex(nextPage * DESKTOP_VISIBLE_COUNT, "next");
  };

  const goToDesktopPage = (pageIndex) => {
    goToIndex(pageIndex * DESKTOP_VISIBLE_COUNT, pageIndex >= desktopPageIndex ? "next" : "previous");
  };

  return (
    <section id={id} className={`relative min-h-screen overflow-hidden border-b-2 border-[#151513] px-4 py-16 sm:px-6 sm:py-20 ${config.dark ? "bg-[#242421] text-[#fbf8f0]" : "bg-[#f2efe7]/90 text-[#151513]"}`}>
      {config.dark ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:32px_32px]" />
          <div className="pointer-events-none absolute right-0 top-0 h-2 w-1/3 bg-[#ff5a36]" />
        </>
      ) : null}

      <Container className="relative flex min-h-[calc(100vh-10rem)] flex-col overflow-hidden">
        <SectionHeader
          number={config.number}
          title={config.title}
          dark={config.dark}
          action={<Button to={config.viewAllHref} variant={config.dark ? "paper" : "orange"}>View All</Button>}
        />

        <div className="mt-8 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex shrink-0 items-center justify-between gap-3">
            <div className={`${config.dark ? "text-[#c7c5bd]" : "text-[#5d5d56]"} text-[10px] font-black uppercase tracking-[0.16em]`}>
              <span className="lg:hidden">{items.length ? `Slide ${activeIndex + 1} / ${items.length}` : "Slide 0 / 0"}</span>
              <span className="hidden lg:inline">{items.length ? `Page ${desktopPageIndex + 1} / ${desktopPageCount}` : "Page 0 / 0"}</span>
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

          <div className="min-h-0 flex-1 overflow-hidden">
            {activeItem ? (
              <>
                <div key={`mobile-${activeItem.id}`} className={`portfolio-slide portfolio-slide-${direction} h-full lg:hidden`}>
                  <PortfolioCard
                    item={activeItem}
                    meta={getItemMeta(activeItem, config.key)}
                    linkTo={getItemDetailHref(activeItem, config)}
                    thumbnailIndex={activeIndex}
                    carousel
                    isAdmin={isAdmin}
                    onEdit={() => onEdit(config.collectionName, activeItem)}
                    onDelete={() => onDelete(config.collectionName, activeItem.id)}
                  />
                </div>

                <div key={`desktop-${desktopStartIndex}`} className={`portfolio-slide portfolio-slide-${direction} hidden h-full grid-cols-3 gap-6 lg:grid`}>
                  {desktopItems.map(({ item, index }) => (
                    <PortfolioCard
                      key={item.id}
                      item={item}
                      meta={getItemMeta(item, config.key)}
                      linkTo={getItemDetailHref(item, config)}
                      thumbnailIndex={index}
                      carousel
                      isAdmin={isAdmin}
                      onEdit={() => onEdit(config.collectionName, item)}
                      onDelete={() => onDelete(config.collectionName, item.id)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <EmptyCarouselCard />
            )}
          </div>

          {hasMobilePagination ? (
            <CarouselDots
              count={items.length}
              activeIndex={activeIndex}
              onSelect={goToIndex}
              label={config.title}
              className="lg:hidden"
            />
          ) : null}
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
