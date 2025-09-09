// src/App.jsx

import { Outlet } from "react-router-dom";
import Header from "./components/layout/header";
import axios from "./components/util/axios.customize";
import { useContext, useEffect } from "react";
import { AuthContext } from "./components/context/auth.context";

function App() {
  const { auth, setAuth, appLoading, setAppLoading } = useContext(AuthContext);

  useEffect(() => {
    const fetchAccount = async () => {
      setAppLoading(true);
      try {
        const res = await axios.get("/user");
        if (res && res.data) {
          setAuth({
            isAuthenticated: true,
            user: {
              email: res.data.email,
              name: res.data.name,
            },
          });
        }
      } catch (error) {
        console.log("Error fetching user:", error);
        setAuth({
          isAuthenticated: false,
          user: {
            email: "",
            name: "",
          },
        });
      }
      setAppLoading(false);
    };
    fetchAccount();
  }, [setAuth, setAppLoading]);

  return (
    <div>
      {appLoading === true ? (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "18px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <div
            style={{
              border: "2px solid #f3f3f3",
              borderTop: "2px solid #3498db",
              borderRadius: "50%",
              width: "30px",
              height: "30px",
              animation: "spin 1s linear infinite",
              margin: "0 auto 10px",
            }}
          ></div>
          Loading...
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        <>
          <Header />
          <Outlet />
        </>
      )}
    </div>
  );
}

export default App;