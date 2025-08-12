// components/CustomSummary/CustomSummary.tsx
import React, { useState, useEffect } from "react";
import {
  LuChevronDown,
  LuChevronUp,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
import DoughnutChart from "./DoughnutChart";
import SummaryLoadingSkeleton from "./SummaryLoadingSkeleton";

// Types
export interface ChartData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

export interface SummaryCard {
  id: string;
  type: "chart" | "count" | "custom";
  title: string;
  subtitle?: string;
  data?: ChartData[];
  count?: number;
  icon?: React.ReactNode;
  iconColor?: string;
  backgroundColor?: string;
  textColor?: string;
  customContent?: React.ReactNode;
}

// Configuration interface
export interface CustomSummaryConfig {
  // Basic Configuration
  title: string;
  titleColor?: string;
  titleStyle?: React.CSSProperties;

  // Behavior Configuration
  collapsible?: boolean;
  defaultCollapsed?: boolean;

  // Layout Configuration
  cardsPerView?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  cardSpacing?: number;
  showNavigation?: boolean;
  showIndicators?: boolean;

  // Styling Configuration
  containerStyle?: React.CSSProperties;
  cardStyle?: React.CSSProperties;
  headerStyle?: React.CSSProperties;

  // Card Configuration
  cardWidth?: number;
  cardHeight?: number;
}

// Main Props Interface
export interface CustomSummaryProps {
  // Data
  cards: SummaryCard[];
  loading?: boolean;
  error?: string | null;

  // Configuration
  config: CustomSummaryConfig;

  // Event Handlers
  onCardClick?: (card: SummaryCard) => void;
  onRefresh?: () => void;

  // Styling
  className?: string;
  style?: React.CSSProperties;
}

// Individual Card Component
const SummaryCardComponent: React.FC<{
  card: SummaryCard;
  config: CustomSummaryConfig;
  onClick?: (card: SummaryCard) => void;
}> = ({ card, config, onClick }) => {
  const cardWidth = config.cardWidth || 192;
  const cardHeight = config.cardHeight || 95;

  const handleClick = () => {
    onClick?.(card);
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden transition-all duration-200 ${
        onClick ? "cursor-pointer hover:shadow-md hover:scale-105" : ""
      }`}
      style={{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        boxShadow: "0px 0px 4px 0px #00000040",
        ...config.cardStyle,
      }}
      onClick={handleClick}
    >
      {card.type === "chart" && card.data ? (
        <>
          {/* Chart Section */}
          <div
            className="flex items-center justify-center"
            style={{ width: `${cardHeight}px` }}
          >
            <DoughnutChart data={card.data} />
          </div>

          {/* Details Section */}
          <div className="flex-1 p-3 flex flex-col justify-center">
            <h3
              className="mb-2 leading-tight"
              style={{
                fontFamily: "Poppins",
                fontWeight: 700,
                fontSize: "10px",
                lineHeight: "100%",
                letterSpacing: "0%",
                color: card.textColor || "#000000",
              }}
            >
              {card.title}
            </h3>

            {card.subtitle && (
              <p
                className="mb-2 text-xs"
                style={{
                  fontFamily: "Poppins",
                  fontWeight: 400,
                  fontSize: "8px",
                  color: "#6B7280",
                }}
              >
                {card.subtitle}
              </p>
            )}

            <div className="space-y-1">
              {card.data.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span
                    className="truncate text-xs"
                    style={{
                      fontFamily: "Poppins",
                      fontWeight: 400,
                      fontSize: "8px",
                      color: "#374151",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : card.type === "count" ? (
        <>
          {/* Icon Section */}
          <div
            className="flex items-center justify-center"
            style={{
              width: `${cardHeight}px`,
              backgroundColor:
                card.iconColor || card.backgroundColor || "#1E764E",
            }}
          >
            <div className="text-white text-2xl">{card.icon}</div>
          </div>

          {/* Count Section */}
          <div className="flex-1 p-3 flex flex-col justify-center">
            <h3
              className="mb-1"
              style={{
                fontFamily: "Poppins",
                fontWeight: 700,
                fontSize: "10px",
                lineHeight: "100%",
                color: card.textColor || "#000000",
              }}
            >
              {card.title}
            </h3>

            {card.subtitle && (
              <p
                className="mb-1 text-xs"
                style={{
                  fontFamily: "Poppins",
                  fontWeight: 400,
                  fontSize: "8px",
                  color: "#6B7280",
                }}
              >
                {card.subtitle}
              </p>
            )}

            <div
              className="font-bold"
              style={{
                fontFamily: "Poppins",
                fontWeight: 700,
                fontSize: "24px",
                lineHeight: "100%",
                color: card.iconColor || card.backgroundColor || "#1E764E",
              }}
            >
              {card.count?.toLocaleString() || 0}
            </div>
          </div>
        </>
      ) : (
        // Custom content
        <div className="w-full h-full">{card.customContent}</div>
      )}
    </div>
  );
};

// Main CustomSummary Component
const CustomSummary: React.FC<CustomSummaryProps> = ({
  cards,
  loading = false,
  error = null,
  config,
  onCardClick,
  onRefresh,
  className = "",
  style,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(
    config.defaultCollapsed || false
  );
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(() => {
    if (typeof window === "undefined") return config.cardsPerView?.desktop || 5;
    const width = window.innerWidth;
    if (width < 640) return config.cardsPerView?.mobile || 1;
    if (width < 1024) return config.cardsPerView?.tablet || 3;
    return config.cardsPerView?.desktop || 5;
  });

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newCardsPerView;
      if (width < 640) {
        newCardsPerView = config.cardsPerView?.mobile || 1;
      } else if (width < 1024) {
        newCardsPerView = config.cardsPerView?.tablet || 3;
      } else {
        newCardsPerView = config.cardsPerView?.desktop || 5;
      }
      setCardsPerView(newCardsPerView);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [config.cardsPerView]);

  // Navigation logic
  const canNavigateLeft = currentCardIndex > 0;
  const canNavigateRight = currentCardIndex + cardsPerView < cards.length;

  const handlePrevious = () => {
    if (canNavigateLeft) {
      setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
    }
  };

  const handleNext = () => {
    if (canNavigateRight) {
      setCurrentCardIndex(
        Math.min(cards.length - cardsPerView, currentCardIndex + 1)
      );
    }
  };

  // Title styling
  const titleStyle = {
    color: config.titleColor || "#1F3A8A",
    fontFamily: "Work Sans",
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "3%",
    textTransform: "capitalize" as const,
    ...config.titleStyle,
  };

  const cardWidth = config.cardWidth || 192;
  const cardSpacing = config.cardSpacing || 16;

  return (
    <div className={`mb-6 ${className}`} style={style}>
      {/* Header */}
      <div
        className="flex items-center justify-between mb-4"
        style={config.headerStyle}
      >
        <div className="flex items-center space-x-2">
          {config.collapsible !== false ? (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <h2 style={titleStyle}>{config.title}</h2>
              {isCollapsed ? (
                <LuChevronDown
                  size={16}
                  style={{ color: config.titleColor || "#1F3A8A" }}
                />
              ) : (
                <LuChevronUp
                  size={16}
                  style={{ color: config.titleColor || "#1F3A8A" }}
                />
              )}
            </button>
          ) : (
            <h2 style={titleStyle}>{config.title}</h2>
          )}
        </div>

        {/* Optional Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Refresh
          </button>
        )}
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="relative" style={config.containerStyle}>
          {/* Loading State */}
          {loading && <SummaryLoadingSkeleton />}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center py-12 text-red-500">
              <div className="text-center">
                <p className="mb-2">{error}</p>
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          )}

          {/* No Data State */}
          {!loading && !error && cards.length === 0 && (
            <div className="flex items-center justify-center py-12 text-gray-500">
              No summary data available
            </div>
          )}

          {/* Cards Display */}
          {!loading && !error && cards.length > 0 && (
            <>
              {/* Navigation Arrows */}
              {config.showNavigation !== false && canNavigateLeft && (
                <button
                  onClick={handlePrevious}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
                  style={{ color: config.titleColor || "#1F3A8A" }}
                >
                  <LuChevronLeft size={20} />
                </button>
              )}

              {config.showNavigation !== false && canNavigateRight && (
                <button
                  onClick={handleNext}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-12 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
                  style={{ color: config.titleColor || "#1F3A8A" }}
                >
                  <LuChevronRight size={20} />
                </button>
              )}

              {/* Cards Container */}
              <div
                className="overflow-hidden"
                style={{ padding: "8px 8px 8px 12px" }}
              >
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{
                    gap: `${cardSpacing}px`,
                    transform: `translateX(-${
                      currentCardIndex * (cardWidth + cardSpacing)
                    }px)`,
                  }}
                >
                  {cards.map((card) => (
                    <div key={card.id} className="flex-shrink-0">
                      <SummaryCardComponent
                        card={card}
                        config={config}
                        onClick={onCardClick}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Indicators */}
              {config.showIndicators !== false &&
                cards.length > cardsPerView && (
                  <div className="flex justify-center mt-4 space-x-2 md:hidden">
                    {Array.from(
                      { length: Math.ceil(cards.length / cardsPerView) },
                      (_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentCardIndex(i * cardsPerView)}
                          className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                            Math.floor(currentCardIndex / cardsPerView) === i
                              ? "bg-blue-600"
                              : "bg-gray-300"
                          }`}
                        />
                      )
                    )}
                  </div>
                )}
            </>
          )}
        </div>
      )}

      {/* Collapsed State */}
      {config.collapsible !== false && isCollapsed && (
        <div
          className="w-full bg-gray-200 rounded-lg"
          style={{ height: "4px" }}
        />
      )}
    </div>
  );
};

export default CustomSummary;
