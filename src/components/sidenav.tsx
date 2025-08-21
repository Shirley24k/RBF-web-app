import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  HomeIcon,
  UserCircleIcon
} from "@heroicons/react/24/solid";
import axios from "axios";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

import {
  Card,
  IconButton,
  List,
  ListItem,
  ListItemPrefix,
  Typography,
} from "@material-tailwind/react";

interface SidenavProps {
  active: "home" | "application" | "transactions" | "profile";
}

export const Sidenav = ({ active }: SidenavProps): JSX.Element => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem("sidenavOpen");
    return saved === null ? true : saved === "true";
  });
  
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const role = localStorage.getItem("role");
  const isStripeLinked = localStorage.getItem("isStripeLinked") === "true";
  const shouldRestrict = role === "startup" || role === "investor";
  const [hasApplicationNotification, setHasApplicationNotification] = useState(false);
  const [isApplicationOpen, setIsApplicationOpen] = useState(active === "application");
  const collapsedMenuRef = useRef<HTMLDivElement | null>(null);
  const [collapsedMenuPos, setCollapsedMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [showCollapsedSubmenu, setShowCollapsedSubmenu] = useState(false);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        let url = "";
        if (role === "investor") {
          url = `${API_BASE_URL}/investor/applications-await-review`;
        } else if (role === "admin") {
          url = `${API_BASE_URL}/pending-applications`;
        } else {
          setHasApplicationNotification(false);
          return;
        }
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const payload = response?.data?.data;
        let count = 0;
        if (Array.isArray(payload)) {
          count = payload.length;
        } else if (payload && typeof payload === "object" && typeof payload.count === "number") {
          count = payload.count;
        }
        setHasApplicationNotification(count > 0);
      } catch (error) {
        setHasApplicationNotification(false);
      }
    };
    fetchNotification();
  }, []);

  const handleNav = (path: string) => {
    // Close mobile menu when navigating
    setMobileMenuOpen(false);
    window.location.href = path;
  };

  const handleToggle = () => {
    setOpen((prev) => {
      localStorage.setItem("sidenavOpen", String(!prev));
      return !prev;
    });
    // Close collapsed dropdown when expanding sidebar
    setShowCollapsedSubmenu(false);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/logout`, {}, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      localStorage.clear();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleApplicationClick = (ev: any) => {
    ev.stopPropagation();
    if (open) {
      setIsApplicationOpen((prev) => !prev);
    } else {
      // Use the clicked element's position instead of ref
      const rect = ev.currentTarget.getBoundingClientRect();
      
      const isSmallMobile = window.innerWidth < 640; // sm breakpoint
      
      let left, top;
      if (isSmallMobile) {
        left = 65; 
        top = rect.top + 40; 
      } else {
        left = 80; 
        top = rect.top + 48; 
      }
      
      setCollapsedMenuPos({ top, left });
      setShowCollapsedSubmenu(true);
    }
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!showCollapsedSubmenu) return;
      const target = e.target as Node;
      if (collapsedMenuRef.current && !collapsedMenuRef.current.contains(target)) {
        setShowCollapsedSubmenu(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [showCollapsedSubmenu]);

  const getStatusFilters = (): string[] => {
    return [
      "Await Review",
      "In Progress",
      "Pending",
      "Active",
      "Completed",
      "Failed",
      "Rejected",
    ];
  };

  const buildStatusPath = (status: string): string => {
    return `/${role}-funding?status=${encodeURIComponent(status)}`;
  };

  const navItems = [
    {
      key: "home",
      label: "Home",
      icon: <HomeIcon className="h-5 w-5 max-sm:h-4 max-sm:w-4" />,
      path: `/${role}-home`,
    },
    {
      key: "application",
      label: "Application",
      icon: <ClipboardDocumentListIcon className="h-5 w-5 max-sm:h-4 max-sm:w-4" />,
      path: `/${role}-funding`,
    },
    ...(role === "investor" || role === "startup"
      ? [
          {
            key: "transactions",
            label: "Transaction History",
            icon: <CurrencyDollarIcon className="h-5 w-5 max-sm:h-4 max-sm:w-4" />,
            path: `/${role}-transaction`,
          },
        ]
      : []),
    ...(role === "investor"
      ? [
          {
            key: "profile",
            label: "Profile",
            icon: <UserCircleIcon className="h-5 w-5 max-sm:h-4 max-sm:w-4" />,
            path: "/investor-profile",
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile/Tablet Icon Sidebar */}
      <aside
        className={clsx(
          "lg:hidden fixed top-0 left-0 h-full bg-warm-off-white shadow-2xl z-50 transition-all duration-300",
          open ? "w-64" : "w-20 max-sm:w-16",
          "rounded-r-lg"
        )}
      >
        <Card className="h-full rounded-r-lg bg-warm-off-white border-0 shadow-xl">
          <div className="flex items-center justify-start px-4 h-14">
            <IconButton variant="text" onClick={handleToggle}>
              <Bars3Icon className="h-6 w-6 max-sm:h-5 max-sm:w-5 text-dark-plum" />
            </IconButton>
            {open && (
              <Typography
                variant="h4"
                className="[font-family:'Irish_Grover',Helvetica] text-3xl tracking-[0] leading-[54px] text-[#073b1d] ml-5"
              >
                <span>R</span>
                <span className="text-[#574964c7]">B</span>
                <span>F</span>
              </Typography>
            )}
          </div>

          <List>
            {navItems.map(({ key, label, icon, path }) => {
              const isRestricted = shouldRestrict && !isStripeLinked && key !== "home" && key !== "profile";
              const isApplication = key === "application";
              if (isApplication) {
                return (
                  <div key={`${key}-wrapper`}>
                    <ListItem
                      onClick={(e) => {
                        if (isRestricted) {
                          alert("Please link your Stripe account to access this feature.");
                        } else {
                          handleApplicationClick(e);
                        }
                      }}
                      className={clsx(
                        !isRestricted && active === key && open
                          ? "bg-avocado-green"
                          : open
                            ? "hover:bg-avocado-green"
                            : "",
                        !open ? "hover:bg-avocado-green w-14 max-sm:w-12 rounded-md" : "",
                        !isRestricted && active === key && !open ? "bg-avocado-green w-14 max-sm:w-12 rounded-md" : "",
                        "transition-colors",
                        "relative"
                      )}
                    >
                      <ListItemPrefix>
                        <span className="flex items-center justify-center w-8 h-8 max-sm:w-6 max-sm:h-6 relative">
                          {icon}
                          {hasApplicationNotification && (
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 border-2 border-white" />
                          )}
                        </span>
                      </ListItemPrefix>
                      {open && (
                        <Typography
                          variant="paragraph"
                          className="font-semibold text-dark-plum"
                        >
                          {label}
                          {hasApplicationNotification && (
                            <span className="inline-block align-middle ml-2 h-2 w-2 rounded-full bg-red-600" />
                          )}
                        </Typography>
                      )}
                      {open && (
                        <span className="absolute right-3">
                          {isApplicationOpen ? (
                            <ChevronDownIcon className="h-4 w-4 text-dark-plum" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4 text-dark-plum" />
                          )}
                        </span>
                      )}
                    </ListItem>
                    {open && isApplicationOpen && (
                      <List>
                        <ListItem
                          key="status-All"
                          className="pl-12 py-1 hover:bg-avocado-green/70 text-dark-plum"
                          onClick={() => handleNav(`/${role}-funding`)}
                        >
                          <Typography variant="small" className="text-dark-plum">All</Typography>
                        </ListItem>
                        {getStatusFilters().map((status) => (
                          <ListItem
                            key={`status-${status}`}
                            onClick={() => handleNav(buildStatusPath(status))}
                            className={clsx("pl-12 py-1 hover:bg-avocado-green/70", "text-dark-plum")}
                          >
                            <div className="flex items-center justify-between w-full">
                              <Typography variant="small" className="text-dark-plum">
                                {status}
                              </Typography>
                              {(role === "investor" && hasApplicationNotification && status === "Await Review") ||
                               (role === "admin" && hasApplicationNotification && status === "Pending") ? (
                                <span className="inline-block h-2 w-2 rounded-full bg-red-600" />
                              ) : null}
                            </div>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </div>
                );
              }
              return (
                <ListItem
                  key={key}
                  onClick={() => {
                    if (isRestricted) {
                      alert("Please link your Stripe account to access this feature.");
                    } else {
                      handleNav(path);
                    }
                  }}
                  className={clsx(
                    !isRestricted && active === key && open
                      ? "bg-avocado-green"
                      : open
                        ? "hover:bg-avocado-green"
                        : "",
                    !open ? "hover:bg-avocado-green w-14 max-sm:w-12 rounded-md" : "",
                    !isRestricted && active === key && !open ? "bg-avocado-green w-14 max-sm:w-12 rounded-md" : "",
                    "transition-colors",
                    "relative"
                  )}
                >
                  <ListItemPrefix>
                    <span className="flex items-center justify-center w-8 h-8 max-sm:w-6 max-sm:h-6 relative">
                      {icon}
                    </span>
                  </ListItemPrefix>
                  {open && (
                    <Typography
                      variant="paragraph"
                      className="font-semibold text-dark-plum"
                    >
                      {label}
                    </Typography>
                  )}
                </ListItem>
              );
            })}
          </List>

          <div className="mt-auto px-4 pb-4">
            <ListItem
              onClick={handleLogout}
              className="hover:bg-avocado-green/50"
            >
              <ListItemPrefix>
                <ArrowRightStartOnRectangleIcon className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
              </ListItemPrefix>
              {open && (
                <Typography
                  variant="paragraph"
                  className="font-semibold text-dark-plum"
                >
                  Sign Out
                </Typography>
              )}
            </ListItem>
          </div>
        </Card>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={clsx(
          "hidden lg:block h-screen bg-warm-off-white shadow-xl transition-all duration-300",
          open ? "w-64" : "w-20"
        )}
      >
        <Card className="h-full rounded-none bg-warm-off-white border-0 shadow-xl">
          <div className="flex items-center justify-start px-4 h-14">
            <IconButton variant="text" onClick={handleToggle}>
              <Bars3Icon className="h-6 w-6 max-sm:h-5 max-sm:w-5 text-dark-plum" />
            </IconButton>
            {open && (
              <Typography
                variant="h4"
                className="[font-family:'Irish_Grover',Helvetica] text-3xl tracking-[0] leading-[54px] text-[#073b1d] ml-5"
              >
                <span>R</span>
                <span className="text-[#574964c7]">B</span>
                <span>F</span>
              </Typography>
            )}
          </div>

          <List>
            {navItems.map(({ key, label, icon, path }) => {
              const isRestricted = shouldRestrict && !isStripeLinked && key !== "home" && key !== "profile";
              const isApplication = key === "application";
              if (isApplication) {
                return (
                  <div key={`${key}-wrapper`}>
                    <ListItem
                      onClick={(e) => {
                        if (isRestricted) {
                          alert("Please link your Stripe account to access this feature.");
                        } else {
                          handleApplicationClick(e);
                        }
                      }}
                      className={clsx(
                        !isRestricted && active === key && open
                          ? "bg-avocado-green"
                          : open
                            ? "hover:bg-avocado-green"
                            : "",
                        !open ? "hover:bg-avocado-green w-14 max-sm:w-12 rounded-md" : "",
                        !isRestricted && active === key && !open ? "bg-avocado-green w-14 max-sm:w-12 rounded-md" : "",
                        "transition-colors",
                        "relative"
                      )}
                    >
                      <ListItemPrefix>
                        <span className="flex items-center justify-center w-8 h-8 relative">
                          {icon}
                          {hasApplicationNotification && (
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 border-2 border-white" />
                          )}
                        </span>
                      </ListItemPrefix>
                      {open && (
                        <Typography
                          variant="paragraph"
                          className="font-semibold text-dark-plum"
                        >
                          {label}
                          {hasApplicationNotification && (
                            <span className="inline-block align-middle ml-2 h-2 w-2 rounded-full bg-red-600" />
                          )}
                        </Typography>
                      )}
                      {open && (
                        <span className="absolute right-3">
                          {isApplicationOpen ? (
                            <ChevronDownIcon className="h-4 w-4 text-dark-plum" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4 text-dark-plum" />
                          )}
                        </span>
                      )}
                    </ListItem>
                    {open && isApplicationOpen && (
                      <List>
                        <ListItem
                          key="status-All"
                          className="pl-12 py-1 hover:bg-avocado-green/70 text-dark-plum"
                          onClick={() => handleNav(`/${role}-funding`)}
                        >
                          <Typography variant="small" className="text-dark-plum">All</Typography>
                        </ListItem>
                        {getStatusFilters().map((status) => (
                          <ListItem
                            key={`status-${status}`}
                            onClick={() => handleNav(buildStatusPath(status))}
                            className={clsx("pl-12 py-1 hover:bg-avocado-green/70", "text-dark-plum")}
                          >
                            <Typography variant="small" className="text-dark-plum">
                              {status}
                            </Typography>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </div>
                );
              }
              return (
                <ListItem
                  key={key}
                  onClick={() => {
                    if (isRestricted) {
                      alert("Please link your Stripe account to access this feature.");
                    } else {
                      handleNav(path);
                    }
                  }}
                  className={clsx(
                    !isRestricted && active === key && open
                      ? "bg-avocado-green"
                      : open
                        ? "hover:bg-avocado-green"
                        : "",
                    !open ? "hover:bg-avocado-green w-14 max-sm:w-12 rounded-md" : "",
                    !isRestricted && active === key && !open ? "bg-avocado-green w-14 max-sm:w-12 rounded-md" : "",
                    "transition-colors",
                    "relative"
                  )}
                >
                  <ListItemPrefix>
                    <span className="flex items-center justify-center w-8 h-8 relative">
                      {icon}
                    </span>
                  </ListItemPrefix>
                  {open && (
                    <Typography
                      variant="paragraph"
                      className="font-semibold text-dark-plum"
                    >
                      {label}
                    </Typography>
                  )}
                </ListItem>
              );
            })}
          </List>

          <div className="mt-auto px-4 pb-4">
            <ListItem
              onClick={handleLogout}
              className="hover:bg-avocado-green/50"
            >
              <ListItemPrefix>
                <ArrowRightStartOnRectangleIcon className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
              </ListItemPrefix>
              {open && (
                <Typography
                  variant="paragraph"
                  className="font-semibold text-dark-plum"
                >
                  Sign Out
                </Typography>
              )}
            </ListItem>
          </div>
        </Card>
      </aside>
      {/* Floating submenu when sidebar is collapsed */}
      {!open && showCollapsedSubmenu && (
        <div
          ref={collapsedMenuRef}
          className="fixed z-[60] bg-white shadow-2xl border border-gray-200 rounded-lg py-2"
          style={{ top: collapsedMenuPos?.top ?? 48, left: collapsedMenuPos?.left ?? 80 }}
        >
          <div className="px-4 py-2 text-xs font-semibold text-gray-500">Applications</div>
          <List className="min-w-[200px]">
            <ListItem className="py-1 px-4 hover:bg-avocado-green/70" onClick={() => handleNav(`/${role}-funding`)}>
              <Typography variant="small" className="text-dark-plum">All</Typography>
            </ListItem>
            {getStatusFilters().map((status) => (
              <ListItem key={`collapsed-${status}`} className="py-1 px-4 hover:bg-avocado-green/70" onClick={() => handleNav(buildStatusPath(status))}>
                <div className="flex items-center justify-between w-full">
                  <Typography variant="small" className="text-dark-plum">{status}</Typography>
                  {(role === "investor" && hasApplicationNotification && status === "Await Review") ||
                   (role === "admin" && hasApplicationNotification && status === "Pending") ? (
                    <span className="inline-block h-2 w-2 rounded-full bg-red-600" />
                  ) : null}
                </div>
              </ListItem>
            ))}
          </List>
        </div>
      )}
    </>
  );
};
