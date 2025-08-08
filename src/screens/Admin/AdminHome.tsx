import { Alert } from "@material-tailwind/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Sidenav } from "../../components/sidenav";

export const AdminHome = (): JSX.Element => {

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [applications, setApplications] = useState<any>([]);
  
  const fetchApplications = async () => {
    await axios.get(`${API_BASE_URL}/pending-applications`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }
    })
    .then((response) => {
      setApplications(response.data.data);
    })
  }

  useEffect(() => {
    fetchApplications();
  }, []);
  return (
    <div className="bg-white flex flex-row justify-center w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-64 h-full left-0 top-0">
        <Sidenav active="home" />
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <Sidenav active="home" />
      </div>

      {/* Main Content */}
      <main className="ml-40 max-md:ml-24 max-sm:ml-22 mr-10 flex flex-col flex-1">
        <div className="flex-1 p-6 max-md:p-4 max-sm:p-3 flex flex-col items-center justify-center min-h-screen">
          <div className="w-full max-w-[595px] text-center px-4 max-md:px-2">
            <h1 className="font-section-title font-semibold text-black text-5xl max-lg:text-4xl max-md:text-3xl max-sm:text-2xl tracking-[-0.96px] leading-normal mb-6 max-md:mb-4 max-sm:mb-3 text-center">
              Welcome, Admin!
            </h1>

            {applications && applications.length > 0 && (
              <Alert variant="ghost" color="red" className="max-w-xs max-md:max-w-sm max-sm:max-w-xs text-center text-sm max-md:text-xs">
                <span>You have agreement pending to review. Click </span>
                <a
                  href="/admin-funding"
                  className="underline text-red-600 hover:text-red-800"
                >
                  here
                </a>
                <span> to review.</span>
              </Alert>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
