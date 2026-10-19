import {
  Component,
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { BottomNav } from "../../components/BottomNav";
import { GradientButton } from "../../components/ui/gradient-button";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Bed,
  Bath,
  Square,
  Home,
  Crown,
  WalletCards,
  Gem,
  ShieldCheck,
  Heart,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { requestLocation } from "../../utils/location";
import { NCR_CITIES } from "../../utils/constants";

console.log("[PropertyListing] module loaded");

// Mobile navigation store.
// This lives outside the component so it survives PropertyListing unmount/remount
// when the customer opens a property and then presses Back.
// Display cache only. It is NEVER treated as the source of truth.
// A background page-1 API refresh always runs when cached data is available.
const PROPERTY_CACHE_KEY = "fundsarthi_property_listing_v2";

type PropertyCache = {
  properties: any[];
  savedAt: number;
  hasMore: boolean;
  page: number;
};

const readPropertyCache = (): PropertyCache | null => {
  try {
    const raw = localStorage.getItem(PROPERTY_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as PropertyCache;

    if (
      !parsed ||
      !Array.isArray(parsed.properties) ||
      !parsed.properties.length
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const writePropertyCache = (
  properties: any[],
  page: number,
  hasMore: boolean,
) => {
  try {
    localStorage.setItem(
      PROPERTY_CACHE_KEY,
      JSON.stringify({
        properties,
        page,
        hasMore,
        savedAt: Date.now(),
      }),
    );
  } catch {
    // Cache is an enhancement only. Never break the listing if storage is full.
  }
};

const PROPERTY_SCROLL_STATE_KEY = "fundsarthi_property_scroll_state_v2";
const PROPERTY_RETURNING_FROM_DETAIL_KEY =
  "fundsarthi_returning_from_property_detail_v1";

type PropertyScrollState = {
  scrollTop: number;
  windowScrollTop: number;
  savedAt: number;
};

const readPropertyScrollState = (): PropertyScrollState | null => {
  try {
    const raw = sessionStorage.getItem(PROPERTY_SCROLL_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PropertyScrollState;

    if (
      !parsed ||
      typeof parsed.scrollTop !== "number" ||
      !Number.isFinite(parsed.scrollTop)
    ) {
      return null;
    }

    return {
      scrollTop: Math.max(0, parsed.scrollTop),
      windowScrollTop: Math.max(
        0,
        typeof parsed.windowScrollTop === "number" ? parsed.windowScrollTop : 0,
      ),
      savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
};

const writePropertyScrollState = (
  scrollTop: number,
  windowScrollTop: number,
) => {
  try {
    sessionStorage.setItem(
      PROPERTY_SCROLL_STATE_KEY,
      JSON.stringify({
        scrollTop: Math.max(0, scrollTop),
        windowScrollTop: Math.max(0, windowScrollTop),
        savedAt: Date.now(),
      }),
    );
  } catch {
    // Never break the listing because storage is unavailable.
  }
};

const propertyListingStore: {
  properties: any[];
  page: number;
  hasMore: boolean;
  scrollTop: number;
  activeTab: string;
  search: string;
  selectedFilters: string[];
  sortBy: string;
  selectedBuilder: string;
  selectedPlotCategory: string;
  priceRange: number[];
  selectedLocality: string;
  selectedSector: string;
  windowScrollTop: number;
} = {
  properties: [],
  page: 1,
  hasMore: true,
  scrollTop: 0,
  activeTab: "Residential",
  search: "",
  selectedFilters: [],
  sortBy: "",
  selectedBuilder: "",
  selectedPlotCategory: "",
  priceRange: [0, 50],
  selectedLocality: "",
  selectedSector: "",
  windowScrollTop: 0,
};

function PropertyListingContent() {
  console.log("[PropertyListing] render: content component started");
  const navigate = useNavigate();

  // Restore the listing synchronously from the in-memory mobile store.
  // No API call is needed just because the user pressed Back.
  const [activeTab, setActiveTab] = useState(propertyListingStore.activeTab);

  type PropertyType = {
    id: number;
    title: string;
    description?: string;

    location: string;

    price: any;
    city?: string;
    locality?: string;

    beds: string;
    baths: string;
    area: string;

    purpose: string;

    image: string;
    images?: string[];

    mobile?: string;

    listing_type?: string;

    property_type?: string;
    category?: string;

    latitude?: number;
    longitude?: number;

    is_hot_deal?: boolean;
    is_trending?: boolean;

    hot_deal_order?: number;
    trending_order?: number;

    // Computed server-side from CRM-configurable settings
    // (nearby radius, price bands, salary multiplier)
    deal_tag?:
      | "hot_deal"
      | "luxury"
      | "budget"
      | "premium"
      | "nearby"
      | "normal";
    is_recommended?: boolean;

    features?: {
      highlights?: string[];
      facilities?: string[];

      extra?: {
        category?: string;

        project_name?: string;

        builder?: string;

        furnishing?: string;

        construction_status?: string;

        parking?: string;

        property_type?: string;
      };
    };
  };

  const cachedPropertyData = useMemo(() => {
    if (propertyListingStore.properties.length > 0) return null;
    return readPropertyCache();
  }, []);

  const initialCachedProperties =
    propertyListingStore.properties.length > 0
      ? (propertyListingStore.properties as PropertyType[])
      : ((cachedPropertyData?.properties || []) as PropertyType[]);

  const [properties, setProperties] = useState<PropertyType[]>(
    initialCachedProperties,
  );

  const [loadingProperties, setLoadingProperties] = useState(
    initialCachedProperties.length === 0,
  );

  const [page, setPage] = useState(
    propertyListingStore.properties.length > 0
      ? propertyListingStore.page
      : cachedPropertyData?.page || 1,
  );

  const [hasMore, setHasMore] = useState(
    propertyListingStore.properties.length > 0
      ? propertyListingStore.hasMore
      : (cachedPropertyData?.hasMore ?? true),
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [propertyLoadError, setPropertyLoadError] = useState(false);
  const [refreshingProperties, setRefreshingProperties] = useState(false);
  const [slowLoading, setSlowLoading] = useState(false);

  // ============================================================
  // CRM-MANAGED BANNERS
  // ============================================================
  type BannerType = {
    id: number;
    title: string;
    image_url: string;
    redirect_url?: string | null;
    is_active: boolean;
    display_order: number;
    start_date?: string | null;
    end_date?: string | null;
  };

  const [banners, setBanners] = useState<BannerType[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  // Fetch banners directly from the public FundsArthi API.
  useEffect(() => {
    let cancelled = false;

    const fetchBanners = async () => {
      try {
        const response = await fetch(
          "https://api.fundsarthi.in/api/banners",
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Banner API HTTP ${response.status}`);
        }

        const data = await response.json();
        const incoming: BannerType[] = Array.isArray(data?.data)
          ? data.data
          : [];

        if (!cancelled) {
          setBanners(incoming);
          setActiveBannerIndex(0);
        }
      } catch (error) {
        console.error("[PropertyListing] Banner API Error:", error);

        if (!cancelled) {
          setBanners([]);
          setActiveBannerIndex(0);
        }
      }
    };

    void fetchBanners();

    return () => {
      cancelled = true;
    };
  }, []);

  // Automatically rotate CRM banners every 5 seconds.
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveBannerIndex((current) => (current + 1) % banners.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [banners.length]);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // IntersectionObserver can see the bottom sentinel immediately on a short
  // first page. Never let that automatically walk through dozens of API pages.
  // Pagination starts only after the customer has actually scrolled the list.
  const hasUserScrolledPropertyListRef = useRef(false);

  // Residential category section targets used by the top tabs.
  const budgetSectionRef = useRef<HTMLDivElement | null>(null);
  const luxurySectionRef = useRef<HTMLDivElement | null>(null);
  const premiumSectionRef = useRef<HTMLDivElement | null>(null);

  const [activeListingSection, setActiveListingSection] = useState<
    "budget" | "luxury" | "premium"
  >("budget");
  // Category sections show 8 cards by default for a clean mobile layout.
  // "View More" expands only the selected category into a vertical grid so
  // the complete list can be browsed by normal page scrolling. Recommended
  // For You intentionally has NO view-more control and always stays capped.
  const [expandedListingSection, setExpandedListingSection] = useState<
    "budget" | "luxury" | "premium" | null
  >(null);

  const fetchingPagesRef = useRef<Set<string>>(new Set());
  const firstLoadStartedRef = useRef(false);

  type ListingTab = "Residential" | "Commercial" | "SCO" | "Plot";

  const [categoryLoading, setCategoryLoading] = useState(false);
  const loadedTabDataRef = useRef<Record<ListingTab, boolean>>({
    Residential: true,
    Commercial: false,
    SCO: false,
    Plot: false,
  });
  const tabPageStateRef = useRef<
    Record<ListingTab, { page: number; hasMore: boolean }>
  >({
    Residential: { page: 1, hasMore: true },
    Commercial: { page: 1, hasMore: true },
    SCO: { page: 1, hasMore: true },
    Plot: { page: 1, hasMore: true },
  });
  const categoryBootstrapStartedRef = useRef(false);
  const hotDealsFetchStartedRef = useRef(false);

  // Capture the Back target once. Module memory is preferred; sessionStorage
  // protects the position across a browser/WebView remount.
  const initialScrollStateRef = useRef<PropertyScrollState | null>(
    propertyListingStore.scrollTop > 0 ||
      propertyListingStore.windowScrollTop > 0
      ? {
          scrollTop: propertyListingStore.scrollTop,
          windowScrollTop: propertyListingStore.windowScrollTop,
          savedAt: Date.now(),
        }
      : readPropertyScrollState(),
  );

  const restoringScrollRef = useRef(true);
  const restoreStartedRef = useRef(false);

  const [search, setSearch] = useState(() => propertyListingStore.search);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(() => [
    ...propertyListingStore.selectedFilters,
  ]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Temporary City autocomplete input.
  // This is intentionally NOT persisted in propertyListingStore/localStorage.
  const [citySearch, setCitySearch] = useState("");
  const [sortBy, setSortBy] = useState(() => propertyListingStore.sortBy);
  const [selectedBuilder, setSelectedBuilder] = useState(
    () => propertyListingStore.selectedBuilder,
  );
  const [selectedPlotCategory, setSelectedPlotCategory] = useState(
    () => propertyListingStore.selectedPlotCategory,
  );
  const [priceRange, setPriceRange] = useState(() => [
    ...propertyListingStore.priceRange,
  ]);
  const [selectedLocality, setSelectedLocality] = useState(
    () => propertyListingStore.selectedLocality,
  );
  const [selectedSector, setSelectedSector] = useState(
    () => propertyListingStore.selectedSector,
  );

  // The page owns scrolling so the search bar can become sticky at the viewport top. Prevent the browser from
  // restoring window scroll independently and fighting our exact container
  // restoration when the user comes back from PropertyDetail.
  useEffect(() => {
    if (!("scrollRestoration" in window.history)) return;

    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  const extractSector = (property: PropertyType) => {
    const text = [
      property.location,
      property.locality,
      property.features?.extra?.project_name,
    ]
      .filter(Boolean)
      .join(" ");

    const match = text.match(/\b(?:sector|sec)[-\s]*(\d+[A-Za-z]?)\b/i);

    return match ? `Sector ${match[1].toUpperCase()}` : null;
  };

  const fetchProperties = useCallback(
    async (
      pageNumber: number,
      reset = false,
      silent = false,
      tabOverride?: ListingTab,
    ) => {
      const requestTab: ListingTab =
        tabOverride ||
        (activeTab === "Commercial" ||
        activeTab === "SCO" ||
        activeTab === "Plot"
          ? activeTab
          : "Residential");

      const requestKey = `${requestTab}:${pageNumber}`;

      // IntersectionObserver can fire more than once while a request is in
      // flight. The key includes the tab because page 1 of Commercial and
      // page 1 of Residential are different requests.
      if (fetchingPagesRef.current.has(requestKey)) {
        return;
      }

      fetchingPagesRef.current.add(requestKey);
      const requestStartedAt = performance.now();

      try {
        console.log("[PropertyListing] fetchProperties:start", {
          pageNumber,
          reset,
          silent,
          requestTab,
        });

        if (silent && pageNumber === 1) {
          setRefreshingProperties(true);
        } else if (!silent) {
          if (reset) {
            setLoadingProperties(true);
          } else {
            setLoadingMore(true);
          }
        }

        const params = new URLSearchParams();
        params.set("page", String(pageNumber));
        params.set("limit", "12");
        params.set("tab", requestTab);

        // Cold first paint can use normal HTTP/browser/CDN caching.
        // Background refresh and pagination deliberately bypass cache.
        if (!(reset && !silent)) {
          params.set("_refresh", `${Date.now()}-${requestTab}-${pageNumber}`);
        }

        const isColdFirstLoad = reset && !silent;

        const response = await fetch(
          `https://api.fundsarthi.in/api/properties?${params.toString()}`,
          {
            method: "GET",
            cache: isColdFirstLoad ? "default" : "no-store",
            headers: {
              Accept: "application/json",
              ...(isColdFirstLoad
                ? {}
                : {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                  }),
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        const newProperties: PropertyType[] = Array.isArray(data?.data)
          ? data.data
          : [];
        const nextHasMore = data?.pagination?.has_next === true;

        setPropertyLoadError(false);

        if (reset && !silent && newProperties.length === 0) {
          setPropertyLoadError(true);
        }

        setProperties((previous) => {
          if (reset) {
            // Only a true cold/failure-retry reset is allowed to replace the
            // current dataset. Normal category warming never uses reset.
            return newProperties;
          }

          const incomingById = new Map(
            newProperties.map((property) => [String(property.id), property]),
          );

          const updatedPrevious = previous.map(
            (property) => incomingById.get(String(property.id)) || property,
          );

          const existingIds = new Set(
            updatedPrevious.map((property) => String(property.id)),
          );

          const additions = newProperties.filter(
            (property) => !existingIds.has(String(property.id)),
          );

          if (pageNumber === 1) {
            // Newest page first, then keep all other loaded categories/records.
            return [...newProperties, ...updatedPrevious, ...additions].filter(
              (property, index, all) =>
                all.findIndex(
                  (candidate) => String(candidate.id) === String(property.id),
                ) === index,
            );
          }

          return [...updatedPrevious, ...additions];
        });

        tabPageStateRef.current[requestTab] = {
          page: Math.max(
            tabPageStateRef.current[requestTab]?.page || 1,
            pageNumber,
          ),
          hasMore: nextHasMore,
        };

        if (requestTab === activeTab || reset) {
          setPage((previousPage) =>
            reset ? pageNumber : Math.max(previousPage, pageNumber),
          );
          setHasMore(nextHasMore);
        }

        if (pageNumber === 1) {
          lastPropertyRefreshRef.current = Date.now();
        }

        console.log("[PropertyListing] properties state update queued", {
          pageNumber,
          requestTab,
          reset,
          newCount: newProperties.length,
          nextHasMore,
          elapsedMs: Math.round(performance.now() - requestStartedAt),
        });
      } catch (error) {
        console.error(
          `[PropertyListing] Properties API Error (${requestTab} page ${pageNumber}):`,
          error,
        );

        // Never wipe a visible listing because a background request failed.
        if (reset && !silent) {
          setPropertyLoadError(true);
          setProperties((previous) => previous);
        }
      } finally {
        fetchingPagesRef.current.delete(requestKey);

        if (silent && pageNumber === 1) {
          setRefreshingProperties(false);
        } else if (!silent) {
          if (reset) setLoadingProperties(false);
          setLoadingMore(false);
        }
      }
    },
    [activeTab],
  );

  // Fetch one category page without touching the full-page loader.
  // This is used to warm Commercial/SCO/Plot in the background and to make a
  // category click resilient if its background request has not finished yet.
  const fetchTabPage = useCallback(
    async (tab: ListingTab, pageNumber = 1, showCategoryLoader = false) => {
      const requestKey = `${tab}:${pageNumber}`;

      if (fetchingPagesRef.current.has(requestKey)) {
        if (showCategoryLoader) {
          setCategoryLoading(true);
          const waitForExistingRequest = window.setInterval(() => {
            if (!fetchingPagesRef.current.has(requestKey)) {
              window.clearInterval(waitForExistingRequest);
              setCategoryLoading(false);
            }
          }, 100);
        }
        return;
      }

      if (showCategoryLoader) {
        setCategoryLoading(true);
      }

      fetchingPagesRef.current.add(requestKey);

      try {
        const params = new URLSearchParams();
        params.set("page", String(pageNumber));
        params.set("limit", "12");
        params.set("tab", tab);
        params.set("_refresh", `${Date.now()}-${tab}-${pageNumber}`);

        const response = await fetch(
          `https://api.fundsarthi.in/api/properties?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const incoming: PropertyType[] = Array.isArray(data?.data)
          ? data.data
          : [];
        const hasNext = data?.pagination?.has_next === true;

        setProperties((previous) => {
          const incomingById = new Map(
            incoming.map((property) => [String(property.id), property]),
          );

          const updated = previous.map(
            (property) => incomingById.get(String(property.id)) || property,
          );

          const existingIds = new Set(
            updated.map((property) => String(property.id)),
          );

          const additions = incoming.filter(
            (property) => !existingIds.has(String(property.id)),
          );

          const merged =
            pageNumber === 1
              ? [...incoming, ...updated, ...additions]
              : [...updated, ...additions];

          const seen = new Set<string>();
          return merged.filter((property) => {
            const id = String(property.id);
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
          });
        });

        const previousState = tabPageStateRef.current[tab];
        tabPageStateRef.current[tab] = {
          page: Math.max(previousState.page, pageNumber),
          hasMore,
        };
        loadedTabDataRef.current[tab] = true;

        // Only update the visible tab's pagination state.
        if (activeTab === tab) {
          setPage((current) =>
            pageNumber === 1 ? 1 : Math.max(current, pageNumber),
          );
          setHasMore(hasNext);
        }

        setPropertyLoadError(false);

        console.log("[PropertyListing] category page warmed:", {
          tab,
          pageNumber,
          count: incoming.length,
          hasNext,
        });
      } catch (error) {
        console.error(
          `[PropertyListing] category ${tab} page ${pageNumber} failed:`,
          error,
        );
      } finally {
        fetchingPagesRef.current.delete(requestKey);
        if (showCategoryLoader) {
          setCategoryLoading(false);
        }
      }
    },
    [activeTab],
  );

  const fetchHotDeals = useCallback(async () => {
    if (hotDealsFetchStartedRef.current) return;
    hotDealsFetchStartedRef.current = true;

    try {
      const response = await fetch(
        "https://api.fundsarthi.in/api/properties/hot-deals?_refresh=" +
          Date.now(),
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Hot Deals HTTP ${response.status}`);
      }

      const data = await response.json();
      const incoming: PropertyType[] = Array.isArray(data?.data)
        ? data.data
        : [];

      setHotDeals(incoming);
      console.log("[PropertyListing] hot deals loaded:", incoming.length);
    } catch (error) {
      console.error("[PropertyListing] Hot Deals API Error:", error);
    }
  }, []);

  const warmSecondaryTabs = useCallback(async () => {
    if (categoryBootstrapStartedRef.current) return;
    categoryBootstrapStartedRef.current = true;

    // Residential is already available from the 100-record server snapshot.
    // Only warm the other listing tabs here.
    await Promise.all([
      fetchTabPage("Commercial", 1, false),
      fetchTabPage("SCO", 1, false),
      fetchTabPage("Plot", 1, false),
      fetchHotDeals(),
    ]);
  }, [fetchHotDeals, fetchTabPage]);

  // Refresh every page that is currently loaded.
  //
  // The display cache is intentionally kept for instant Back navigation, but
  // cached properties must NEVER become the source of truth. A page-1-only
  // refresh is not enough because an edited/deleted property may currently
  // live on page 2, 3, etc. Re-fetch all loaded pages and replace the loaded
  // dataset only when all requests succeed.
  const refreshLoadedProperties = useCallback(async () => {
    const loadedPageCount = Math.max(1, page);
    const requestPages = Array.from(
      { length: loadedPageCount },
      (_, index) => index + 1,
    );

    try {
      setRefreshingProperties(true);

      const responses = await Promise.all(
        requestPages.map(async (pageNumber) => {
          const params = new URLSearchParams();
          params.set("page", String(pageNumber));
          params.set("limit", "12");

          // IMPORTANT:
          // Background refresh must use the currently selected tab.
          // Without this, the API can return a mixed page containing
          // Commercial/SCO/Plot records. A mixed refresh used to replace
          // the 100-record Residential server snapshot and could make the
          // Residential screen appear empty.
          if (
            activeTab === "Residential" ||
            activeTab === "Commercial" ||
            activeTab === "SCO" ||
            activeTab === "Plot"
          ) {
            params.set("tab", activeTab);
          }

          params.set(
            "_refresh",
            `${Date.now()}-${pageNumber}-${Math.random()}`,
          );

          const response = await fetch(
            `https://api.fundsarthi.in/api/properties?${params.toString()}`,
            {
              method: "GET",
              cache: "no-store",
              headers: {
                Accept: "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
              },
            },
          );

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();

          return {
            pageNumber,
            properties: Array.isArray(data.data)
              ? (data.data as PropertyType[])
              : [],
            hasNext: data.pagination?.has_next === true,
          };
        }),
      );

      const latestProperties = responses
        .sort((a, b) => a.pageNumber - b.pageNumber)
        .flatMap((result) => result.properties);

      // Never let a successful-but-empty API response wipe the screen.
      // This is especially important after the instant Residential
      // server-cache has already painted 100 properties.
      if (latestProperties.length === 0) {
        console.warn(
          "[PropertyListing] Background refresh returned 0 properties. Keeping existing listing.",
        );
        return;
      }

      const latestById = new Map<string, PropertyType>();

      latestProperties.forEach((property) => {
        const id = String(property.id);
        if (!latestById.has(id)) {
          latestById.set(id, property);
        }
      });

      setProperties((previous) => {
        // Background refresh is NEVER allowed to replace the complete
        // cached dataset with only the currently returned API pages.
        //
        // Instead:
        //   1. update existing records with their latest API version
        //   2. prepend genuinely new records
        //   3. keep every previously cached record that was not returned
        //
        // Therefore a temporary API response containing 0/12/24 records
        // cannot turn the Residential page into a blank screen.
        const updatedPrevious = previous.map(
          (property) => latestById.get(String(property.id)) || property,
        );

        const existingIds = new Set(
          updatedPrevious.map((property) => String(property.id)),
        );

        const additions = latestProperties.filter(
          (property) => !existingIds.has(String(property.id)),
        );

        const merged = [...latestProperties, ...updatedPrevious, ...additions];

        const seen = new Set<string>();

        return merged.filter((property) => {
          const id = String(property.id);

          if (seen.has(id)) return false;

          seen.add(id);
          return true;
        });
      });

      setHasMore(responses.some((response) => response.hasNext));
      setPropertyLoadError(false);
      lastPropertyRefreshRef.current = Date.now();

      console.log("[PropertyListing] background refresh merged safely:", {
        loadedPages: requestPages.length,
        apiProperties: latestProperties.length,
      });
    } catch (error) {
      console.error("Properties refresh error:", error);

      // CRITICAL:
      // The current cached/in-memory listing stays untouched.
      // Never setProperties([]) here.
    } finally {
      setRefreshingProperties(false);
    }
  }, [page, activeTab]);

  // When the user returns to the app/browser tab, immediately reconcile the
  // cached listing with the latest CRM data. This catches edits made in the
  // CRM/admin panel while the listing was already open.
  const lastPropertyRefreshRef = useRef(0);

  useEffect(() => {
    if (loadingProperties) return;

    const refreshIfNeeded = () => {
      const now = Date.now();

      // Avoid duplicate focus + visibility events causing two simultaneous
      // full refreshes. A 2-second guard is enough while still refreshing
      // every time the user meaningfully returns to the page.
      if (now - lastPropertyRefreshRef.current < 30000) return;

      lastPropertyRefreshRef.current = now;
      refreshLoadedProperties();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshIfNeeded();
      }
    };

    window.addEventListener("focus", refreshIfNeeded);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", refreshIfNeeded);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadingProperties, refreshLoadedProperties]);

  // Also reconcile periodically while the listing remains open. This makes
  // CRM property edits appear without requiring a manual page reload.
  useEffect(() => {
    if (loadingProperties) return;

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshLoadedProperties();
      }
    }, 30000);

    return () => window.clearInterval(interval);
  }, [loadingProperties, refreshLoadedProperties]);

  // Always save the scroll position BEFORE leaving the listing screen.
  // Every property card uses this function, so all Back paths behave the same.
  const openProperty = useCallback(
    (propertyId: number) => {
      const container = scrollContainerRef.current;

      // Capture the exact position BEFORE changing routes.
      // This is the authoritative value used when /property/:id goes Back.
      const currentScrollTop = container?.scrollTop ?? 0;
      const currentWindowScrollTop = window.scrollY;

      propertyListingStore.scrollTop = currentScrollTop;
      propertyListingStore.windowScrollTop = currentWindowScrollTop;

      // Persist BEFORE route navigation so Back always knows exactly where
      // the customer was.
      writePropertyScrollState(currentScrollTop, currentWindowScrollTop);

      // Tell PropertyListing that the next mount is a return from a detail page.
      // On this path we MUST NOT wait for the API again.
      try {
        sessionStorage.setItem(PROPERTY_RETURNING_FROM_DETAIL_KEY, "1");
      } catch {
        // Ignore storage errors.
      }

      propertyListingStore.properties = properties;
      propertyListingStore.page = page;
      propertyListingStore.hasMore = hasMore;
      propertyListingStore.activeTab = activeTab;
      propertyListingStore.search = search;
      propertyListingStore.selectedFilters = [...selectedFilters];
      propertyListingStore.sortBy = sortBy;
      propertyListingStore.selectedBuilder = selectedBuilder;
      propertyListingStore.selectedPlotCategory = selectedPlotCategory;
      propertyListingStore.priceRange = [...priceRange];
      propertyListingStore.selectedLocality = selectedLocality;
      propertyListingStore.selectedSector = selectedSector;

      navigate(`/property/${propertyId}`);
    },
    [
      navigate,
      properties,
      page,
      hasMore,
      activeTab,
      search,
      selectedFilters,
      sortBy,
      selectedBuilder,
      selectedPlotCategory,
      priceRange,
      selectedLocality,
      selectedSector,
    ],
  );

  // Keep the complete listing state in memory. This is the important part for
  // mobile Back navigation: the component may unmount, but this module-level
  // store stays alive while the app/WebView stays alive.
  useEffect(() => {
    propertyListingStore.properties = properties;
    propertyListingStore.page = page;
    propertyListingStore.hasMore = hasMore;
    propertyListingStore.activeTab = activeTab;
    propertyListingStore.search = search;
    propertyListingStore.selectedFilters = [...selectedFilters];
    propertyListingStore.sortBy = sortBy;
    propertyListingStore.selectedBuilder = selectedBuilder;
    propertyListingStore.selectedPlotCategory = selectedPlotCategory;
    propertyListingStore.priceRange = [...priceRange];
    propertyListingStore.selectedLocality = selectedLocality;
    propertyListingStore.selectedSector = selectedSector;
  }, [
    properties,
    page,
    hasMore,
    activeTab,
    search,
    selectedFilters,
    sortBy,
    selectedBuilder,
    selectedPlotCategory,
    priceRange,
    selectedLocality,
    selectedSector,
  ]);

  // Persist the complete loaded listing. This is intentionally separate from
  // the network request so Back never has to wait for the API just to rebuild
  // pages the customer has already seen.
  useEffect(() => {
    if (!properties.length) return;

    writePropertyCache(properties, page, hasMore);
  }, [properties, page, hasMore]);

  // Save the listing position continuously while the user scrolls.
  // There is intentionally NO unmount save: during route teardown a detached
  // container can briefly report 0 and overwrite the correct saved position.
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const saveScroll = () => {
      if (restoringScrollRef.current) return;

      const scrollTop = container.scrollTop;

      // Header visibility is controlled ONLY by handleHeaderScroll above.
      // This listener is only responsible for persisting the scroll position.
      // Keeping these concerns separate is important: if this handler also
      // collapsed the header based on scrollTop, scrolling UP would immediately
      // collapse it again instead of allowing the direction-based handler to
      // expand it.
      propertyListingStore.scrollTop = scrollTop;
      propertyListingStore.windowScrollTop = window.scrollY;
      writePropertyScrollState(scrollTop, window.scrollY);
    };

    container.addEventListener("scroll", saveScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", saveScroll);
    };
  }, []);

  // Restore the exact listing position after Back navigation.
  // useLayoutEffect runs before the browser paints the remounted list, which
  // prevents the visible "jump to top -> jump back down" effect.
  useLayoutEffect(() => {
    if (!properties.length || restoreStartedRef.current) return;

    const saved = initialScrollStateRef.current;

    if (!saved) {
      restoringScrollRef.current = false;
      return;
    }

    const target = Math.max(0, saved.scrollTop);
    const windowTarget = Math.max(0, saved.windowScrollTop);

    if (target <= 0 && windowTarget <= 0) {
      restoringScrollRef.current = false;
      return;
    }

    restoreStartedRef.current = true;

    let cancelled = false;
    let frame = 0;
    let attempts = 0;
    let observer: ResizeObserver | null = null;

    const applyWindowScroll = () => {
      if (Math.abs(window.scrollY - windowTarget) > 1) {
        window.scrollTo(0, windowTarget);
      }
    };

    const restore = () => {
      if (cancelled) return;

      const container = scrollContainerRef.current;

      if (!container) {
        frame = requestAnimationFrame(restore);
        return;
      }

      applyWindowScroll();

      const maxScroll = Math.max(
        0,
        container.scrollHeight - container.clientHeight,
      );

      // If the saved point is not reachable yet, wait for more cards/images.
      if (maxScroll < target && attempts < 300) {
        attempts += 1;
        frame = requestAnimationFrame(restore);
        return;
      }

      container.scrollTop = Math.min(target, maxScroll);

      frame = requestAnimationFrame(() => {
        if (cancelled) return;

        const current = scrollContainerRef.current;

        if (!current) {
          frame = requestAnimationFrame(restore);
          return;
        }

        const finalMax = Math.max(
          0,
          current.scrollHeight - current.clientHeight,
        );

        current.scrollTop = Math.min(target, finalMax);
        applyWindowScroll();

        // Images can change layout after the first paint.
        if (Math.abs(current.scrollTop - target) > 1 && attempts < 300) {
          attempts += 1;
          frame = requestAnimationFrame(restore);
          return;
        }

        restoringScrollRef.current = false;
      });
    };

    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        if (!cancelled) restore();
      });

      if (scrollContainerRef.current) {
        observer.observe(scrollContainerRef.current);
      }
    }

    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(restore);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [properties.length]);

  // Give the customer feedback if the first request is genuinely slow.
  // This does not block, cancel, or retry the request; it only changes the
  // loading message so a long wait never feels like a frozen screen.
  useEffect(() => {
    if (!loadingProperties) {
      setSlowLoading(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setSlowLoading(true);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [loadingProperties]);

  // Any search/filter/sort criterion currently active.
  // Keep this separate from loading state so filters never trigger the
  // full-page loader just because there are zero current matches.
  const hasActiveCriteria =
    Boolean(search.trim()) ||
    selectedFilters.length > 0 ||
    Boolean(selectedLocality) ||
    Boolean(selectedSector) ||
    Boolean(selectedBuilder) ||
    Boolean(selectedPlotCategory) ||
    Boolean(sortBy) ||
    priceRange[0] > 0 ||
    priceRange[1] < 50;

  // Cold-load helper:
  //
  // IMPORTANT PERFORMANCE ARCHITECTURE:
  // The API paginates the complete property dataset before the UI applies the
  // Residential / Commercial / SCO / Plot tabs. Therefore we do NOT load one
  // category first and then search for another category page-by-page.
  //
  // Pages 1-4 are requested IN PARALLEL. Every page is processed immediately
  // when its response arrives. We classify the returned records into the same
  // four tab buckets used by the UI:
  //   Residential / Commercial / SCO / Plot
  //
  // The active tab is painted as soon as ANY completed page contains matching
  // records. We do not wait for all four requests.
  //
  // Example:
  //   page 3 returns Commercial first  -> Commercial can paint immediately
  //   page 2 returns Residential next  -> Residential can paint immediately
  //   page 1/page 4 continue in background
  //
  // After the bootstrap, page 5+ is still protected by the real-user-scroll
  // guard below, so a visible bottom sentinel cannot walk through dozens of
  // pages automatically.
  const fetchInitialColdLoad = useCallback(async () => {
    const startedAt = performance.now();

    try {
      setPropertyLoadError(false);
      setActiveTab("Residential");
      propertyListingStore.activeTab = "Residential";

      // ============================================================
      // STEP 1: SERVER-CACHED RESIDENTIAL FIRST PAINT
      // ============================================================
      // The first screen depends only on the persistent 100-record
      // Residential snapshot. No multi-page bootstrap is needed.
      const response = await fetch(
        "https://api.fundsarthi.in/api/properties/instant-residential",
        {
          method: "GET",
          cache: "default",
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Instant residential HTTP ${response.status}`);
      }

      const data = await response.json();
      const instantProperties: PropertyType[] = Array.isArray(data?.data)
        ? data.data
        : [];

      if (!instantProperties.length) {
        throw new Error("Instant residential cache returned no properties");
      }

      setProperties(instantProperties);
      setPage(1);
      setHasMore(true);
      setActiveTab("Residential");
      propertyListingStore.activeTab = "Residential";
      loadedTabDataRef.current.Residential = true;
      tabPageStateRef.current.Residential = {
        page: 1,
        hasMore: true,
      };
      lastPropertyRefreshRef.current = Date.now();
      setLoadingProperties(false);
      setPropertyLoadError(false);

      console.log("[PropertyListing] RESIDENTIAL SERVER CACHE PAINTED:", {
        count: instantProperties.length,
        source: data?.source,
        elapsedMs: Math.round(performance.now() - startedAt),
      });

      // ============================================================
      // STEP 2: BACKGROUND ONLY
      // ============================================================
      // Do not load Residential pages 1-8 here. The 100-record server cache
      // already exists specifically to avoid that first-load work.
      //
      // Warm the other categories and Hot Deals in parallel so their first
      // tab click is normally instant.
      void warmSecondaryTabs();

      // One lightweight Residential page-1 refresh is enough to reconcile
      // newly-created/edited records without walking the whole dataset.
      void fetchProperties(1, false, true, "Residential");
    } catch (instantError) {
      console.error(
        "[PropertyListing] instant residential cache failed; using live Residential page 1:",
        instantError,
      );

      // Fallback only: if the server snapshot is unavailable, get one
      // Residential page. We still do NOT walk pages 1-4.
      try {
        await fetchProperties(1, true, false, "Residential");
        loadedTabDataRef.current.Residential = true;

        void warmSecondaryTabs();
        void fetchHotDeals();

        console.log("[PropertyListing] live Residential fallback complete:", {
          elapsedMs: Math.round(performance.now() - startedAt),
        });
      } catch (fallbackError) {
        console.error(
          "[PropertyListing] live Residential fallback failed:",
          fallbackError,
        );
        setActiveTab("Residential");
        propertyListingStore.activeTab = "Residential";
        setPropertyLoadError(true);
        setLoadingProperties(false);
      }
    }
  }, [fetchHotDeals, fetchProperties, warmSecondaryTabs]);

  // First visit / Back navigation.
  //
  // IMPORTANT:
  // Cached/in-memory listings render immediately so Back never waits for the API.
  // We still refresh page 1 silently so CRM changes (including Hot Deal/Trending
  // flags) are reflected without showing the full-page loader.
  useEffect(() => {
    if (firstLoadStartedRef.current) return;
    firstLoadStartedRef.current = true;
    console.log("[PropertyListing] first-load effect started");

    const hasMemoryCache = propertyListingStore.properties.length > 0;
    const browserCache = readPropertyCache();

    let returningFromDetail = false;

    try {
      returningFromDetail =
        sessionStorage.getItem(PROPERTY_RETURNING_FROM_DETAIL_KEY) === "1";

      if (returningFromDetail) {
        sessionStorage.removeItem(PROPERTY_RETURNING_FROM_DETAIL_KEY);
      }
    } catch {
      // Ignore storage errors.
    }

    console.log("[PropertyListing] cache state:", {
      hasMemoryCache,
      browserCacheCount: browserCache?.properties?.length || 0,
      returningFromDetail,
      activeTab,
      search,
      selectedFilters,
      selectedLocality,
      selectedSector,
      selectedBuilder,
      selectedPlotCategory,
      priceRange,
    });

    if (
      returningFromDetail &&
      (hasMemoryCache || browserCache?.properties?.length)
    ) {
      setLoadingProperties(false);

      // Back remains instant, but page 1 is refreshed silently so any CRM flag
      // change made while the customer was away is reflected immediately.
      fetchProperties(1, false, true);
      void warmSecondaryTabs();
      return;
    }

    if (hasMemoryCache) {
      setLoadingProperties(false);

      // Keep cached listings visible. Refresh the current tab silently and
      // warm the other categories + global Hot Deals in the background.
      fetchProperties(1, false, true);
      void warmSecondaryTabs();
      return;
    }

    if (browserCache?.properties?.length) {
      setLoadingProperties(false);

      fetchProperties(1, false, true);
      void warmSecondaryTabs();
      return;
    }

    // Only the first genuinely cold visit waits for the API.
    // Bootstrap a few pages only when page 1 cannot provide a Residential
    // listing; never auto-walk through pages based on the bottom sentinel.
    fetchInitialColdLoad();
  }, [fetchProperties, fetchInitialColdLoad, warmSecondaryTabs]);

  // ✅ NORMALIZE PURPOSE
  const normalizePurpose = (purpose: string) => {
    if (purpose === "sale" || purpose === "sell") return "buy";
    return purpose;
  };

  const normalize = (val: any) => {
    if (val === null || val === undefined) return "";
    return val
      .toString()
      .toLowerCase()
      .replace(/[-_]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const parsePrice = (price: any) => {
    if (!price) return 0;

    const str = String(price).toLowerCase().trim();
    const value = parseFloat(str.replace(/[^\d.]/g, ""));

    if (!Number.isFinite(value)) return 0;

    if (str.includes("cr") || str.includes("crore")) {
      return value * 10000000;
    }

    if (str.includes("lac") || str.includes("lakh")) {
      return value * 100000;
    }

    return value;
  };

  // Use one normalization rule everywhere so values such as
  // "Golf-Course_Road" and "golf course road" compare consistently.
  const normalizeText = (value: any) => normalize(value);

  // API/DB drivers can return boolean flags as true/false, 1/0, or
  // "true"/"false"/"1"/"0". Never treat the string "0" as enabled.
  const isEnabledFlag = (value: any): boolean => {
    if (value === true || value === 1) return true;
    if (
      value === false ||
      value === 0 ||
      value === null ||
      value === undefined
    ) {
      return false;
    }

    const normalized = normalize(value);
    return normalized === "true" || normalized === "1" || normalized === "yes";
  };

  const getPropertyType = (property: PropertyType) => {
    return normalizeText(
      property.property_type ||
        property.features?.extra?.property_type ||
        property.title,
    );
  };

  const getBuilder = (property: PropertyType) => {
    return normalizeText(property.features?.extra?.builder);
  };

  const getAmenities = (property: PropertyType) => {
    return [
      ...(property.features?.highlights || []),
      ...(property.features?.facilities || []),
    ].map(normalizeText);
  };

  const OUTER_LOCATIONS = [
    "Sohna",
    "New Gurgaon",
    "Greater Noida",
    "Noida Extension",
    "Faridabad",
    "Sector 95",
    "Sector 102",
  ];

  const PREMIUM_LOCATIONS = [
    "Golf Course Road",
    "Golf Course Extension Road",
    "Dwarka Expressway",
    "Central Delhi",
  ];

  const PREMIUM_BUILDERS = ["DLF", "M3M", "Godrej", "Sobha", "Trump", "Adani"];

  // ============================================================
  // LISTING CATEGORY CONFIGURATION
  // ============================================================
  //
  // Budget Friendly
  //   - Below ₹3 Cr
  //   - Intended positioning: affordable homes, low-rise floors,
  //     outer/locality properties and other value-focused listings.
  //
  // Luxury
  //   - ₹3 Cr to below ₹7 Cr
  //   - ALL property types are included:
  //     apartments, floors, penthouses, plots, independent houses, etc.
  //
  // Premium
  //   - ₹7 Cr and above
  //   - ALL eligible property types are included.
  //
  // These categories are based on price. Property type is NOT used
  // to hide a listing from Luxury or Premium.
  // ============================================================
  const LISTING_CATEGORY_CONFIG = {
    budgetMax: 3 * 10000000, // ₹3 Cr
    premiumMin: 7 * 10000000, // ₹7 Cr
  } as const;

  const getListingCategory = (property: PropertyType) => {
    const price = parsePrice(property.price);

    if (price < LISTING_CATEGORY_CONFIG.budgetMax) {
      return "budget";
    }

    if (price < LISTING_CATEGORY_CONFIG.premiumMin) {
      return "luxury";
    }

    return "premium";
  };

  // ✅ Dynamic Cities
  const cities = useMemo(() => {
    return [
      ...new Set(
        properties
          .map((p) => {
            const parts = p.location?.split(",");

            // last value = city
            return parts?.[parts.length - 1]?.trim();
          })
          .filter(Boolean),
      ),
    ];
  }, [properties]);

  // City autocomplete suggestions.
  // Search text is temporary UI state only and is never saved as search history.
  const filteredCitySuggestions = useMemo(() => {
    const query = citySearch.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return cities
      .filter((city) => city.toLowerCase().includes(query))
      .filter(
        (city) =>
          !selectedFilters.some(
            (selected) => selected.toLowerCase() === city.toLowerCase(),
          ),
      )
      .slice(0, 8);
  }, [cities, citySearch, selectedFilters]);

  // Close the filter drawer and reset only the temporary City search text.
  // Selected filters remain unchanged.
  const closeFilterDrawer = useCallback(() => {
    setCitySearch("");
    setIsFilterOpen(false);
  }, []);

  // ✅ Dynamic Locations
  // Locality = ONLY locality / road, never sector
  const localities = useMemo(() => {
    const selectedCity = selectedFilters.find((city) => cities.includes(city));

    const filtered = selectedCity
      ? properties.filter(
          (p) => p.city?.toLowerCase() === selectedCity.toLowerCase(),
        )
      : properties;

    return [
      ...new Set(
        filtered
          .map((p) => p.locality?.trim())
          .filter(Boolean)
          .filter(
            (locality) =>
              !/\b(?:sector|sec)[-\s]*\d+[A-Za-z]?\b/i.test(locality!),
          ),
      ),
    ].sort();
  }, [properties, selectedFilters, cities]);

  // ✅ Dynamic Projects
  // Sector = ONLY extracted Sector values
  const sectors = useMemo(() => {
    let filtered = properties;

    const selectedCity = selectedFilters.find((city) => cities.includes(city));

    if (selectedCity) {
      filtered = filtered.filter(
        (p) => p.city?.toLowerCase() === selectedCity.toLowerCase(),
      );
    }

    if (selectedLocality) {
      filtered = filtered.filter(
        (p) => p.locality?.toLowerCase() === selectedLocality.toLowerCase(),
      );
    }

    return [...new Set(filtered.map(extractSector).filter(Boolean))].sort(
      (a, b) => a!.localeCompare(b!, undefined, { numeric: true }),
    );
  }, [properties, selectedFilters, selectedLocality, cities]);

  // ✅ Dynamic Builders
  const builders = useMemo(() => {
    return [
      ...new Set(
        properties
          .map((p: any) => p?.features?.extra?.builder || p?.builder)
          .filter(Boolean),
      ),
    ];
  }, [properties]);

  const filteredProperties = useMemo(() => {
    let filtered = properties.filter((p) => {
      if (activeTab === "sell") return false;

      // ✅ PROPERTY TYPE FILTER
      const propertyCategory = normalizeText(
        p?.category || p?.features?.extra?.category || "",
      );

      const propertyType = normalizeText(
        p?.property_type || p?.features?.extra?.property_type || "",
      );

      // PROPERTY CATEGORY FILTER
      // The API may return values such as "Apartment", "Flat", "Villa",
      // "Residential Apartment", etc. Do not require an exact "residential"
      // string or valid residential listings can disappear from the feed.
      const rawCategory = normalizeText(
        p?.category || p?.features?.extra?.category || "",
      );
      const rawPropertyType = normalizeText(
        p?.property_type || p?.features?.extra?.property_type || "",
      );
      const categoryText = `${rawCategory} ${rawPropertyType}`.trim();

      const isPlot =
        categoryText.includes("plot") || categoryText.includes("land");

      const isSCO =
        categoryText.includes("sco") ||
        categoryText.includes("shop cum office") ||
        categoryText.includes("shop-cum-office");

      const isCommercial =
        categoryText.includes("commercial") ||
        categoryText.includes("office") ||
        categoryText.includes("shop") ||
        categoryText.includes("retail") ||
        categoryText.includes("warehouse") ||
        categoryText.includes("showroom") ||
        categoryText.includes("industrial");

      const isResidential =
        categoryText.includes("residential") ||
        categoryText.includes("apartment") ||
        categoryText.includes("flat") ||
        categoryText.includes("villa") ||
        categoryText.includes("independent house") ||
        categoryText.includes("builder floor") ||
        categoryText.includes("studio") ||
        categoryText.includes("penthouse") ||
        categoryText.includes("house") ||
        categoryText.includes("residence");

      // If the API did not provide category/type at all, keep the property
      // visible in the default Residential feed instead of hiding it.
      const hasCategoryData = Boolean(categoryText);

      if (activeTab === "Residential") {
        if (isPlot || isSCO || isCommercial) {
          return false;
        }

        if (hasCategoryData && !isResidential) {
          console.warn(
            "[PropertyListing] Residential classification fallback:",
            {
              id: p?.id,
              title: p?.title,
              category: p?.category,
              property_type: p?.property_type,
            },
          );
        }
      }

      if (activeTab === "Commercial") {
        if (!isCommercial || isPlot || isSCO) {
          return false;
        }
      }

      if (activeTab === "SCO") {
        if (!isSCO) {
          return false;
        }
      }

      if (activeTab === "Plot") {
        if (!isPlot) {
          return false;
        }

        // Plot sub-category filter
        if (selectedPlotCategory) {
          const plotCategory = normalizeText(
            p?.category || p?.features?.extra?.category || "",
          )
            .replace(/[-_]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          if (selectedPlotCategory === "Residential") {
            if (!plotCategory.includes("residential")) {
              return false;
            }
          }

          if (selectedPlotCategory === "Commercial") {
            if (!plotCategory.includes("commercial")) {
              return false;
            }
          }

          if (selectedPlotCategory === "SCO") {
            if (!plotCategory.includes("sco")) {
              return false;
            }
          }
        }
      }

      const builderName = normalize(
        p?.features?.extra?.builder || (p as any)?.builder || "",
      );

      if (
        selectedBuilder &&
        !builderName.includes(normalize(selectedBuilder))
      ) {
        return false;
      }

      // Search across title, location, city, locality, project and builder.
      // This also supports multi-word searches such as "Laburnum developers".
      if (search.trim()) {
        const searchTokens = normalizeText(search).split(/\s+/).filter(Boolean);

        const searchableText = normalizeText(
          [
            p.title,
            p.location,
            p.city,
            p.locality,
            p.features?.extra?.project_name,
            p.features?.extra?.builder,
            p.property_type,
            p.features?.extra?.property_type,
            p.category,
          ]
            .filter(Boolean)
            .join(" "),
        );

        if (!searchTokens.every((token) => searchableText.includes(token))) {
          return false;
        }
      }

      const price = parsePrice(p.price);

      const extra = p?.features?.extra || {};
      const highlights = p?.features?.highlights || [];
      const facilities = p?.features?.facilities || [];

      const amenities = [...highlights, ...facilities].map((a) => normalize(a));

      // ✅ CITY FILTERS
      // Multiple selected cities are alternatives (OR), not requirements (AND).
      // Match against both the explicit city field and the full location because
      // some API records do not populate p.city consistently.
      const selectedCities = selectedFilters.filter((filter) =>
        cities.some((city) => normalizeText(city) === normalizeText(filter)),
      );

      if (selectedCities.length > 0) {
        const propertyCityText = normalizeText(
          [p.city, p.location, p.locality].filter(Boolean).join(" "),
        );

        if (
          !selectedCities.some((city) =>
            propertyCityText.includes(normalizeText(city)),
          )
        ) {
          return false;
        }
      }

      // ✅ Locality Filter
      if (
        selectedLocality &&
        p.locality?.toLowerCase() !== selectedLocality.toLowerCase()
      ) {
        return false;
      }

      // ✅ Sector Filter
      // Sector Filter
      if (selectedSector) {
        const propertySector = extractSector(p);

        if (propertySector !== selectedSector) {
          return false;
        }
      }

      // ✅ BUILDER FILTERS
      // Multiple selected builders are alternatives (OR), not requirements (AND).
      const builder = p?.features?.extra?.builder || (p as any)?.builder || "";

      const selectedBuilders = selectedFilters.filter((filter) =>
        builders.some((item) => item.toLowerCase() === filter.toLowerCase()),
      );

      if (selectedBuilders.length > 0) {
        const propertyBuilder = normalize(builder);

        if (
          !selectedBuilders.some((item) =>
            propertyBuilder.includes(normalize(item)),
          )
        ) {
          return false;
        }
      }

      // ✅ BHK FILTER (FINAL FIX)
      const bhkMap: any = {
        "1 BHK": ["1"],
        "2 BHK": ["2"],
        "3 BHK": ["3"],
        "4 BHK": ["4"],

        "4+ BHK": ["5", "6", "7"],

        "2 BHK + S": ["2+s", "2 bhk+s", "2bhk+s"],
        "3 BHK + S": ["3+s", "3 bhk+s", "3bhk+s"],
        "4 BHK + S": ["4+s", "4 bhk+s", "4bhk+s"],
        "5 BHK + S": ["5+s", "5 bhk+s", "5bhk+s"],
      };

      const beds = normalize(p.beds);
      const selectedBhk = Object.keys(bhkMap).filter((bhk) =>
        selectedFilters.includes(bhk),
      );

      const getBhkNumber = (value: string) => {
        const match = value.match(/(^|\s|\+)([1-9]\d*)\s*(?:bhk)?/i);
        return match ? Number(match[2]) : null;
      };

      const propertyBhkNumber = getBhkNumber(beds);

      // Multiple BHK selections are alternatives (OR), not requirements (AND).
      if (selectedBhk.length > 0) {
        const matchesAnyBhk = selectedBhk.some((bhk) => {
          if (bhk === "4+ BHK") {
            return propertyBhkNumber !== null && propertyBhkNumber >= 5;
          }

          const expected = bhkMap[bhk];
          const expectedNumber = Number(expected[0]);

          if (bhk.includes("+ S")) {
            return (
              propertyBhkNumber === expectedNumber && /\+\s*s\b/i.test(beds)
            );
          }

          return propertyBhkNumber === expectedNumber;
        });

        if (!matchesAnyBhk) return false;
      }

      // ✅ PRICE RANGE FILTER
      const minPrice = priceRange[0] * 10000000;
      const maxPrice = priceRange[1] * 10000000;

      if (price < minPrice || price > maxPrice) {
        return false;
      }

      // ✅ Furnishing (FULL FIX)
      const furnishing = normalize(extra.furnishing);

      const selectedFurnishing = selectedFilters.filter((filter) =>
        ["Furnished", "Semi Furnished", "Unfurnished"].includes(filter),
      );

      if (selectedFurnishing.length > 0) {
        const matchesFurnishing = selectedFurnishing.some((filter) => {
          if (filter === "Semi Furnished") return furnishing.includes("semi");
          if (filter === "Unfurnished")
            return furnishing.includes("unfurnished");
          if (filter === "Furnished") {
            return (
              furnishing === "furnished" ||
              furnishing.includes("fully furnished")
            );
          }
          return false;
        });

        if (!matchesFurnishing) return false;
      }

      // ✅ Construction
      const status = normalize(extra.construction_status);

      const selectedConstruction = selectedFilters.filter((filter) =>
        ["Ready to Move", "Under Construction"].includes(filter),
      );

      if (selectedConstruction.length > 0) {
        const matchesConstruction = selectedConstruction.some((filter) => {
          if (filter === "Ready to Move") return status.includes("ready");
          if (filter === "Under Construction")
            return status.includes("construction");
          return false;
        });

        if (!matchesConstruction) return false;
      }

      // ✅ Amenities (DYNAMIC FIX)
      const amenityMap = {
        Park: ["park", "garden", "green"],
        Parking: ["parking", "car parking"],
        "Power backup": ["power", "backup"],
        "Vastu complaint": ["vastu", "complaint"],
        Gymnasium: ["gymnasium", "gym"],
        "Club House": ["club", "house"],
      };

      for (let filter in amenityMap) {
        if (selectedFilters.includes(filter)) {
          const match = amenities.some((a) =>
            amenityMap[filter].some((key) => a.includes(key)),
          );

          if (!match) return false;
        }
      }

      return true;
    });

    // ✅ SORTING
    if (sortBy === "lowToHigh") {
      filtered.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    }

    if (sortBy === "highToLow") {
      filtered.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    }

    return filtered;
  }, [
    properties,
    activeTab,
    search,
    selectedFilters,
    sortBy,
    priceRange,
    selectedLocality,
    selectedSector,
    selectedBuilder,
    selectedPlotCategory,
  ]);

  // Mark genuine list interaction. The bottom sentinel may be visible on the
  // first render when there are only a few cards, so IntersectionObserver alone
  // must never be allowed to start pagination.
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const markUserScroll = () => {
      if (container.scrollTop > 20) {
        hasUserScrolledPropertyListRef.current = true;
      }
    };

    container.addEventListener("scroll", markUserScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", markUserScroll);
    };
  }, []);

  // Keep the sentinel close enough to load the next page just before the user
  // reaches the bottom, but not so far that it starts many pages too early.
  useEffect(() => {
    const element = loadMoreRef.current;
    const scrollContainer = scrollContainerRef.current;

    if (!element || !scrollContainer || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          hasUserScrolledPropertyListRef.current &&
          !loadingMore &&
          !loadingProperties &&
          hasMore &&
          (!hasActiveCriteria || filteredProperties.length > 0)
        ) {
          fetchProperties(page + 1, false, false);
        }
      },
      {
        root: scrollContainer,
        rootMargin: "150px",
        threshold: 0,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [
    page,
    hasMore,
    loadingMore,
    loadingProperties,
    hasActiveCriteria,
    filteredProperties.length,
    fetchProperties,
  ]);

  // Filtering is intentionally local and immediate.
  // Do not automatically walk through API pages when a filter has no match.
  // The old behaviour could fire page after page while the empty-state loader
  // stayed visible, making a simple filter feel like it was loading forever.
  // ✅ Coming Soon when selected category has no listings
  const isSecondaryTab = activeTab !== "Residential";
  const isActiveTabLoaded = loadedTabDataRef.current[activeTab as ListingTab];

  const isComingSoonCategory =
    isSecondaryTab &&
    isActiveTabLoaded &&
    !categoryLoading &&
    !hasActiveCriteria &&
    filteredProperties.length === 0;

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Do not compete with the main properties request during first paint.
    // The listing is the critical request; profile data is only needed for
    // recommendation/location enrichment after the listing is visible.
    if (loadingProperties) return;

    const fetchUser = async () => {
      const mobile = localStorage.getItem("userMobile");

      if (!mobile) return;

      try {
        const res = await fetch(
          `https://api.fundsarthi.in/api/user-profile?mobile=${mobile}`,
        );

        const data = await res.json();

        if (data.status === "success") {
          setUser(data.data);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, [loadingProperties]);

  const [liveLocation, setLiveLocation] = useState("Select Location");
  const [showManualLocation, setShowManualLocation] = useState(false);

  useEffect(() => {
    const onLocationFailed = () => setShowManualLocation(true);
    window.addEventListener("locationFailed", onLocationFailed);
    return () => window.removeEventListener("locationFailed", onLocationFailed);
  }, []);

  const handleManualLocationSelect = (city: string) => {
    localStorage.setItem("userCity", city);
    localStorage.removeItem("userLocality");
    window.dispatchEvent(new Event("locationUpdated"));
    setShowManualLocation(false);
  };

  useEffect(() => {
    const updateLocation = () => {
      const currentCity = localStorage.getItem("userCity");

      const currentLocality = localStorage.getItem("userLocality");

      if (currentLocality && currentCity) {
        setLiveLocation(`${currentLocality}, ${currentCity}`);

        return;
      }

      if (currentCity) {
        setLiveLocation(currentCity);

        return;
      }

      if (user?.locality && user?.city) {
        setLiveLocation(`${user.locality}, ${user.city}`);

        return;
      }

      if (user?.city) {
        setLiveLocation(user.city);

        return;
      }

      setLiveLocation("Select Location");
    };

    // initial load
    updateLocation();

    // listen updates
    window.addEventListener("locationUpdated", updateLocation);

    return () => {
      window.removeEventListener("locationUpdated", updateLocation);
    };
  }, [user]);

  const toggleFilter = (chip: string) => {
    setSelectedFilters((prev) =>
      prev.includes(chip) ? prev.filter((f) => f !== chip) : [...prev, chip],
    );
  };

  // Recommended = price within the logged-in user's salary x multiplier,
  // computed server-side (income comes from the user's profile, multiplier
  // is configurable in the CRM admin panel).
  // NOTE: Recommended For You intentionally always stays capped at 8 with
  // no "View More" control, regardless of what happens in Budget/Luxury/Premium.
  const recommendedProperties = useMemo(() => {
    const userCity =
      localStorage.getItem("userCity")?.trim().toLowerCase() || "";

    const userLocality =
      localStorage.getItem("userLocality")?.trim().toLowerCase() || "";

    const profileCity = user?.city?.trim().toLowerCase() || "";

    const profileLocality = user?.locality?.trim().toLowerCase() || "";

    const city = userCity || profileCity;
    const locality = userLocality || profileLocality;

    // Only properties from the currently selected tab
    const source = filteredProperties;

    if (!source.length) {
      return [];
    }

    // 1. First preference: same locality
    let recommended = source.filter((property) => {
      const propertyLocality = property.locality?.trim().toLowerCase() || "";

      return locality && propertyLocality.includes(locality);
    });

    // 2. If fewer than 8, use same city
    if (recommended.length < 8 && city) {
      const cityProperties = source.filter((property) => {
        const propertyCity = property.city?.trim().toLowerCase() || "";

        const propertyLocation = property.location?.trim().toLowerCase() || "";

        return propertyCity.includes(city) || propertyLocation.includes(city);
      });

      recommended = [
        ...recommended,
        ...cityProperties.filter(
          (property) => !recommended.some((p) => p.id === property.id),
        ),
      ];
    }

    // 3. IMPORTANT:
    // Do NOT fill the remaining slots with random properties.
    // Only genuinely location-matching properties are recommended.
    // 4. IMPORTANT: always slice(0, 8) — no "View More" for this section.
    return recommended.slice(0, 8);
  }, [filteredProperties, user]);

  // Keep the full category lists available. The UI shows the first 8 cards
  // initially and reveals the complete category list when "View More" is used.
  const budgetProperties = useMemo(() => {
    return filteredProperties.filter((p) => getListingCategory(p) === "budget");
  }, [filteredProperties]);

  const luxuryProperties = useMemo(() => {
    return filteredProperties.filter((p) => getListingCategory(p) === "luxury");
  }, [filteredProperties]);

  const premiumProperties = useMemo(() => {
    return filteredProperties.filter(
      (p) => getListingCategory(p) === "premium",
    );
  }, [filteredProperties]);

  useEffect(() => {
    console.log("[PropertyListing] DATA/DERIVED STATE", {
      properties: properties.length,
      filteredProperties: filteredProperties.length,
      budget: budgetProperties.length,
      luxury: luxuryProperties.length,
      premium: premiumProperties.length,
      activeTab,
      search,
      selectedFilters,
      selectedLocality,
      selectedSector,
      selectedBuilder,
      selectedPlotCategory,
      priceRange,
      loadingProperties,
    });
  }, [
    properties.length,
    filteredProperties.length,
    budgetProperties.length,
    luxuryProperties.length,
    premiumProperties.length,
    activeTab,
    search,
    selectedFilters,
    selectedLocality,
    selectedSector,
    selectedBuilder,
    selectedPlotCategory,
    priceRange,
    loadingProperties,
  ]);

  // Hot Deals are loaded from their own category-independent endpoint.
  // This is intentionally NOT derived from the currently loaded listing set:
  // a Commercial/Plot Hot Deal must still appear when Residential is the first
  // screen and the user has not opened another tab yet.
  const [hotDeals, setHotDeals] = useState<PropertyType[]>([]);

  // Hot Deals banner carousel.
  // The carousel is UI-only; no banner position/history is persisted.
  const [hotDealIndex, setHotDealIndex] = useState(0);
  const hotDealsScrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (hotDeals.length === 0) {
      setHotDealIndex(0);
      return;
    }

    setHotDealIndex((current) => Math.min(current, hotDeals.length - 1));
  }, [hotDeals.length]);

  // Hot Deals use a REAL horizontal scroll container. Native scrolling is used
  // instead of transform-only animation so touch dragging works reliably on
  // Android WebView, Chrome, iPhone and desktop trackpads.
  useEffect(() => {
    const scroller = hotDealsScrollerRef.current;
    if (!scroller || hotDeals.length <= 1) return;

    const handleScroll = () => {
      const width = scroller.clientWidth;
      if (!width) return;

      const nextIndex = Math.round(scroller.scrollLeft / width);
      const clampedIndex = Math.max(
        0,
        Math.min(nextIndex, hotDeals.length - 1),
      );

      setHotDealIndex(clampedIndex);
    };

    scroller.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      scroller.removeEventListener("scroll", handleScroll);
    };
  }, [hotDeals.length]);
  // Hot Deals are manual-only: swipe/drag or tap a pagination dot.

  // ============================================================
  // TRENDING PROPERTIES
  // ============================================================
  // Trending is currently LIVE for Residential only.
  // It must NOT depend on the currently applied search/filter state,
  // otherwise a selected filter can accidentally hide all trending cards.
  // It also must NOT depend on Commercial / SCO / Plot tabs.
  //
  // We therefore derive Trending from the complete `properties` dataset,
  // explicitly keep residential records, then apply the CRM `is_trending`
  // flag and `trending_order`.
  // ============================================================
  const trendingProperties = useMemo(() => {
    if (activeTab !== "Residential") {
      return [];
    }

    return properties
      .filter((property) => {
        const categoryText = normalizeText(
          [
            property.category,
            property.property_type,
            property.features?.extra?.category,
            property.features?.extra?.property_type,
          ]
            .filter(Boolean)
            .join(" "),
        );

        const isPlot =
          categoryText.includes("plot") ||
          categoryText.includes("land");

        const isSCO =
          categoryText.includes("sco") ||
          categoryText.includes("shop cum office") ||
          categoryText.includes("shop-cum-office");

        const isCommercial =
          categoryText.includes("commercial") ||
          categoryText.includes("office") ||
          categoryText.includes("shop") ||
          categoryText.includes("retail") ||
          categoryText.includes("warehouse") ||
          categoryText.includes("showroom") ||
          categoryText.includes("industrial");

        // Keep the same Residential classification used by the main listing.
        // If the API does not send category/type data, treat the record as
        // Residential rather than dropping it from the default feed.
        const isResidential =
          categoryText.includes("residential") ||
          categoryText.includes("apartment") ||
          categoryText.includes("flat") ||
          categoryText.includes("villa") ||
          categoryText.includes("independent house") ||
          categoryText.includes("builder floor") ||
          categoryText.includes("studio") ||
          categoryText.includes("penthouse") ||
          categoryText.includes("house") ||
          categoryText.includes("residence") ||
          categoryText === "";

        if (!isResidential || isPlot || isSCO || isCommercial) {
          return false;
        }

        return isEnabledFlag(property.is_trending);
      })
      .sort(
        (a, b) =>
          (a.trending_order ?? Number.MAX_SAFE_INTEGER) -
            (b.trending_order ?? Number.MAX_SAFE_INTEGER) ||
          b.id - a.id,
      )
      .slice(0, 8);
  }, [properties, activeTab]);

  const [nearbyProperties, setNearbyProperties] = useState<PropertyType[]>([]);

  const filteredNearbyProperties = useMemo(() => {
    // Actual nearby properties that belong
    // to the currently selected property type
    const nearbyMatches = nearbyProperties.filter((nearby) =>
      filteredProperties.some((property) => property.id === nearby.id),
    );

    // Use actual nearby results if available
    if (nearbyMatches.length > 0) {
      return nearbyMatches.slice(0, 8);
    }

    // Fallback:
    // show properties from the selected tab
    return filteredProperties.slice(0, 8);
  }, [nearbyProperties, filteredProperties]);

  useEffect(() => {
    // Nearby is secondary. Start it only after the main listing has rendered so
    // a slow nearby endpoint cannot compete with the first-page request.
    if (loadingProperties) return;

    const fetchNearby = async () => {
      const lat = localStorage.getItem("userLatitude");
      const lng = localStorage.getItem("userLongitude");

      if (!lat || !lng) {
        return;
      }

      try {
        const res = await fetch(
          `https://api.fundsarthi.in/api/properties/nearby?lat=${lat}&lng=${lng}`,
        );

        const data = await res.json();

        setNearbyProperties(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    // Start after the main property list is visible.
    fetchNearby();

    // Try again whenever location is updated
    window.addEventListener("locationUpdated", fetchNearby);

    return () => {
      window.removeEventListener("locationUpdated", fetchNearby);
    };
  }, [loadingProperties]);

  // Scroll to one of the existing Residential listing sections.
  // The page keeps every section visible; these tabs are navigation only.
  //
  // IMPORTANT: we deliberately use getBoundingClientRect() here instead of
  // element.offsetTop. offsetTop is measured against the nearest positioned
  // ancestor (offsetParent), and since the scroll container itself has no
  // explicit "position", that ancestor can end up being something outside
  // the scrollable area (e.g. including the sticky header above it). That
  // produced a wrong/zero offset and made the tabs appear to do nothing.
  // getBoundingClientRect() gives us the actual on-screen position of both
  // the container and the target, so the delta between them is always
  // correct regardless of how the DOM is positioned.
  const scrollToListingSection = useCallback(
    (section: "budget" | "luxury" | "premium") => {
      const container = scrollContainerRef.current;
      const sectionRefs = {
        budget: budgetSectionRef.current,
        luxury: luxurySectionRef.current,
        premium: premiumSectionRef.current,
      };

      const target = sectionRefs[section];
      if (!container || !target) return;

      setActiveListingSection(section);

      // Header is sticky, so keep the selected section heading visible.
      const headerOffset = 24;

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      const targetTop = Math.max(
        0,
        container.scrollTop +
          (targetRect.top - containerRect.top) -
          headerOffset,
      );

      container.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
    },
    [],
  );

  // Keep the selected category tab in sync while the customer manually scrolls.
  useEffect(() => {
    if (activeTab !== "Residential") return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const sections = [
      { key: "budget" as const, ref: budgetSectionRef },
      { key: "luxury" as const, ref: luxurySectionRef },
      { key: "premium" as const, ref: premiumSectionRef },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const matched = sections.find(
            (section) => section.ref.current === visible[0].target,
          );
          if (matched) setActiveListingSection(matched.key);
        }
      },
      {
        root: container,
        rootMargin: "-90px 0px -55% 0px",
        threshold: 0,
      },
    );

    sections.forEach(({ ref }) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [
    activeTab,
    budgetProperties.length,
    luxuryProperties.length,
    premiumProperties.length,
  ]);

  // GUARANTEED COLD-LOAD PAINT
  // Keep the loading UI completely independent from the main listing JSX.
  // This prevents any later render-time component/section from hiding the
  // first-paint UI while the properties API is still pending.
  if (loadingProperties && properties.length === 0) {
    console.log("[PropertyListing] RENDERING COLD-LOAD SKELETON", {
      timestamp: new Date().toISOString(),
      properties: properties.length,
      loadingProperties,
    });
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99999,
          width: "100vw",
          height: "100dvh",
          overflowY: "auto",
          overflowX: "hidden",
          background: "#f7f8fa",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ padding: "32px 16px 40px" }}>
          <div
            style={{
              height: 18,
              width: 110,
              borderRadius: 8,
              background: "#e5e7eb",
              marginBottom: 10,
              animation: "fundsarthiSkeletonPulse 1.4s ease-in-out infinite",
            }}
          />
          <div
            style={{
              height: 28,
              width: 190,
              borderRadius: 8,
              background: "#dfe3e8",
              marginBottom: 22,
              animation: "fundsarthiSkeletonPulse 1.4s ease-in-out infinite",
            }}
          />

          <div
            style={{
              height: 52,
              width: "100%",
              borderRadius: 28,
              background: "#e5e7eb",
              marginBottom: 16,
              animation: "fundsarthiSkeletonPulse 1.4s ease-in-out infinite",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: 10,
              overflow: "hidden",
              marginBottom: 26,
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  flex: "0 0 105px",
                  height: 38,
                  borderRadius: 20,
                  background: "#e5e7eb",
                  animation:
                    "fundsarthiSkeletonPulse 1.4s ease-in-out infinite",
                }}
              />
            ))}
          </div>

          <div
            style={{
              height: 22,
              width: 170,
              borderRadius: 7,
              background: "#dfe3e8",
              marginBottom: 14,
              animation: "fundsarthiSkeletonPulse 1.4s ease-in-out infinite",
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  minWidth: 0,
                  overflow: "hidden",
                  borderRadius: 20,
                  background: "#fff",
                  border: "1px solid #eef0f2",
                  boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                }}
              >
                <div
                  style={{
                    height: 150,
                    background: "#dfe3e8",
                    animation:
                      "fundsarthiSkeletonPulse 1.4s ease-in-out infinite",
                  }}
                />
                <div style={{ padding: 12 }}>
                  {[
                    ["80%", 14],
                    ["60%", 10],
                    ["42%", 18],
                    ["52%", 10],
                  ].map(([width, height], index) => (
                    <div
                      key={index}
                      style={{
                        width,
                        height,
                        borderRadius: 6,
                        background: "#e5e7eb",
                        marginBottom: index === 3 ? 0 : 10,
                        animation:
                          "fundsarthiSkeletonPulse 1.4s ease-in-out infinite",
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 24,
              fontSize: 13,
              color: "#6b7280",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            Loading verified properties…
          </div>
        </div>
        <style>{`\n          @keyframes fundsarthiSkeletonPulse {\n            0%, 100% { opacity: 1; }\n            50% { opacity: .55; }\n          }\n        `}</style>
      </div>
    );
  }

  console.log("[PropertyListing] NORMAL CONTENT PAINT", {
    properties: properties.length,
    filteredProperties: filteredProperties.length,
    loadingProperties,
    activeTab,
  });

  return (
    <>
      <style>{`
        /* Cross-device responsive safeguards. The page must never become wider
           than the viewport because of a flex/grid child with intrinsic width. */
        .property-listing-page,
        .property-listing-page * {
          box-sizing: border-box;
        }

        .property-listing-page {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          overflow-x: clip;
        }

        .property-listing-page img {
          display: block;
          max-width: 100%;
        }

        /* Touch scrolling safeguards for Android/iOS. */
        .property-listing-page {
          -webkit-overflow-scrolling: touch;
          touch-action: pan-y;
          overscroll-behavior-y: contain;
        }

        .property-horizontal-scroller {
          display: flex;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-x: contain;
          touch-action: pan-x pan-y;
          scroll-snap-type: x mandatory;
          scroll-padding: 0;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
        }

        .property-horizontal-scroller::-webkit-scrollbar {
          display: none;
        }

        .property-horizontal-scroller > * {
          scroll-snap-align: start;
        }



        /* Header actions must ALWAYS stay on the same row as the location.
           On very narrow phones the location area is allowed to shrink/truncate
           instead of pushing Wishlist/Add Property onto a second row. */
        .property-header-top {
          flex-wrap: nowrap !important;
          align-items: flex-start !important;
        }

        .property-header-actions {
          flex: 0 0 auto !important;
          flex-wrap: nowrap !important;
          white-space: nowrap;
        }

        .property-header-actions button {
          flex: 0 0 auto !important;
          white-space: nowrap;
        }

        @media (max-width: 360px) {
          .property-header-top {
            gap: 6px !important;
          }

          .property-header-actions {
            gap: 4px !important;
          }

          .property-header-actions > button:last-child {
            padding-left: 9px !important;
            padding-right: 9px !important;
          }

          .property-header-actions > button:last-child span {
            font-size: 9px !important;
          }
        }

        @keyframes fundsArthiPropertyFlip {
          0% { transform: rotateY(0deg) scale(1); }
          45% { transform: rotateY(180deg) scale(0.92); }
          50% { transform: rotateY(180deg) scale(0.90); }
          55% { transform: rotateY(180deg) scale(0.92); }
          100% { transform: rotateY(360deg) scale(1); }
        }

        .fundsarthi-property-loader-stage {
          width: 96px;
          height: 96px;
          perspective: 800px;
          animation: fundsArthiPropertyLoaderFloat 2.2s ease-in-out infinite;
        }

        @keyframes fundsArthiPropertyLoaderFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.02); }
        }

        .fundsarthi-property-loader-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transform-style: preserve-3d;
          backface-visibility: visible;
          animation: fundsArthiPropertyFlip 1.4s ease-in-out infinite;
          will-change: transform;
        }
      `}</style>

      <div
        ref={scrollContainerRef}
        className="property-listing-page relative h-[100dvh] w-full max-w-full min-w-0 bg-[#f7f8fa] overflow-y-scroll overflow-x-clip overscroll-contain"
        style={{
          overflowAnchor: "none",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
      >
        {/* INSTANT FIRST-PAINT SKELETON
            This is intentionally rendered before the header and before any
            property-dependent sections. It prevents a white screen on a fresh
            install while the API/server is waking up. */}
        {loadingProperties && properties.length === 0 && (
          <div className="px-4 sm:px-5 pt-4 pb-2 bg-[#f7f8fa]">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 animate-pulse" />
                  <div className="space-y-2 min-w-0">
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-9 w-24 rounded-full bg-gray-200 animate-pulse shrink-0" />
              </div>

              <div className="h-11 w-full rounded-full bg-gray-200 animate-pulse mb-4" />

              <div className="flex gap-2 overflow-hidden mb-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-24 shrink-0 rounded-full bg-gray-200 animate-pulse"
                  />
                ))}
              </div>

              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-[20px] bg-white border border-gray-100"
                  >
                    <div className="h-[150px] bg-gray-200 animate-pulse" />
                    <div className="p-3 space-y-2.5">
                      <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-3/5 bg-gray-200 rounded animate-pulse" />
                      <div className="h-5 w-2/5 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs text-gray-500">
                  Loading properties…
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Cached content stays visible while a background refresh runs. */}
        {!loadingProperties && refreshingProperties && (
          <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
            <div className="h-0.5 w-full overflow-hidden bg-primary/10">
              <div className="h-full w-1/3 bg-primary animate-[loading_1.2s_ease-in-out_infinite]" />
            </div>
          </div>
        )}

        {/* The outer page is the ONLY scroll container.
            The full header scrolls naturally with the page, while the
            search/filter bar below it can stick to the screen top. */}
        <div className="w-full min-w-0">
          {/* Header */}
          <div className="shrink-0 px-4 sm:px-5 pt-8 sm:pt-9 pb-1 bg-white shadow-sm min-w-0 w-full max-w-full">
            {/* Brand */}

            {/* Location + Add Property */}
            <div>
              <div className="property-header-top flex items-start justify-between gap-2 sm:gap-3 mb-5 min-w-0 w-full">
                {/* Location */}
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs text-gray-400 mb-1">
                    Location
                  </p>

                  <div className="flex items-center gap-1 text-xs sm:text-sm text-[#0B1B3F] font-medium min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate min-w-0">{liveLocation}</span>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 mt-1.5 flex-wrap">
                    <button
                      onClick={() => requestLocation()}
                      className="text-primary text-[10px] sm:text-[11px] font-semibold underline underline-offset-2 whitespace-nowrap"
                    >
                      Use Current Location
                    </button>

                    <button
                      onClick={() => setShowManualLocation(true)}
                      className="text-gray-400 text-[10px] sm:text-[11px] font-medium underline underline-offset-2 whitespace-nowrap"
                    >
                      Set manually
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="property-header-actions flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Wishlist */}
                  <button
                    onClick={() => navigate("/wishlist")}
                    aria-label="Wishlist"
                    className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 rounded-full bg-white text-[#0B1B3F] border border-gray-200 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
                  >
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline text-xs font-semibold">
                      Wishlist
                    </span>
                  </button>

                  {/* Add Property */}
                  <button
                    onClick={() => navigate("/property/list-your-property")}
                    className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-full bg-primary text-white flex items-center justify-center gap-1 sm:gap-1.5 shadow-md active:scale-95 transition-all shrink-0 whitespace-nowrap"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span className="text-[10px] sm:text-xs font-semibold">
                      Add Property
                    </span>
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div className="flex gap-3 mb-5 overflow-x-auto no-scrollbar">
                {["Residential", "Commercial", "Plot"].map((item) => (
                  <button
                    key={item}
                    className={`px-5 h-10 rounded-full border text-sm whitespace-nowrap transition-all ${
                      activeTab === item
                        ? "bg-primary text-white border-primary shadow-md"
                        : "bg-white border-gray-200 text-gray-700"
                    }`}
                    onClick={() => {
                      const nextTab = item as ListingTab;

                      setActiveTab(nextTab);

                      const savedTabState = tabPageStateRef.current[nextTab];
                      setPage(savedTabState?.page || 1);
                      setHasMore(savedTabState?.hasMore ?? true);

                      // Clear filters when changing property type
                      setSelectedFilters([]);
                      setSelectedLocality("");
                      setSelectedSector("");
                      setSelectedBuilder("");
                      setSelectedPlotCategory("");

                      propertyListingStore.scrollTop = 0;
                      propertyListingStore.windowScrollTop = 0;
                      initialScrollStateRef.current = null;
                      restoringScrollRef.current = false;

                      try {
                        sessionStorage.removeItem(PROPERTY_SCROLL_STATE_KEY);
                      } catch {
                        // Ignore storage errors.
                      }

                      requestAnimationFrame(() => {
                        scrollContainerRef.current?.scrollTo({
                          top: 0,
                          behavior: "auto",
                        });
                        window.scrollTo(0, 0);
                      });

                      // The three secondary tabs are warmed in parallel at
                      // startup. If the user taps before that request finishes,
                      // fetch only this tab's first page and show a small
                      // category loader instead of the full-page skeleton.
                      if (!loadedTabDataRef.current[nextTab]) {
                        void fetchTabPage(nextTab, 1, true);
                      }
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Residential Listing Category Tabs: Luxury / Budget Friendly / Premium */}
              {activeTab === "Residential" && (
                <div className="grid grid-cols-3 gap-3 mb-1">
                  {[
                    {
                      key: "luxury" as const,
                      label: "Luxury",
                      icon: Crown,
                    },
                    {
                      key: "budget" as const,
                      label: "Budget Friendly",
                      icon: WalletCards,
                    },
                    {
                      key: "premium" as const,
                      label: "Premium",
                      icon: Gem,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeListingSection === item.key;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => scrollToListingSection(item.key)}
                        aria-label={`Scroll to ${item.label} listings`}
                        title={`Scroll to ${item.label} listings`}
                        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border py-3 px-2 transition-all active:scale-[0.98] ${
                          isActive
                            ? "bg-amber-50 border-amber-400 shadow-sm"
                            : "bg-[#eef3f5] border-transparent"
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${
                            isActive ? "text-amber-500" : "text-primary"
                          }`}
                        />
                        <span
                          className={`text-[11px] font-semibold text-center leading-tight ${
                            isActive ? "text-[#0B1B3F]" : "text-gray-700"
                          }`}
                        >
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Search + Filter Bar: scrolls normally until it reaches the top, then sticks. */}
          <div className="sticky top-0 z-[10] bg-white shadow-sm border-b border-gray-100 -mx-4 sm:-mx-5 px-4 sm:px-5 py-2">
            <div className="flex gap-2 sm:gap-3 min-w-0">
              <div className="flex-1 min-w-0 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  placeholder="Search location, property name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className=" w-full h-12 rounded-full bg-white pl-11 pr-4 text-sm outline-none shadow-sm border border-gray-100 "
                />
              </div>

              <button
                onClick={() => setIsFilterOpen(true)}
                className="w-12 h-12 shrink-0 rounded-full bg-primary flex items-center justify-center text-white shadow-lg relative"
              >
                <SlidersHorizontal className="w-5 h-5" />

                {sortBy && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {loadingProperties && (
            <div className="px-5 pt-5 pb-10 space-y-7">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-sm font-medium text-gray-500">
                  {slowLoading
                    ? "Still loading verified properties…"
                    : "Finding the best properties for you…"}
                </p>
              </div>

              {/* Recommended Skeleton */}
              <div>
                <div className="h-6 w-52 bg-gray-300 rounded animate-pulse mb-4" />

                <div className="flex gap-4 overflow-hidden">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="min-w-[220px] bg-white rounded-2xl overflow-hidden border border-gray-100"
                    >
                      <div className="h-40 bg-gray-300 animate-pulse" />

                      <div className="p-4 space-y-3">
                        <div className="h-4 w-4/5 bg-gray-300 rounded animate-pulse" />
                        <div className="h-3 w-3/5 bg-gray-300 rounded animate-pulse" />
                        <div className="h-5 w-2/5 bg-gray-300 rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-gray-300 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Skeleton */}
              <div>
                <div className="h-7 w-44 bg-gray-300 rounded animate-pulse mb-4" />

                <div className="flex gap-5 overflow-hidden">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="w-[70vw] max-w-[180px] shrink-0 bg-white rounded-[20px] overflow-hidden border border-gray-100"
                    >
                      <div className="h-[120px] bg-gray-300 animate-pulse" />

                      <div className="p-3 space-y-3">
                        <div className="h-4 w-4/5 bg-gray-300 rounded animate-pulse" />
                        <div className="h-3 w-3/5 bg-gray-300 rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-gray-300 rounded animate-pulse" />
                        <div className="h-5 w-2/5 bg-gray-300 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Listings Skeleton */}
              <div>
                <div className="h-7 w-48 bg-gray-300 rounded animate-pulse mb-4" />

                <div className="grid grid-cols-2 gap-3 sm:gap-4 min-w-0">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="bg-white rounded-[22px] overflow-hidden border border-gray-100"
                    >
                      <div className="h-[130px] bg-gray-300 animate-pulse" />

                      <div className="p-3 space-y-3">
                        <div className="h-4 w-4/5 bg-gray-300 rounded animate-pulse" />
                        <div className="h-3 w-3/5 bg-gray-300 rounded animate-pulse" />
                        <div className="h-5 w-2/5 bg-gray-300 rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-gray-300 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {propertyLoadError && properties.length === 0 && (
            <div className="px-5 pt-10 pb-20 text-center">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
                <div className="text-4xl mb-3">📡</div>
                <h2 className="text-lg font-bold text-[#0B1B3F]">
                  Properties are taking longer than usual
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Please try again. We’ll load the listings as soon as the
                  connection is ready.
                </p>
                <button
                  onClick={() => {
                    setPropertyLoadError(false);
                    fetchProperties(1, true, false, activeTab as ListingTab);
                  }}
                  className="mt-5 px-6 py-3 rounded-full bg-primary text-white text-sm font-semibold"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* HOT DEALS - MANUAL SWIPE / SCROLL ONLY */}
          {hotDeals.length > 0 && (
            <div className="px-5 pt-8">
              <div className="relative overflow-hidden rounded-[22px]">
                <div
                  ref={hotDealsScrollerRef}
                  className="property-horizontal-scroller w-full"
                  aria-label="Hot Deals — swipe horizontally to browse"
                  style={{ touchAction: "pan-x pan-y" }}
                >
                  {hotDeals.map((property) => (
                    <div
                      key={property.id}
                      className="min-w-full w-full shrink-0 snap-start cursor-pointer"
                      onClick={() => openProperty(property.id)}
                    >
                      <div className="relative h-[210px] overflow-hidden rounded-[22px] bg-[#0B1B3F] shadow-[0_8px_28px_rgba(11,27,63,0.18)]">
                        <img
                          loading="lazy"
                          src={
                            property.image ||
                            "https://via.placeholder.com/900x500"
                          }
                          alt={
                            property.features?.extra?.project_name ||
                            property.title ||
                            "Hot Deal"
                          }
                          draggable={false}
                          className="absolute inset-0 h-full w-full select-none object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />

                        <div className="absolute inset-0 flex flex-col justify-between p-5">
                          <div>
                            <span className="inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0B1B3F] shadow-sm">
                              🔥 Hot Deal
                            </span>
                          </div>

                          <div className="relative max-w-[100%] pb-8 text-white">
                            <h3 className="max-w-[82%] line-clamp-2 text-[20px] font-bold leading-tight">
                              {property.features?.extra?.project_name ||
                                property.title}
                            </h3>

                            <p className="mt-1 max-w-[82%] line-clamp-1 text-[11px] text-white/80">
                              {property.location || "Prime Location"}
                            </p>

                            {/* Price and CTA have separate positions.
                                This prevents long prices from colliding with View Deal. */}
                            <div className="mt-2 min-w-0 max-w-[55%]">
                              <p className="text-[10px] text-white/70">
                                Starting from
                              </p>

                              <p className="whitespace-nowrap text-[14px] font-extrabold leading-tight tracking-tight sm:text-[18px]">
                                ₹{property.price}
                              </p>
                            </div>

                            {/* CTA — right aligned and ABOVE the pagination dots */}
                            <span
                              className="absolute bottom-8 right-0 rounded-full bg-white px-4 py-2 text-[11px] font-bold text-[#0B1B3F] shadow-md whitespace-nowrap"
                            >
                              View Deal →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Manual pagination — no auto rotation */}
                {hotDeals.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/25 px-2 py-1 backdrop-blur-sm">
                    {hotDeals.map((property, index) => (
                      <button
                        key={property.id}
                        type="button"
                        aria-label={`Show hot deal ${index + 1}`}
                        onClick={(e) => {
                          e.stopPropagation();

                          const scroller = hotDealsScrollerRef.current;
                          if (!scroller) return;

                          scroller.scrollTo({
                            left: index * scroller.clientWidth,
                            behavior: "smooth",
                          });

                          setHotDealIndex(index);
                        }}
                        className={`h-1.5 rounded-full transition-all ${
                          index === hotDealIndex
                            ? "w-5 bg-white"
                            : "w-1.5 bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!loadingProperties && (
            <div className="px-5 pt-6">
              <div className="relative w-full overflow-hidden rounded-[20px] bg-[#0B1428] shadow-sm">
                {banners.length > 0 ? (
                  <>
                    <div className="relative aspect-[2/1] w-full overflow-hidden">
                      {banners.map((banner, index) => {
                        const isActive = index === activeBannerIndex;

                        return (
                          <button
                            key={banner.id}
                            type="button"
                            aria-label={banner.title || `Banner ${index + 1}`}
                            onClick={() => {
                              if (banner.redirect_url) {
                                window.location.href = banner.redirect_url;
                              }
                            }}
                            className={`absolute inset-0 h-full w-full p-0 text-left transition-opacity duration-500 ${
                              isActive
                                ? "z-10 opacity-100"
                                : "pointer-events-none z-0 opacity-0"
                            }`}
                          >
                            <img
                              src={banner.image_url}
                              alt={banner.title || "FundsArthi banner"}
                              loading={index === 0 ? "eager" : "lazy"}
                              decoding="async"
                              className="block h-full w-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>

                    {banners.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1.5 backdrop-blur-sm">
                        {banners.map((banner, index) => (
                          <button
                            key={banner.id}
                            type="button"
                            aria-label={`Show banner ${index + 1}`}
                            onClick={() => setActiveBannerIndex(index)}
                            className={`h-1.5 rounded-full transition-all ${
                              index === activeBannerIndex
                                ? "w-5 bg-white"
                                : "w-1.5 bg-white/60"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="aspect-[2/1] w-full">
                    <img
                      src="/laburnum-banner.png"
                      alt="Laburnum Developers — Legacy Era"
                      loading="lazy"
                      decoding="async"
                      className="block h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {!loadingProperties && (
            <>
              {/* Recommendations — always capped at 8, no View More here */}

              {isSecondaryTab && categoryLoading ? (
                <div className="px-5 pt-8">
                  <div className="rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center shadow-sm">
                    <div className="mx-auto mb-5 h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <h2 className="text-lg font-bold text-[#0B1B3F]">
                      Loading {activeTab} properties
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                      Fetching verified {activeTab.toLowerCase()} listings...
                    </p>
                  </div>
                </div>
              ) : filteredProperties.length === 0 &&
                properties.length > 0 &&
                !isComingSoonCategory ? (
                <div className="px-5 pt-10 pb-16">
                  <div className="rounded-3xl border border-gray-100 bg-white px-6 py-10 text-center shadow-sm">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-lg font-bold text-[#0B1B3F]">
                      No properties match your current filters
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-500">
                      Try clearing the filters or increasing the price range to
                      see more verified properties.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFilters([]);
                        setSortBy("");
                        setSelectedLocality("");
                        setSelectedSector("");
                        setSelectedBuilder("");
                        setSelectedPlotCategory("");
                        setPriceRange([0, 50]);
                        setSearch("");
                      }}
                      className="mt-5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              ) : isComingSoonCategory ? (
                <div className="px-5 pt-8">
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-6 py-12 text-center">
                    <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Home className="w-7 h-7 text-primary" />
                    </div>

                    <h2 className="text-xl font-bold text-[#0B1B3F]">
                      {activeTab === "Plot" && selectedPlotCategory
                        ? `${selectedPlotCategory} Plots Coming Soon`
                        : `${activeTab} Properties Coming Soon`}
                    </h2>

                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                      {activeTab === "Plot" && selectedPlotCategory
                        ? `We are adding verified ${selectedPlotCategory.toLowerCase()} plot properties soon. Please check back shortly.`
                        : `We are adding verified ${activeTab.toLowerCase()} properties soon. Please check back shortly.`}
                    </p>

                    <div className="mt-5 inline-flex px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      Coming Soon
                    </div>
                  </div>
                </div>
              ) : recommendedProperties.length > 0 ? (
                <div className="px-5 pt-5">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-[#0B1B3F]">
                      Recommended For You
                    </h2>

                    <button
                      type="button"
                      onClick={() => scrollToListingSection("luxury")}
                      className="text-primary text-sm font-semibold underline underline-offset-2 shrink-0 ml-3"
                    >
                      See All
                    </button>
                  </div>

                  {/* Fixed 2-column grid — this section is intentionally
                      always capped (see recommendedProperties) and has no
                      View More control. */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 min-w-0">
                    {recommendedProperties.slice(0, 4).map((property) => (
                      <div
                        key={property.id}
                        onClick={() => openProperty(property.id)}
                        className="min-w-0 w-full max-w-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer"
                      >
                        <div className="relative h-[130px] overflow-hidden">
                          <img
                            loading="lazy"
                            src={
                              property.image ||
                              "https://via.placeholder.com/500x300"
                            }
                            className="w-full h-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Save property"
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 flex items-center justify-center shadow-sm"
                          >
                            <Heart className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                        </div>

                        <div className="p-3">
                          <h3 className="font-semibold text-[13px] text-[#0B1B3F] line-clamp-1">
                            {property.features?.extra?.project_name ||
                              property.title}
                          </h3>

                          <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">
                            {property.location}
                          </p>

                          <div className="mt-2 whitespace-nowrap text-primary text-[14px] sm:text-[16px] font-extrabold tracking-tight">
                            ₹{property.price}*
                          </div>

                          <div className="text-[10px] text-gray-500 mt-1">
                            {property.beds ? `${property.beds} BHK • ` : ""}
                            {property.area}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Budget Friendly */}
              <div ref={budgetSectionRef} className="px-5 pt-7 scroll-mt-24">
                {/* Heading */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[24px] font-bold text-[#0B1B3F]">
                      Budget Friendly
                    </h2>

                    <p className="text-[13px] text-gray-500 mt-1">
                      Affordable luxury homes curated for you
                    </p>
                  </div>

                  {budgetProperties.length > 8 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedListingSection((current) =>
                          current === "budget" ? null : "budget",
                        )
                      }
                      className="text-sm font-semibold text-primary underline underline-offset-2 shrink-0 ml-3"
                    >
                      {expandedListingSection === "budget"
                        ? "View Less"
                        : "View More"}
                    </button>
                  )}
                </div>

                {/* First 8 cards stay compact/horizontal. View More opens the
                    complete category as a clear 2-column mobile grid so the
                    remaining properties can be browsed by normal scrolling. */}
                <div
                  className={
                    expandedListingSection === "budget"
                      ? "grid grid-cols-2 gap-3 min-w-0 pb-3"
                      : "flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 pr-5 no-scrollbar"
                  }
                >
                  {budgetProperties
                    .slice(
                      0,
                      expandedListingSection === "budget"
                        ? budgetProperties.length
                        : 8,
                    )
                    .map((property) => (
                      <div
                        key={property.id}
                        onClick={() => openProperty(property.id)}
                        className={`${
                          expandedListingSection === "budget"
                            ? "w-full min-w-0"
                            : "w-[70vw] max-w-[180px] shrink-0 snap-start"
                        } bg-white rounded-[20px] overflow-hidden border border-gray-100 shadow-sm cursor-pointer active:scale-[0.985] transition-all`}
                      >
                        {/* IMAGE */}
                        <div className="relative h-[120px] overflow-hidden">
                          <img
                            loading="lazy"
                            src={
                              property.image ||
                              "https://via.placeholder.com/500x300"
                            }
                            className="w-full h-full object-cover"
                          />

                          {/* Gradient Overlay */}
                          <div
                            className="
              absolute inset-0
              bg-gradient-to-t
              from-black/45
              via-black/5
              to-transparent
            "
                          />
                        </div>

                        {/* CONTENT */}
                        <div className="p-3">
                          {/* Project Name */}
                          <h3
                            className="
  text-[14px]
  font-semibold
  text-[#0B1B3F]
  leading-tight
  line-clamp-1
  mb-1
"
                          >
                            {property.features?.extra?.project_name ||
                              property.title}
                          </h3>

                          {/* Location */}
                          <div
                            className="
flex items-center gap-1
text-[11px]
text-gray-500
mb-2
"
                          >
                            <MapPin className="w-3 h-3 text-primary" />

                            <span className="line-clamp-1">
                              {property.location || "Sector 150, Noida"}
                            </span>
                          </div>

                          {/* Configuration */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-[10px] text-gray-400">
                              {property.beds} BHK • {property.area} sqft
                            </div>

                            <div
                              className="
    px-2 py-0.5
    rounded-full
    bg-primary/10
    text-primary
    text-[9px]
    font-medium
  "
                            >
                              Budget
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="h-px bg-gray-100 mb-2" />

                          {/* Bottom */}
                          <div className="flex items-end justify-between gap-2">
                            <div className="min-w-0">
                              <div className="whitespace-nowrap text-[14px] sm:text-[16px] font-bold text-[#0B1B3F] leading-none tracking-tight">
                                ₹ {property.price}
                              </div>

                              <div className="text-[9px] text-gray-400 mt-1">
                                onwards
                              </div>
                            </div>

                            <div className="px-3 py-1.5 rounded-xl bg-primary text-white text-[10px] font-medium">
                              View
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {budgetProperties.length === 0 && (
                  <div className="py-8 text-center text-sm text-gray-400">
                    No Budget Friendly properties available right now.
                  </div>
                )}
              </div>

              <div ref={premiumSectionRef} className="px-5 pt-8 scroll-mt-24">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Premium Listings</h2>

                  {premiumProperties.length > 8 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedListingSection((current) =>
                          current === "premium" ? null : "premium",
                        )
                      }
                      className="text-sm font-semibold text-primary underline underline-offset-2 shrink-0 ml-3"
                    >
                      {expandedListingSection === "premium"
                        ? "View Less"
                        : "View More"}
                    </button>
                  )}
                </div>

                <div
                  className={
                    expandedListingSection === "premium"
                      ? "grid grid-cols-2 gap-3 min-w-0 mt-4"
                      : "flex gap-4 overflow-x-auto mt-4"
                  }
                >
                  {premiumProperties
                    .slice(
                      0,
                      expandedListingSection === "premium"
                        ? premiumProperties.length
                        : 8,
                    )
                    .map((property) => (
                      <div
                        key={property.id}
                        onClick={() => openProperty(property.id)}
                        className={`${
                          expandedListingSection === "premium"
                            ? "w-full min-w-0"
                            : "w-[78vw] max-w-[220px] shrink-0"
                        } bg-white rounded-2xl shadow border cursor-pointer`}
                      >
                        <img
                          loading="lazy"
                          src={property.image}
                          className="h-40 w-full object-cover rounded-t-2xl"
                        />

                        <div className="p-4">
                          <h3 className="font-semibold line-clamp-1">
                            {property.features?.extra?.project_name ||
                              property.title}
                          </h3>

                          <p className="text-xs text-gray-500 mt-1">
                            {property.location}
                          </p>

                          <div className="mt-3 whitespace-nowrap text-primary text-[14px] sm:text-[16px] font-bold tracking-tight">
                            ₹{property.price}
                          </div>

                          <div className="text-xs mt-2">
                            {property.beds} BHK • {property.area}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {premiumProperties.length === 0 && (
                  <div className="py-8 text-center text-sm text-gray-400">
                    No Premium properties available right now.
                  </div>
                )}
              </div>

              <div ref={luxurySectionRef} className="px-5 pt-8 scroll-mt-24">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Luxury Listings</h2>

                  {luxuryProperties.length > 8 && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedListingSection((current) =>
                          current === "luxury" ? null : "luxury",
                        )
                      }
                      className="text-sm font-semibold text-primary underline underline-offset-2 shrink-0 ml-3"
                    >
                      {expandedListingSection === "luxury"
                        ? "View Less"
                        : "View More"}
                    </button>
                  )}
                </div>

                <div
                  className={
                    expandedListingSection === "luxury"
                      ? "grid grid-cols-2 gap-3 min-w-0 mt-4"
                      : "flex gap-4 overflow-x-auto mt-4"
                  }
                >
                  {luxuryProperties
                    .slice(
                      0,
                      expandedListingSection === "luxury"
                        ? luxuryProperties.length
                        : 8,
                    )
                    .map((property) => (
                      <div
                        key={property.id}
                        onClick={() => openProperty(property.id)}
                        className={`${
                          expandedListingSection === "luxury"
                            ? "w-full min-w-0"
                            : "w-[78vw] max-w-[220px] shrink-0"
                        } bg-white rounded-2xl shadow border cursor-pointer`}
                      >
                        <img
                          loading="lazy"
                          src={property.image}
                          className="h-40 w-full object-cover rounded-t-2xl"
                        />

                        <div className="p-4">
                          <h3 className="font-semibold line-clamp-1">
                            {property.features?.extra?.project_name ||
                              property.title}
                          </h3>

                          <p className="text-xs text-gray-500 mt-1">
                            {property.location}
                          </p>

                          <div className="mt-3 whitespace-nowrap text-primary text-[14px] sm:text-[16px] font-bold tracking-tight">
                            ₹{property.price}
                          </div>

                          <div className="text-xs mt-2">
                            {property.beds} BHK • {property.area}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {luxuryProperties.length === 0 && (
                  <div className="py-8 text-center text-sm text-gray-400">
                    No Luxury properties available right now.
                  </div>
                )}
              </div>

              {/* TRENDING */}
              {trendingProperties.length > 0 && (
                <div className="px-5 pt-8">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-2xl font-bold text-[#0B1B3F]">
                        📈 Trending Properties
                      </h2>

                      <p className="text-[13px] text-gray-500 mt-1">
                        Properties trending right now
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 overflow-x-auto no-scrollbar">
                    {trendingProperties.map((property) => (
                      <div
                        key={property.id}
                        onClick={() => openProperty(property.id)}
                        className="w-[78vw] max-w-[220px] shrink-0 bg-white rounded-2xl shadow border cursor-pointer"
                      >
                        <div className="relative">
                          <img
                            loading="lazy"
                            src={
                              property.image ||
                              "https://via.placeholder.com/500x300"
                            }
                            className="h-40 w-full object-cover rounded-t-2xl"
                          />

                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-[#0B1B3F] text-[10px] font-semibold">
                            📈 Trending
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold line-clamp-1">
                            {property.features?.extra?.project_name ||
                              property.title}
                          </h3>

                          <p className="text-xs text-gray-500 mt-1">
                            {property.location}
                          </p>

                          <div className="mt-3 whitespace-nowrap text-primary text-[14px] sm:text-[16px] font-bold tracking-tight">
                            ₹{property.price}
                          </div>

                          <div className="text-xs mt-2">
                            {property.beds ? `${property.beds} BHK • ` : ""}
                            {property.area}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nearby */}
              {filteredNearbyProperties.length > 0 && (
                <div className="px-5 pt-7">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-[22px] font-bold text-[#0B1B3F]">
                        Nearby your location
                      </h2>

                      <p className="text-[13px] text-gray-500 mt-1">
                        Handpicked properties near you
                      </p>
                    </div>
                  </div>

                  {/* Nearby Property Grid */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 min-w-0">
                    {filteredNearbyProperties.map((property) => (
                      <div
                        key={property.id}
                        onClick={() => openProperty(property.id)}
                        className="min-w-0 w-full max-w-full overflow-hidden rounded-[20px] border border-gray-100 bg-white shadow-[0_4px_16px_rgba(11,27,63,0.07)] active:scale-[0.98] transition-transform cursor-pointer"
                      >
                        {/* IMAGE */}
                        <div className="relative h-[118px] overflow-hidden">
                          <img
                            loading="lazy"
                            src={
                              property.image ||
                              "https://via.placeholder.com/500x300"
                            }
                            className="w-full h-full object-cover"
                            alt={
                              property.features?.extra?.project_name ||
                              property.title ||
                              "Property"
                            }
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

                          {/* LOCATION */}
                          <div className="absolute bottom-2 left-2 right-2">
                            <span className="block truncate text-[10px] font-medium text-white">
                              {property.location || "Gurgaon"}
                            </span>
                          </div>
                        </div>

                        {/* CONTENT */}
                        <div className="p-3">
                          <h3 className="truncate text-[13px] font-bold leading-tight text-[#0B1B3F]">
                            {property.features?.extra?.project_name ||
                              property.title}
                          </h3>

                          <p className="mt-1 truncate text-[10px] text-gray-500">
                            Premium Apartments
                          </p>

                          <div className="mt-2.5 border-t border-gray-100 pt-2.5">
                            {/* PRICE — kept separate from CTA so it can never overlap */}
                            <div className="min-w-0">
                              <span className="block text-[9px] font-medium text-gray-400">
                                Starting from
                              </span>

                              <span className="block whitespace-nowrap text-[12px] font-extrabold leading-tight tracking-tight text-[#0B1B3F]">
                                ₹ {property.price}
                              </span>
                            </div>

                            {/* CTA — full width gives the price its own space */}
                            <div className="mt-2 flex h-8 w-full items-center justify-center rounded-[10px] bg-primary/10 text-[10px] font-bold text-primary">
                              View Property
                              <span className="ml-1">→</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ALL LISTINGS */}
              {filteredProperties.length > 0 ? (
                <div className="px-5 pt-8">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-[22px] font-bold text-[#0B1B3F]">
                        All {activeTab} Listings
                      </h2>
                      <p className="text-[13px] text-gray-500 mt-1">
                        {filteredProperties.length} properties available
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 min-w-0">
                    {filteredProperties.map((property) => (
                      <div
                        key={property.id}
                        onClick={() => openProperty(property.id)}
                        className="min-w-0 w-full max-w-full bg-white rounded-[22px] overflow-hidden border border-gray-100 shadow-sm cursor-pointer"
                      >
                        <div className="relative h-[130px] overflow-hidden">
                          <img
                            loading="lazy"
                            src={
                              property.image ||
                              "https://via.placeholder.com/500x300"
                            }
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="p-3">
                          <h3 className="text-[14px] font-bold text-[#0B1B3F] line-clamp-1 mb-1">
                            {property.features?.extra?.project_name ||
                              property.title}
                          </h3>

                          <p className="text-[11px] text-gray-500 line-clamp-1 mb-2">
                            {property.location}
                          </p>

                          <div className="whitespace-nowrap text-[14px] sm:text-[16px] font-bold text-[#0B1B3F] tracking-tight">
                            ₹ {property.price}
                          </div>

                          <div className="text-[10px] text-gray-400 mt-1">
                            {property.beds ? `${property.beds} BHK • ` : ""}
                            {property.area}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !isComingSoonCategory ? (
                <div className="px-5 pt-10 pb-16">
                  <div className="rounded-3xl bg-white border border-gray-100 shadow-sm px-6 py-12 text-center">
                    {hasActiveCriteria ? (
                      <>
                        <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <SlidersHorizontal className="w-7 h-7 text-primary" />
                        </div>

                        <h2 className="text-lg font-bold text-[#0B1B3F]">
                          No matching properties
                        </h2>

                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                          No currently loaded properties match your selected
                          filters. Try changing a filter or search more
                          listings.
                        </p>

                        {hasMore && (
                          <button
                            type="button"
                            disabled={loadingMore}
                            onClick={() =>
                              fetchProperties(page + 1, false, false)
                            }
                            className="mt-5 h-11 px-5 rounded-full bg-primary text-white text-sm font-semibold disabled:opacity-50"
                          >
                            {loadingMore
                              ? "Loading..."
                              : "Search More Properties"}
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Home className="w-7 h-7 text-primary" />
                        </div>

                        <h2 className="text-lg font-bold text-[#0B1B3F]">
                          No properties available
                        </h2>

                        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                          There are no verified properties available right now.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ) : null}
            </>
          )}
          {/* LOAD MORE SENTINEL */}
          <div
            ref={loadMoreRef}
            className="h-20 flex items-center justify-center"
          >
            {loadingMore && (
              <p className="text-sm text-gray-500">
                Loading more properties...
              </p>
            )}

            {!hasMore && properties.length > 0 && (
              <p className="text-xs text-gray-400">All properties loaded</p>
            )}
          </div>
        </div>

        {/* Bottom/Profile Navigation */}
        <div className="pt-3 pb-[env(safe-area-inset-bottom)] bg-background">
          <BottomNav />
        </div>

        {/* FILTER DRAWER */}
        <div
          className={`fixed inset-0 z-50 flex transition-all duration-300 ${
            isFilterOpen
              ? "bg-black/40 opacity-100"
              : "bg-black/0 opacity-0 pointer-events-none"
          }`}
        >
          {/* Outside Click */}
          <div className="flex-1" onClick={closeFilterDrawer} />

          {/* Drawer */}
          <div
            className={`w-[85vw] max-w-[380px] bg-white h-full min-w-0 flex flex-col transition-all duration-300 ${
              isFilterOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>

              <button
                onClick={closeFilterDrawer}
                className="text-xl text-gray-400"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Price Range */}
              <div className="mb-7">
                <p className="text-[18px] font-semibold text-gray-900 mb-5">
                  Filter By Price
                </p>

                {/* Current Range */}
                <p className="text-gray-500 text-sm mb-5">
                  Current Range:
                  <span className="font-semibold text-gray-800">
                    {" "}
                    ₹{priceRange[0]} Cr - ₹{priceRange[1]} Cr
                  </span>
                </p>

                <div className="relative">
                  {/* Slider */}
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                    className="w-full h-2 rounded-full border border-gray-300 bg-gray-300 accent-primary cursor-pointer"
                  />

                  {/* Numbers */}
                </div>
              </div>

              {/* Plot Category Filter - ONLY FOR PLOTS */}
              {activeTab === "Plot" && (
                <div className="mb-7">
                  <p className="text-[18px] font-semibold text-gray-900 mb-4">
                    Plot Type
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {["Residential", "Commercial", "SCO"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setSelectedPlotCategory((prev) =>
                            prev === type ? "" : type,
                          )
                        }
                        className={`px-4 py-2 rounded-full border text-sm transition-all ${
                          selectedPlotCategory === type
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white border-gray-200 text-gray-700"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* City */}
              <div className="mb-6">
                <p className="mb-2 font-medium">City</p>

                {/* City Search / Autocomplete */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="Search city..."
                    autoComplete="off"
                    className="w-full h-11 rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                {/* Autocomplete Suggestions */}
                {citySearch.trim() && (
                  <div className="mb-3 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                    {filteredCitySuggestions.length > 0 ? (
                      filteredCitySuggestions.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            toggleFilter(city);
                            setSelectedLocality("");
                            setSelectedSector("");
                            setCitySearch("");
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left text-sm hover:bg-gray-50 active:bg-gray-100 border-b last:border-b-0 border-gray-100"
                        >
                          <MapPin className="w-4 h-4 text-primary shrink-0" />
                          <span>{city}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-sm text-gray-500 text-center">
                        No cities found
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Cities */}
                {selectedFilters.some((filter) =>
                  cities.some(
                    (city) => city.toLowerCase() === filter.toLowerCase(),
                  ),
                ) && (
                  <div className="flex flex-wrap gap-2">
                    {selectedFilters
                      .filter((filter) =>
                        cities.some(
                          (city) => city.toLowerCase() === filter.toLowerCase(),
                        ),
                      )
                      .map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            toggleFilter(city);
                            setSelectedLocality("");
                            setSelectedSector("");
                          }}
                          className="px-4 py-2 rounded-full border bg-primary text-white border-primary text-sm"
                        >
                          {city} ×
                        </button>
                      ))}
                  </div>
                )}

                {!citySearch.trim() &&
                  !selectedFilters.some((filter) =>
                    cities.some(
                      (city) => city.toLowerCase() === filter.toLowerCase(),
                    ),
                  ) && (
                    <p className="text-xs text-gray-400">
                      Search and select a city
                    </p>
                  )}
              </div>

              {/* Locality */}
              <div className="mb-5">
                <label className="block mb-2 font-medium">Locality</label>

                <select
                  value={selectedLocality}
                  onChange={(e) => {
                    setSelectedLocality(e.target.value);
                    setSelectedSector("");
                  }}
                  className="w-full h-11 rounded-lg border border-gray-300 px-3 bg-white text-sm"
                >
                  <option value="">All Localities</option>

                  {localities.sort().map((locality) => (
                    <option key={locality} value={locality}>
                      {locality}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sector */}
              <div className="mb-5">
                <label className="block mb-2 font-medium">Sector</label>

                <select
                  value={selectedSector}
                  onChange={(e) => {
                    setSelectedSector(e.target.value);
                  }}
                  className="w-full h-11 rounded-lg border border-gray-300 px-3 bg-white text-sm"
                >
                  <option value="">All Sectors</option>

                  {sectors.sort().map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </div>

              {/* BHK - Residential only */}
              {activeTab === "Residential" && (
                <div className="mb-7">
                  <p className="font-semibold mb-3">BHK Type</p>

                  <div className="flex flex-wrap gap-2">
                    {[
                      "1 BHK",
                      "2 BHK",
                      "3 BHK",
                      "4 BHK",
                      "4+ BHK",
                      "2 BHK + S",
                      "3 BHK + S",
                      "4 BHK + S",
                      "5 BHK + S",
                    ].map((chip) => (
                      <button
                        key={chip}
                        onClick={() => toggleFilter(chip)}
                        className={`
                    px-4
                    h-10
                    rounded-2xl
                    border
                    text-sm
                    ${
                      selectedFilters.includes(chip)
                        ? "bg-primary text-white border-primary"
                        : "border-gray-200 bg-white"
                    }
                  `}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Furnishing - not applicable to Plot */}
              {activeTab !== "Plot" && (
                <div className="mb-6">
                  <p className="text-[16px] font-semibold text-gray-900 mb-3">
                    Furnishing
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {["Furnished", "Semi Furnished", "Unfurnished"].map((f) => (
                      <button
                        key={f}
                        onClick={() => toggleFilter(f)}
                        className={`
          px-4
          py-2
          rounded-2xl
          border
          text-sm
          transition-all
          duration-200
          ${
            selectedFilters.includes(f)
              ? "bg-primary text-white border-primary shadow-sm"
              : "bg-white border-gray-200 text-gray-700"
          }
        `}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Construction - Residential only */}
              {activeTab === "Residential" && (
                <div className="mb-6">
                  <p className="text-[16px] font-semibold text-gray-900 mb-3">
                    Construction Status
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {["Ready to Move", "Under Construction"].map((s) => (
                      <button
                        key={s}
                        onClick={() => toggleFilter(s)}
                        className={`
          px-4
          py-2
          rounded-2xl
          border
          text-sm
          transition-all
          duration-200
          ${
            selectedFilters.includes(s)
              ? "bg-primary text-white border-primary shadow-sm"
              : "bg-white border-gray-200 text-gray-700"
          }
        `}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities - Residential only */}
              {activeTab === "Residential" && (
                <div className="mb-6">
                  <p className="text-[16px] font-semibold text-gray-900 mb-3">
                    Amenities
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {[
                      "Park",
                      "Power backup",
                      "Vastu complaint",
                      "Gymnasium",
                      "Club House",
                    ].map((a) => (
                      <button
                        key={a}
                        onClick={() => toggleFilter(a)}
                        className={`
          px-4
          py-2
          rounded-2xl
          border
          text-sm
          transition-all
          duration-200
          ${
            selectedFilters.includes(a)
              ? "bg-primary text-white border-primary shadow-sm"
              : "bg-white border-gray-200 text-gray-700"
          }
        `}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setSelectedFilters([]);
                  setSortBy("");
                  setSelectedLocality("");
                  setSelectedSector("");
                }}
                className="
              flex-1
              h-12
              rounded-2xl
              border
              border-gray-200
              font-medium
            "
              >
                Clear
              </button>

              <button
                onClick={closeFilterDrawer}
                className="
              flex-1
              h-12
              rounded-2xl
              bg-primary
              text-white
              font-medium
            "
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {showManualLocation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-5 sm:p-6 w-[calc(100%-2rem)] max-w-md min-w-0">
              <h3 className="mb-4 font-medium">Select Your City</h3>
              <div className="grid grid-cols-2 gap-2">
                {NCR_CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleManualLocationSelect(city)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm hover:border-primary hover:text-primary"
                  >
                    {city}
                  </button>
                ))}
              </div>
              <button
                className="w-full mt-4 h-11 rounded-xl border border-gray-200"
                onClick={() => setShowManualLocation(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

type PropertyListingErrorBoundaryProps = {
  children: ReactNode;
};

type PropertyListingErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

class PropertyListingErrorBoundary extends Component<
  PropertyListingErrorBoundaryProps,
  PropertyListingErrorBoundaryState
> {
  state: PropertyListingErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(
    error: unknown,
  ): PropertyListingErrorBoundaryState {
    const message = error instanceof Error ? error.message : String(error);

    console.error("[PropertyListing] ERROR BOUNDARY CAUGHT:", error);

    return {
      hasError: true,
      message,
    };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("[PropertyListing] componentDidCatch:", error, info);
  }

  handleRetry = () => {
    console.log("[PropertyListing] Error boundary retry clicked");
    this.setState({
      hasError: false,
      message: "",
    });
  };

  handleReload = () => {
    console.log("[PropertyListing] Full page reload clicked");
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2147483647,
            minHeight: "100dvh",
            width: "100%",
            overflow: "auto",
            background: "#ffffff",
            color: "#111827",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 24,
              background: "#ffffff",
              boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                marginBottom: 8,
              }}
            >
              Property listing couldn't load
            </div>

            <div
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "#6b7280",
                marginBottom: 16,
              }}
            >
              A runtime error happened before the listing could render. Check
              the browser console for the full error.
            </div>

            <div
              style={{
                padding: 12,
                borderRadius: 10,
                background: "#f3f4f6",
                color: "#374151",
                fontSize: 12,
                lineHeight: 1.5,
                wordBreak: "break-word",
                marginBottom: 18,
              }}
            >
              {this.state.message || "Unknown runtime error"}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={this.handleRetry}
                style={{
                  border: 0,
                  borderRadius: 10,
                  padding: "11px 16px",
                  background: "#1893c9",
                  color: "#ffffff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 10,
                  padding: "11px 16px",
                  background: "#ffffff",
                  color: "#111827",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function PropertyListing() {
  console.log("[PropertyListing] wrapper render");
  return (
    <PropertyListingErrorBoundary>
      <PropertyListingContent />
    </PropertyListingErrorBoundary>
  );
}
