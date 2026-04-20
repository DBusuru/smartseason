import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "36px 40px", maxWidth: "100%", overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}
