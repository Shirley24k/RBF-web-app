import { Alert } from "@material-tailwind/react";
import { Sidenav } from "../../components/sidenav";

export const AdminHome = (): JSX.Element => {
  return (
    <div className="bg-white flex min-h-screen">
      {/* Sidebar */}
      <Sidenav active="home" />

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-1 px-6 py-12">
        <h1 className="font-section-title font-semibold text-black text-[48px] tracking-[-0.96px] leading-normal mb-10">
          Welcome, Admin!
        </h1>

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
      </main>
    </div>
  );
};
