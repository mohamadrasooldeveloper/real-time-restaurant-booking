import React, { useEffect, useState } from "react";
import api from "@/lib/apifetch";

function Header() {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await api.get("/me/");
      setUser(res.data);
    } catch (error) {
      console.error("🔴 خطا در گرفتن اطلاعات کاربر:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <header className="text-2xl text-center font-bold">
      <nav>
        {user ? (
          <span className="text-green-600">سلام، {user.username}!</span>
        ) : (
          <span>لطفاً وارد شوید</span>
        )}
      </nav>
    </header>
  );
}

export default Header;
