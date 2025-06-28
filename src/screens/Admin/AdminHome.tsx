import { Alert } from "@material-tailwind/react";
import axios from "axios";
import { Sidenav } from "../../components/sidenav";
import { useEffect, useState } from "react";

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
    <div className="bg-white flex min-h-screen">
      {/* Sidebar */}
      <Sidenav active="home" />

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-1 px-6 py-12">
        <h1 className="font-section-title font-semibold text-black text-[48px] tracking-[-0.96px] leading-normal mb-10">
          Welcome, Admin!
        </h1>

      {applications && applications.length > 0 && (
        <Alert variant="ghost" color="red" className="max-w-xl text-center">
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
      </main>
    </div>
  );
};
