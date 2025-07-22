import {
    ArrowRightStartOnRectangleIcon,
    Bars3Icon,
    ClipboardDocumentListIcon,
    CurrencyDollarIcon,
    HomeIcon,
    UserCircleIcon,
} from "@heroicons/react/24/solid";
import axios from "axios";
import clsx from "clsx";
import { useEffect, useState } from "react";

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
  const role = localStorage.getItem("role");
  const isStripeLinked = localStorage.getItem("isStripeLinked") === "true";
  const shouldRestrict = role === "startup" || role === "investor";
  const [hasApplicationNotification, setHasApplicationNotification] = useState(false);

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
        console.log(response.data); 
        // Assume response.data.count or response.data.length > 0 means notification
        if ((Array.isArray(response.data.data) && response.data.data.length > 0) || response.data.data.count > 0) {
          setHasApplicationNotification(true);
        } else {
          setHasApplicationNotification(false);
        }
      } catch (error) {
        setHasApplicationNotification(false);
      }
    };
    fetchNotification();
  }, []);

  const handleNav = (path: string) => {
    window.location.href = path;
  };

  const handleToggle = () => {
    setOpen((prev) => {
      localStorage.setItem("sidenavOpen", String(!prev));
      return !prev;
    });
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

  const navItems = [
    {
      key: "home",
      label: "Home",
      icon: <HomeIcon className="h-5 w-5" />,
      path: `/${role}-home`,
    },
    {
      key: "application",
      label: "Application",
      icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
      path: `/${role}-funding`,
    },
    ...(role === "investor" || role === "startup"
      ? [
          {
            key: "transactions",
            label: "Transaction History",
            icon: <CurrencyDollarIcon className="h-5 w-5" />,
            path: `/${role}-transaction`,
          },
        ]
      : []),
    ...(role === "investor"
      ? [
          {
            key: "profile",
            label: "Profile",
            icon: <UserCircleIcon className="h-5 w-5" />,
            path: "/investor-profile",
          },
        ]
      : []),
  ];

  return (
    <aside
      className={clsx(
        "h-screen bg-warm-off-white shadow-md transition-all duration-300",
        open ? "w-64" : "w-20"
      )}
    >
      <Card className="h-full rounded-none bg-warm-off-white border-0">
        <div className="flex items-center justify-start px-4 h-14">
          <IconButton variant="text" onClick={handleToggle}>
            <Bars3Icon className="h-6 w-6 text-dark-plum" />
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
                  !open ? "hover:bg-avocado-green w-14 rounded-md" : "",
                  !isRestricted && active === key && !open ? "bg-avocado-green w-14 rounded-md" : "",
                  "transition-colors",
                  "relative"
                )}
              >
                <ListItemPrefix>
                  <span className="flex items-center justify-center w-8 h-8 relative">
                    {icon}
                    {key === "application" && hasApplicationNotification && (
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
                    {key === "application" && hasApplicationNotification && (
                      <span className="inline-block align-middle ml-2 h-2 w-2 rounded-full bg-red-600" />
                    )}
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
              <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
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
  );
};
