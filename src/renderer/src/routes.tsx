import type {RouteObject} from "react-router-dom";
import Home from "./pages/Home/Home.tsx";
import Settings from "./pages/Settings/Settings.tsx";
import Accounts from "./pages/Accounts/Accounts.tsx";
import MainLayout from "./layouts/MainLayout.tsx";
import Login from "./pages/auth/Login/Login";
import Register from "./pages/auth/Register/Register";
import FbiSearching from "./pages/FBI/Searching/FbiSearching";
import FbiAdding from "./pages/FBI/Adding/FbiAdding";

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
        path: '/auth/login',
        element: (
            <MainLayout>
                <Login />
            </MainLayout>
        ),
    },
    {
        path: '/auth/register',
        element: (
            <MainLayout>
                <Register />
            </MainLayout>
        ),
    },
    {
        path: '/fbi/searching',
        element: (
            <MainLayout>
                <FbiSearching />
            </MainLayout>
        )
    },
    {
        path: '/fbi/adding',
        element: (
            <MainLayout>
                <FbiAdding />
            </MainLayout>
        )
    }
];