import { useEffect, useState } from "react";
import { fetchDataFromTMDBApi } from "../utils/api";

const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);

  useEffect(() => {
    setIsLoading("Loading...");
    setData(null);
    setError(null);

    fetchDataFromTMDBApi(url)
      .then((res) => {
        setIsLoading(false);
        setData(res);
      })
      .catch((err) => {
        setIsLoading(false);
        setError("Something went wrong!");
      });
  }, [url]);

  return {
    data,
    error,
    isLoading,
  };
};

export default useFetch;
