import React from "react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 col-lg-3 col-xl-2 p-0">
            <div className="sticky-lg-top" style={{ top: "4.5rem" }}>
              <Sidebar />
            </div>
          </div>
          <main className="col-12 col-lg-9 col-xl-10 py-4 px-4">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
