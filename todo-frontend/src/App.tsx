import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TodosPage from "./pages/TodosPage";
import "./App.css";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
  <Route path="/login" element={<LoginPage />} />

  <Route
    path="/register"
    element={<RegisterPage />}
  />

  <Route
    path="/forgot-password"
    element={<ForgotPasswordPage />}
  />

  <Route path="/todos" element={<TodosPage />} />

  <Route
    path="/"
    element={<Navigate to="/todos" replace />}
  />
</Routes>
    </BrowserRouter>
  );
}

export default App;
