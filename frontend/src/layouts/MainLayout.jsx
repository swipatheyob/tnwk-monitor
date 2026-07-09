import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MainLayout({
  children
}) {

  return (

    <div className="app-shell">

      <Sidebar />

      <div className="app-content">

        <Navbar />

        <main className="page-content">

          {children}

        </main>

      </div>

    </div>

  );

}

export default MainLayout;
