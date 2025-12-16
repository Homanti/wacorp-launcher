import type {RouteObject} from "react-router-dom";
import Home from "./pages/Home/Home.tsx";
import Settings from "./pages/Settings/Settings.tsx";
import Login from "./pages/Login/Login.tsx";
import Register from "./pages/Register/Register.tsx";
import Accounts from "./pages/Accounts/Accounts.tsx";
import MainLayout from "./layouts/MainLayout.tsx";

export const routes: RouteObject[] = [
    {
        path: '/',
        element: (
            <MainLayout isSidebar={true}>
                <Home />
            </MainLayout>
        ),
    },
    {
        path: '/accounts',
        element: (
            <MainLayout isSidebar={true}>
                <Accounts />
            </MainLayout>
        ),
    },
    {
        path: '/settings',
        element: (
            <MainLayout isSidebar={true}>
                <Settings />
            </MainLayout>
        ),
    },
    {
        path: '/login',
        element: (
            <MainLayout>
                <Login />
            </MainLayout>
        ),
    },
    {
        path: '/register',
        element: (
            <MainLayout>
                <Register />
            </MainLayout>
        ),
    }
];