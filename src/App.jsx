import { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getApiConfiguration, getGenres } from "./store/homeSlice";
import { fetchDataFromTMDBApi } from "./utils/api";

import SharedUI from "./pages/sharedUI/SharedUI";
import PageNotFound from "./pages/404/PageNotFound";
import Home from "./pages/home/Home";
import SearchResult, {
  loader as searchResultLoader,
} from "./pages/searchResult/SearchResult";
import Explore, { loader as exploreLoader } from "./pages/explore/Explore";
import Details, { loader as detailsLoader } from "./pages/details/Details";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SharedUI />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/:mediaType/:id",
        element: <Details />,
        loader: detailsLoader,
      },
      {
        path: "/search/:query",
        element: <SearchResult />,
        loader: searchResultLoader,
      },
      {
        path: "/explore/:mediaType",
        element: <Explore />,
        loader: exploreLoader,
      },
      {
        path: "*",
        element: <PageNotFound />,
      },
    ],
  },
]);

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    apiConfiguration();
    genresCall();
  }, []);

  const apiConfiguration = async () => {
    const res = await fetchDataFromTMDBApi("/configuration");
    const url = {
      backdrop: res.images.secure_base_url + "original",
      poster: res.images.secure_base_url + "original",
      profile: res.images.secure_base_url + "original",
    };

    dispatch(getApiConfiguration(url));
  };

  const genresCall = async () => {
    let promises = [];
    let endPoints = ["tv", "movie"];

    let allGenres = {};

    endPoints.forEach((url) => {
      promises.push(fetchDataFromTMDBApi(`/genre/${url}/list`));
    });

    const data = await Promise.all(promises);
    data.map(({ genres }) => {
      return genres.map((item) => {
        return (allGenres[item.id] = item);
      });
    });

    dispatch(getGenres(allGenres));
  };
  return <RouterProvider router={router} />;
}

export default App;
