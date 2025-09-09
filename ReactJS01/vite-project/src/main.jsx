import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import App from './App.jsx';
import LoginPage from './components/pages/login.jsx';
import RegisterPage from './components/pages/register.jsx';
import UserPage from './components/pages/user.jsx';
import HomePage from './components/pages/home.jsx';
import ProductsPage from './components/pages/products.jsx';
import { AuthWrapper } from './components/context/auth.context.jsx';
import './components/styles/global.css';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "user",
        element: <UserPage />,
      },
      {
        path: "products",
        element: <ProductsPage />,
      }
    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthWrapper>
      <RouterProvider router={router} />
    </AuthWrapper>
  </React.StrictMode>,
)