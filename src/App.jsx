import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginLayout from "./layouts/LoginLayout";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import PrivateRoute from "./components/PrivateRoute";
// import Navbar from "./components/Navbar"; // убрать, тут не нужен

function App() {
  const role = localStorage.getItem("role");
  const accessToken = localStorage.getItem("accessToken");

  return (
    <BrowserRouter>
      {/* УБРАЛИ pt-[60px], чтобы логин не имел лишнего отступа и не ломал вёрстку */}
      <Routes>
        <Route path="/login" element={<LoginLayout />} />

        <Route element={<PrivateRoute allowedRoles={["USER"]} />}>
          <Route path="/user" element={<UserLayout />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminLayout />} />
        </Route>

        <Route
          path="/"
          element={
            accessToken
              ? role === "ADMIN"
                ? <Navigate to="/admin" replace />
                : <Navigate to="/user" replace />
              : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
