import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "var(--spacing-desktop)", maxWidth: "100%", overflow: "auto", minWidth: 0 }}>
        {children}
      </main>
      <style>{`
        @media (max-width: 767px) {
          main { padding: 16px !important; padding-top: 60px !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          main { padding: var(--spacing-tablet) !important; }
        }
      `}</style>
    </div>
  );
}
