import type {RouteObject} from "react-router-dom";
import Home from "./pages/Home/Home.tsx";
import Settings from "./pages/Settings/Settings.tsx";
import Accounts from "./pages/Accounts/Accounts.tsx";
import MainLayout from "./layouts/MainLayout.tsx";
import FbiSearching from "./pages/FBI/Searching/FbiSearching";
import FbiAdding from "./pages/FBI/Adding/FbiAdding";
import Fbi from "./pages/FBI/Fbi";
import Auth from "./pages/Auth/Auth";
import DiscordLink from "./pages/DiscordLink/DiscordLink";

export const publicRoutes: RouteObject[] = [
    { path: '/auth', element: <Auth /> },
    { path: '/auth/link-discord', element: <DiscordLink /> },
];

export const protectedRoutes: RouteObject[] = [
    { path: '/', element: <Home /> },
    { path: '/accounts', element: <Accounts /> },
    { path: '/settings', element: <Settings /> },
    { path: '/fbi', element: <Fbi /> },
    { path: '/fbi/searching', element: <FbiSearching /> },
    { path: '/fbi/adding', element: <FbiAdding /> },
];

export const routes: RouteObject[] = [
    ...publicRoutes.map(route => ({
        path: route.path,
        element: (
            <MainLayout isSidebar={false}>
                {route.element}
            </MainLayout>
        )
    })),

    ...protectedRoutes.map(route => ({
        path: route.path,
        element: (
            <MainLayout>
                {route.element}
            </MainLayout>
        )
    }))
];