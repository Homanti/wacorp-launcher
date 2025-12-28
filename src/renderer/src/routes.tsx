import type {RouteObject} from "react-router-dom";
import Home from "./pages/Home/Home.tsx";
import Settings from "./pages/Settings/Settings.tsx";
import Accounts from "./pages/Accounts/Accounts.tsx";
import MainLayout from "./layouts/MainLayout.tsx";
import Fbi from "./pages/Fbi/Fbi";
import Auth from "./pages/Auth/Auth";
import DiscordLink from "./pages/DiscordLink/DiscordLink";
import Citizens from "./pages/Fbi/Citizens/Citizens";
import Cars from "./pages/Fbi/Cars/Cars";
import Property from "./pages/Fbi/Property/Property";
import CitizensAdd from "./pages/Fbi/Citizens/Add/CitizensAdd";

export const publicRoutes: RouteObject[] = [
    { path: '/auth', element: <Auth /> },
    { path: '/auth/link-discord', element: <DiscordLink /> },
];

export const protectedRoutes: RouteObject[] = [
    { path: '/', element: <Home /> },
    { path: '/accounts', element: <Accounts /> },
    { path: '/settings', element: <Settings /> },

    { path: '/fbi', element: <Fbi /> },

    { path: '/fbi/citizens', element: <Citizens /> },
    { path: '/fbi/citizens/add', element: <CitizensAdd /> },
    { path: '/fbi/citizens/find', element: <Citizens /> },

    { path: '/fbi/cars', element: <Cars /> },
    { path: '/fbi/property', element: <Property /> },
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