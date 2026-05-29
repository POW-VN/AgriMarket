import React, { useState, useEffect } from "react";
import { LoginFarmconnect } from "./LoginFarmconnect";
import { RegisterFarmconnect } from "./RegisterFarmconnect";
import "./style.css";

function App() {
  const [view, setView] = useState("login"); // "login", "register"

  // Kiểm tra xem có token từ Google OAuth redirect trả về hay không
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.replace("#", "?"));
      const accessToken = params.get("access_token");
      
      if (accessToken) {
        // Xóa hash trên URL để giao diện sạch sẽ
        window.history.replaceState(null, null, " ");
        alert("Đăng nhập bằng tài khoản Google thành công!");
        setView("login");
      }
    }
  }, []);

  const renderView = () => {
    switch (view) {
      case "login":
        return <LoginFarmconnect onNavigate={setView} />;
      case "register":
        return <RegisterFarmconnect onNavigate={setView} />;
      default:
        return <LoginFarmconnect onNavigate={setView} />;
    }
  };

  return <React.Fragment>{renderView()}</React.Fragment>;
}

export default App;
