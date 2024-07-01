import { useState, useEffect } from "react";
import { useParams, useSearchParams, useLoaderData } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import Select from "react-select";

import "./style.scss";

import { fetchDataFromTMDBApi } from "../../utils/api";
import ContentWrapper from "../../components/contentWrapper/ContentWrapper";
import MovieCard from "../../components/movieCard/MovieCard";
import Spinner from "../../components/spinner/Spinner";

let filters = {};

const sortbyData = [
  { value: "popularity.desc", label: "Popularity Descending" },
  { value: "popularity.asc", label: "Popularity Ascending" },
  { value: "vote_average.desc", label: "Rating Descending" },
  { value: "vote_average.asc", label: "Rating Ascending" },
  {
    value: "primary_release_date.desc",
    label: "Release Date Descending",
  },
  { value: "primary_release_date.asc", label: "Release Date Ascending" },
  { value: "original_title.asc", label: "Title (A-Z)" },
];

const Explore = () => {
  const [data, setData] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);
  const [genre, setGenre] = useState(null);
  const [sortby, setSortby] = useState(null);
  const { mediaType } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const genresData = useLoaderData();

  const setInitialQueryParams = () => {
    const selectedGenres = searchParams.get("genre");
    if (selectedGenres) {
      let initGenres = selectedGenres.split(",").map((genre) => {
        const foundGenre = genresData.genres.find(
          (item) => item.name === genre
        );
        if (foundGenre) {
          return foundGenre;
        }
      });
      setGenre(initGenres);
      let selectedGenresId = selectedGenres.split(",").map((genre) => {
        const foundGenre = genresData.genres.find(
          (item) => item.name === genre
        );
        if (foundGenre) {
          return foundGenre.id;
        }
      });
      selectedGenresId = JSON.stringify(selectedGenresId).slice(1, -1);
      filters.with_genres = selectedGenresId;
    }

    const sortByFilter = searchParams.get("sortBy");
    if (sortByFilter) {
      const targetSortByFilter = sortbyData.find(
        (item) => item.value === sortByFilter
      );
      setSortby(targetSortByFilter);
      filters.sort_by = sortByFilter;
    }
  };

  const fetchInitialData = () => {
    setInitialQueryParams();
    setLoading(true);

    fetchDataFromTMDBApi(`/discover/${mediaType}`, filters).then((res) => {
      setData(res);
      setPageNum((prev) => prev + 1);
      setLoading(false);
    });
  };

  const fetchNextPageData = () => {
    fetchDataFromTMDBApi(
      `/discover/${mediaType}?page=${pageNum}`,
      filters
    ).then((res) => {
      if (data?.results) {
        setData({
          ...data,
          results: [...data?.results, ...res.results],
        });
      } else {
        setData(res);
      }
      setPageNum((prev) => prev + 1);
    });
  };

  useEffect(() => {
    filters = {};
    setData(null);
    setPageNum(1);
    setSortby(null);
    setGenre(null);
    fetchInitialData();
  }, [mediaType]);

  const onChange = (selectedItems, action) => {
    if (action.name === "sortby") {
      setSortby(selectedItems);
      if (action.action !== "clear") {
        searchParams.set("sortBy", selectedItems.value);
        setSearchParams(searchParams);
        filters.sort_by = selectedItems.value;
      } else {
        searchParams.delete("sortBy");
        setSearchParams(searchParams);
        delete filters.sort_by;
      }
    }

    if (action.name === "genres") {
      setGenre(selectedItems);
      if (action.action !== "clear") {
        if (selectedItems.length === 0) {
          searchParams.delete("genre");
          setSearchParams(searchParams);
        } else {
          const paramGenres = selectedItems
            .map((item) => {
              return item.name;
            })
            .join(",");
          searchParams.set("genre", paramGenres);
          setSearchParams(searchParams);
        }
        let genreId = selectedItems.map((g) => g.id);
        genreId = JSON.stringify(genreId).slice(1, -1);
        filters.with_genres = genreId;
      } else {
        searchParams.delete("genre");
        setSearchParams(searchParams);
        delete filters.with_genres;
      }
    }

    setPageNum(1);
    fetchInitialData();
  };

  return (
    <div className="explorePage">
      <ContentWrapper>
        <div className="pageHeader">
          <div className="pageTitle">
            {mediaType === "tv" ? "Explore TV Shows" : "Explore Movies"}
          </div>
          <div className="filters">
            <Select
              isMulti
              name="genres"
              value={genre}
              closeMenuOnSelect={false}
              options={genresData?.genres}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.id}
              onChange={onChange}
              placeholder="Select genres"
              className="react-select-container genresDD"
              classNamePrefix="react-select"
            />
            <Select
              name="sortby"
              value={sortby}
              options={sortbyData}
              onChange={onChange}
              isClearable={true}
              placeholder="Sort by"
              className="react-select-container sortbyDD"
              classNamePrefix="react-select"
            />
          </div>
        </div>
        {loading && <Spinner initial={true} />}
        {!loading && (
          <>
            {data?.results?.length > 0 ? (
              <InfiniteScroll
                className="content"
                dataLength={data?.results?.length || []}
                next={fetchNextPageData}
                hasMore={pageNum <= data?.total_pages}
                loader={<Spinner />}
              >
                {data?.results?.map((item, index) => {
                  if (item.media_type === "person") return;
                  return (
                    <MovieCard key={index} data={item} mediaType={mediaType} />
                  );
                })}
              </InfiniteScroll>
            ) : (
              <span className="resultNotFound">Sorry, Results not found!</span>
            )}
          </>
        )}
      </ContentWrapper>
    </div>
  );
};

export default Explore;

export const loader = async ({ params }) => {
  const { mediaType } = params;

  try {
    const data = await fetchDataFromTMDBApi(`/genre/${mediaType}/list`);
    if (!data) {
      throw new Error("Couldn't fetch genres info.");
    }
    return data;
  } catch (err) {
    console.log(err.message);
  }
  return null;
};
