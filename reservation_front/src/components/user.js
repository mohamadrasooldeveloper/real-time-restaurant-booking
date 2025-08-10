import React, { useEffect, useState } from 'react';

function Header() {
  const [user, setUser] = useState(null);

  // تابع گرفتن توکن جدید
  const refreshAccessToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) return null;

      const res = await fetch('http://localhost:8000/api/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('access_token', data.access); // ذخیره توکن جدید
        return data.access;
      } else {
        console.log('🔴 توکن refresh منقضی شده یا نامعتبره.');
        return null;
      }
    } catch (err) {
      console.error('🔴 خطا در گرفتن access token جدید:', err);
      return null;
    }
  };

  // تابع گرفتن اطلاعات کاربر
  const fetchUser = async () => {
    try {
      let token = localStorage.getItem('access_token');
      if (!token) return;

      let res = await fetch('http://localhost:8000/api/me/', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        // تلاش برای گرفتن توکن جدید
        const newToken = await refreshAccessToken();
        if (newToken) {
          res = await fetch('http://localhost:8000/api/me/', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          });
        } else {
          setUser(null);
          return;
        }
      }

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('🔴 خطا در گرفتن اطلاعات کاربر:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <header style={{ padding: '1rem', background: '#eee' }}>
      <nav>
        {user ? (
          <span>سلام، {user.username}!</span>
        ) : (
          <span>لطفاً وارد شوید</span>
        )}
      </nav>
    </header>
  );
}

export default Header;
