import React, { useState } from "react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const sidebarWidth = isMinimized ? "70px" : "260px";

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <div style={{ position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 1000 }}>
        <Sidebar isMinimized={isMinimized} setIsMinimized={setIsMinimized} />
      </div>
      <div style={{ flex: 1, marginLeft: sidebarWidth, transition: "margin-left 0.3s ease" }} className="bg-light">
        <Navbar />
        <div className="container-fluid">
          <main className="py-4 px-4">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
