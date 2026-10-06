"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Magnetic from "@/components/ui/Magnetic";
import { useShop } from "@/lib/store";
import { gsap } from "@/lib/gsap";
import { onSiteLoaded } from "@/lib/loaded";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const count = useShop((s) => s.cart.reduce((n, c) => n + c.qty, 0));
  const wishCount = useShop((s) => s.wishlist.length);
  const setCartOpen = useShop((s) => s.setCartOpen);
  const menuOpen = useShop((s) => s.menuOpen);
  const setMenuOpen = useShop((s) => s.setMenuOpen);
  const setSearchOpen = useShop((s) => s.setSearchOpen);
  const bar = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      setHidden(y > 300 && y > last + 2 ? true : y < last - 2 ? false : (h) => h);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // intro: nav items drop in after preloader
  useEffect(() => {
    gsap.set(bar.current!.querySelectorAll("[data-intro]"), { yPercent: -120, autoAlpha: 0 });
    return onSiteLoaded(() =>
      gsap.to(bar.current!.querySelectorAll("[data-intro]"), {
        yPercent: 0,
        autoAlpha: 1,
        duration: 1,
        stagger: 0.05,
        ease: "expo.out",
        delay: 0.35,
      }),
    );
  }, []);

  useEffect(() => setMenuOpen(false), [pathname, setMenuOpen]);

  useEffect(() => {
    const el = menu.current!;
    if (menuOpen) {
      gsap.timeline()
        .set(el, { display: "flex" })
        .fromTo(el, { clipPath: "circle(0% at 100% 0%)" }, { clipPath: "circle(150% at 100% 0%)", duration: 0.9, ease: "expo.inOut" })
        .fromTo(el.querySelectorAll("[data-m]"), { yPercent: 100 }, { yPercent: 0, duration: 0.8, stagger: 0.06, ease: "expo.out" }, "-=0.4");
    } else if (el.style.display === "flex") {
      gsap.to(el, { clipPath: "circle(0% at 100% 0%)", duration: 0.7, ease: "expo.inOut", onComplete: () => void gsap.set(el, { display: "none" }) });
    }
  }, [menuOpen]);

  const solid = scrolled || !isHome;

  // lets sticky page elements (e.g. shop filters) sit right under the header
  useEffect(() => {
    document.documentElement.style.setProperty("--header-offset", hidden && !menuOpen ? "0px" : "60px");
  }, [hidden, menuOpen]);

  return (
    <>
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-50 transition-[transform,background-color,padding,box-shadow] duration-500",
          hidden && !menuOpen ? "-translate-y-full" : "translate-y-0",
          solid ? "bg-brown-900/85 py-3 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md" : "bg-transparent py-6",
        )}
      >
        <div ref={bar} className="mx-auto flex max-w-[1440px] items-center justify-between px-5 text-cream md:px-10">
          <div data-intro>
            <Logo />
          </div>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
            {NAV.map((n) => {
              const active = n.href === "/" ? isHome : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  data-intro
                  className="group relative py-1 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-cream/90 hover:text-cream"
                >
                  <span className="relative block overflow-hidden">
                    <span className="block transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)] group-hover:-translate-y-full">{n.label}</span>
                    <span className="absolute inset-0 block translate-y-full text-gold transition-transform duration-500 ease-[cubic-bezier(.7,0,.2,1)] group-hover:translate-y-0">
                      {n.label}
                    </span>
                  </span>
                  <span
                    className={clsx(
                      "absolute -bottom-0.5 left-0 h-px w-full origin-left bg-cream transition-transform duration-500",
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 md:gap-3">
            <span data-intro>
              <Magnetic>
                <button onClick={() => setSearchOpen(true)} aria-label="Search (press /)" className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-cream/10">
                  <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </button>
              </Magnetic>
            </span>
            <span data-intro className="hidden sm:block">
              <Magnetic>
                <Link href="/about" aria-label="Account" className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-cream/10">
                  <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </Link>
              </Magnetic>
            </span>
            <span data-intro>
              <Magnetic>
                <Link href="/shop?wishlist=1" aria-label="Wishlist" className="relative grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-cream/10">
                  <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  {wishCount > 0 && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-gold" />}
                </Link>
              </Magnetic>
            </span>
            <span data-intro>
              <Magnetic>
                <button
                  id="cart-button"
                  onClick={() => setCartOpen(true)}
                  aria-label="Open cart"
                  className="relative grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-cream/10"
                >
                  <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  <span
                    className={clsx(
                      "absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-cream px-1 text-[9px] font-semibold text-brown-900 transition-transform",
                      count > 0 ? "scale-100" : "scale-75",
                    )}
                  >
                    {count > 0 ? count : ""}
                  </span>
                </button>
              </Magnetic>
            </span>
            <button
              data-intro
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="grid h-9 w-9 place-items-center lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      <div ref={menu} className="fixed inset-0 z-40 hidden flex-col justify-between bg-brown-900 px-6 pb-10 pt-28 text-cream lg:hidden">
        <nav className="flex flex-col gap-2" aria-label="Mobile">
          {NAV.map((n, i) => (
            <div key={n.href} className="overflow-hidden">
              <Link data-m href={n.href} className="flex items-baseline gap-4 font-serif text-5xl leading-tight">
                <span className="font-sans text-xs text-gold">0{i + 1}</span>
                {n.label}
              </Link>
            </div>
          ))}
        </nav>
        <div className="overflow-hidden">
          <p data-m className="eyebrow max-w-[18rem] text-[0.65rem] leading-relaxed tracking-[0.25em] text-cream/60">
            Style is a way to say who you are
          </p>
        </div>
      </div>
    </>
  );
}
