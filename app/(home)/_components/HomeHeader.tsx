"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMotionValue, useTransform } from "framer-motion";

import { useUserProfile } from "@/hooks/api/use-user-profile";
import { useServiceCategories } from "@/hooks/api/use-service-categories";
import { useLocation } from "@/hooks/use-location";
import { logout } from "@/lib/actions/auth";

import { AuthChoiceModal } from "./home-header/AuthChoiceModal";
import { ComplexHeader } from "./home-header/ComplexHeader";
import { LocationSelector } from "./home-header/LocationSelector";
import { MobileMenuSheet } from "./home-header/MobileMenuSheet";
import { SimpleHeader } from "./home-header/SimpleHeader";
import type { AuthIntent, AuthMode, AuthRole } from "./home-header/types";

function HomeHeaderContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSearchRoute = pathname.startsWith("/search");
  const isHome = pathname === "/";

  const {
    lat: userLat,
    long: userLong,
    loading: isLocating,
    requestLocation: requestLocationInternal,
    clearLocation: handleClearLocationHook,
    setLocationState,
  } = useLocation();

  const [selectedRadius, setSelectedRadius] = useState(50);
  const [locationLabel, setLocationLabel] = useState("Set location");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedAuthRole, setSelectedAuthRole] = useState<AuthRole | null>(
    null,
  );
  const [authIntent, setAuthIntent] = useState<AuthIntent>("sign-in");

  const [width, setWidth] = useState(0);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: user, isLoading: isUserLoading } = useUserProfile();
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useServiceCategories();

  const categories = categoriesData?.data?.data || [];

  useEffect(() => {
    if (userLat && userLong) {
      setLocationLabel("My location");
    }
  }, [userLat, userLong]);

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory("");
    }

    const q = searchParams.get("q");
    if (q) {
      setSearchQuery(q);
    } else {
      setSearchQuery("");
    }

    const latParam = searchParams.get("lat");
    const longParam = searchParams.get("long");
    const radiusParam = searchParams.get("radius");

    if (latParam && longParam) {
      setLocationState((prev) => ({
        ...prev,
        lat: parseFloat(latParam),
        long: parseFloat(longParam),
      }));
      setLocationLabel("My location");
    }

    if (radiusParam) {
      setSelectedRadius(parseInt(radiusParam, 10));
    }
  }, [searchParams, setLocationState]);

  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
  const [isScrolledSlightly, setIsScrolledSlightly] = useState(false);
  const showSimpleHeader = isHome && !isScrolledPastHero;

  useEffect(() => {
    if (!isHome) {
      setIsScrolledPastHero(true);
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const searchAnchor = document.getElementById("hero-search-anchor");

      if (searchAnchor) {
        const rect = searchAnchor.getBoundingClientRect();
        setIsScrolledPastHero(rect.top < 64);
      } else {
        const searchOutOfView = window.innerHeight * 0.4;
        setIsScrolledPastHero(scrollY > searchOutOfView);
      }

      setIsScrolledSlightly(scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const x = useMotionValue(0);
  const leftOpacity = useTransform(x, [0, -20], [0, 1]);
  const rightOpacity = useTransform(x, [-width + 20, -width], [1, 0]);

  useEffect(() => {
    if (slideContainerRef.current) {
      const scrollWidth = slideContainerRef.current.scrollWidth;
      const offsetWidth = slideContainerRef.current.offsetWidth;
      setWidth(scrollWidth - offsetWidth);
    }
  }, [categoriesData]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleGetLocation = () => {
    requestLocationInternal();
  };

  const handleClearLocation = () => {
    handleClearLocationHook();
    setLocationLabel("Set location");
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set("q", searchQuery);
    }

    if (selectedCategory) {
      params.set("category", selectedCategory);
    }

    if (userLat && userLong) {
      params.set("lat", userLat.toString());
      params.set("long", userLong.toString());
      params.set("radius", selectedRadius.toString());
      params.set("sort", "distance");
    }

    params.set("page", "1");

    router.push(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategory === categoryId) {
      params.delete("category");
      setSelectedCategory("");
    } else {
      params.set("category", categoryId);
      setSelectedCategory(categoryId);
    }
    params.set("page", "1");

    router.push(`/search?${params.toString()}`);
  };

  const isVendor = user?.role === "VENDOR";
  const dashboardLink = isVendor ? "/vendor/dashboard" : "/client/dashboard";
  const settingsLink = isVendor ? "/vendor/settings" : "/client/settings";
  const messagesLink = isVendor ? "/vendor/messages" : "/client/messages";

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
  };

  const openAuthModal = (intent: AuthIntent) => {
    setAuthIntent(intent);
    if (intent === "list-business") {
      setSelectedAuthRole("VENDOR");
    } else if (intent === "post-request") {
      setSelectedAuthRole("CLIENT");
    } else {
      setSelectedAuthRole(null);
    }
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const getAuthPath = (role: AuthRole, mode: AuthMode) => {
    if (role === "VENDOR") {
      return mode === "sign-in" ? "/vendor/auth/log-in" : "/vendor/auth/sign-up";
    }

    return mode === "sign-in" ? "/client/auth/log-in" : "/client/auth/sign-up";
  };

  const handleAuthAction = (mode: AuthMode) => {
    if (!selectedAuthRole) {
      return;
    }

    setAuthModalOpen(false);
    setMobileMenuOpen(false);
    router.push(getAuthPath(selectedAuthRole, mode));
  };

  return (
    <>
      {showSimpleHeader ? (
        <SimpleHeader
          isScrolledSlightly={isScrolledSlightly}
          isUserLoading={isUserLoading}
          user={user}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenAuthModal={openAuthModal}
        />
      ) : (
        <ComplexHeader
          isUserLoading={isUserLoading}
          user={user}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearchKeyDown={handleKeyDown}
          onSearch={handleSearch}
          userLat={userLat}
          userLong={userLong}
          locationSelector={
            <LocationSelector
              isLocating={isLocating}
              userLat={userLat}
              userLong={userLong}
              selectedRadius={selectedRadius}
              locationLabel={locationLabel}
              onGetLocation={handleGetLocation}
              onSelectRadius={setSelectedRadius}
              onClearLocation={handleClearLocation}
            />
          }
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenAuthModal={openAuthModal}
          isSearchRoute={isSearchRoute}
          isCategoriesLoading={isCategoriesLoading}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryClick={handleCategoryClick}
          slideContainerRef={slideContainerRef}
          x={x}
          width={width}
          leftOpacity={leftOpacity}
          rightOpacity={rightOpacity}
        />
      )}

      <MobileMenuSheet
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearch={handleSearch}
        locationSelector={
          <LocationSelector
            isMobile
            isLocating={isLocating}
            userLat={userLat}
            userLong={userLong}
            selectedRadius={selectedRadius}
            locationLabel={locationLabel}
            onGetLocation={handleGetLocation}
            onSelectRadius={setSelectedRadius}
            onClearLocation={handleClearLocation}
          />
        }
        userLat={userLat}
        userLong={userLong}
        selectedRadius={selectedRadius}
        user={user}
        isUserLoading={isUserLoading}
        dashboardLink={dashboardLink}
        messagesLink={messagesLink}
        settingsLink={settingsLink}
        onLogout={handleLogout}
        onOpenAuthModal={openAuthModal}
      />

      <AuthChoiceModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        selectedAuthRole={selectedAuthRole}
        intent={authIntent}
        onSelectRole={setSelectedAuthRole}
        onSignIn={() => handleAuthAction("sign-in")}
        onCreateAccount={() => handleAuthAction("sign-up")}
        onCancel={closeAuthModal}
      />
    </>
  );
}

export default function HomeHeader() {
  return (
    <Suspense
      fallback={<div className="h-20 w-full fixed top-0 bg-transparent" />}
    >
      <HomeHeaderContent />
    </Suspense>
  );
}
