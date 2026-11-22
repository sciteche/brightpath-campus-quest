import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// The static build (GitHub Pages / Hostinger) can be served from a sub-folder such as
// /brightpath-campus-quest/. Derive the basepath from the page URL so "/" matches wherever
// the files are hosted. On the server (SSR/prerender) and in dev the app is served at "/".
function getBasepath() {
  if (typeof document === "undefined") return "/";
  const directory = new URL(".", document.baseURI).pathname;
  // TanStack Router expects "/" or "/sub-folder" without a trailing slash.
  return directory.length > 1 ? directory.replace(/\/$/, "") : "/";
}

export const getRouter = () => {
  // One client per request: a module-level QueryClient leaks cached data between SSR requests.
  const queryClient = new QueryClient();

  const basepath = getBasepath();
  const router = createRouter({
    routeTree,
    basepath,
    context: { queryClient },
    scrollRestoration: true,
    // Lets Query own freshness; set caching defaults on the QueryClient, not the router.
    defaultPreloadStaleTime: 0,
  });

  // TanStack Start's client entry calls router.update({ basepath }) with the build-time
  // basepath ("/"), which would undo the runtime one on sub-folder hosts. Keep ours.
  const update = router.update.bind(router);
  router.update = (options) => update({ ...options, basepath });

  return router;
};
