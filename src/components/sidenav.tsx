import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  HomeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import clsx from "clsx";
import { useState } from "react";

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
  const [open, setOpen] = useState(true);
  const role = localStorage.getItem("role");

  const handleNav = (path: string) => {
    window.location.href = path;
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
        <div className="flex items-center p-4">
          <IconButton variant="text" onClick={() => setOpen(!open)}>
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
          {navItems.map(({ key, label, icon, path }) => (
            <ListItem
              key={key}
              onClick={() => handleNav(path)}
              className={clsx(
                active === key
                  ? "bg-avocado-green"
                  : "hover:bg-avocado-green",
                "transition-colors"
              )}
            >
              <ListItemPrefix>{icon}</ListItemPrefix>
              {open && (
                <Typography
                  variant="paragraph"
                  className="font-semibold text-dark-plum"
                >
                  {label}
                </Typography>
              )}
            </ListItem>
          ))}
        </List>

        <div className="mt-auto px-4 pb-4">
          <ListItem
            onClick={() => {
              localStorage.removeItem("role");
              window.location.href = "/login";
            }}
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
