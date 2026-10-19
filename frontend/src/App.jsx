import { Navigate, Route, Routes } from "react-router-dom";
import Shell from "./components/Shell.jsx";
import Book from "./pages/Book.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Verify from "./pages/Verify.jsx";
import { RequireAuth } from "./components/RequireAuth.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verify />} />
        <Route element={<RequireAuth />}>
          <Route path="/book" element={<Book />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
