import { QueryClient, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
  } from "react-router";
import type { LoaderFunction, ActionFunction } from "react-router";
import { paths } from "../config/paths";
import { ProtectedRoute } from "@/lib/authorization";
import AppLayout from "@/components/layouts/AppLayout";

interface RouteModule {
  clientLoader?: (queryClient: QueryClient) => LoaderFunction;
  clientAction?: (queryClient: QueryClient) => ActionFunction;
  default: React.ComponentType;
  [key: string]: unknown;
};

const convert = (queryClient: QueryClient) => (m: RouteModule) => {
    const { clientLoader, clientAction, default: Component, ...rest } = m;
  return {
    ...rest,
    loader: clientLoader?.(queryClient),
    action: clientAction?.(queryClient),
    Component,
  };
};

export const createAppRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
        // Public routes
        {
            path: paths.auth.login.path,
            lazy: () => import("./routes/auth/login").then(convert(queryClient)),
        },
        {
            path: paths.auth.magicLink.path,
            lazy: () => import("./routes/auth/magic-link").then(convert(queryClient)),
        },
        // Admin routes
        {
            path: paths.app.root.path,
            element: <ProtectedRoute allowedRoles={['admin']}><AppLayout /></ProtectedRoute>,
            children: [
              {
                index: true,
                element: <Navigate to={paths.app.dashboard.getHref()} replace />
              },
              {
                path: paths.app.dashboard.path,  
                lazy: () => import("./routes/app/candidates").then(convert(queryClient))
              },
              {
                path: paths.app.newCandidate.path,
                lazy: () => import("./routes/app/new-candidate").then(convert(queryClient))
              },
              {
                path: paths.app.updateCandidate.path,
                lazy: () => import("./routes/app/candidate").then(convert(queryClient))
              },
              {
                path: paths.app.campaigns.path,
                lazy: () => import("./routes/app/campaigns").then(convert(queryClient))
              },
              {
                path: paths.app.campaign.path,
                lazy: () => import("./routes/app/campaign").then(convert(queryClient))
              },
            ]
        },
        // Candidate routes
        {
            path: "/candidate",
            element: <ProtectedRoute allowedRoles={['candidate']}><AppLayout /></ProtectedRoute>,
            children: [
              {
                path: paths.app.candidateSelection.path,
                lazy: () => import("./routes/app/company-selection").then(convert(queryClient))
              },
              {
                path: paths.app.thankYou.path,
                lazy: () => import("./routes/app/thank-you").then(convert(queryClient))
              },
            ]
        },
    ]);

export const AppRouter = () => {
    const queryClient = useQueryClient();

    const router = useMemo(() => createAppRouter(queryClient), [queryClient]);

    return <RouterProvider router={router} />;
};
