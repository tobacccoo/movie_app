import axios from "axios";

const BASE_URL = "https://api.themoviedb.org/3";
const TMDB_TOKEN = import.meta.env.VITE_APP_TMDB_TOKEN;

// As for authentication we will be using authentication token so that needs to be passed
// inside authorization header and this being 'Bearer YOUR_TOKEN' is just how it works.
const headers = {
  Authorization: "Bearer " + TMDB_TOKEN,
};

// url is the resource or api endpoint we are trying to access
// params are the request parameter
export const fetchDataFromTMDBApi = async (url, params) => {
  try {
    const { data } = await axios.get(BASE_URL + url, {
      headers: headers,
      params: params,
    });
    return data;
  } catch (err) {
    console.log(err);
    return err;
  }
};
