import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          padding: "32px",
          minHeight: "100vh",
          background: "radial-gradient(circle at top left, #eef0fd 0%, #f6f7fb 45%, #f8f9fb 100%)",
        }}
      >
        {children}
      </div>
    </div>
  );
}