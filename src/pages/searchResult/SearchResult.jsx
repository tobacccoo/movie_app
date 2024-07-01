import React, { useState, useEffect } from "react";
import { useLoaderData, useParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";

import style from "./style.scss";

import { fetchDataFromTMDBApi } from "../../utils/api";
import ContentWrapper from "../../components/contentWrapper/ContentWrapper";
import MovieCard from "../../components/movieCard/MovieCard";
import Spinner from "../../components/spinner/Spinner";
import noResults from "../../assets/no-results.png";

const SearchResult = () => {
  const initialData = useLoaderData();

  const [data, setData] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);

  const { query } = useParams();

  const fetchNextPageData = async () => {
    setLoading(true);
    const res = await fetchDataFromTMDBApi(
      `/search/multi?query=${query}&page=${pageNum}`
    );

    if (data?.results) {
      setData({
        ...data,
        results: [...data?.results, ...res?.results],
      });
    } else {
      setData(res);
    }
    setPageNum((prev) => prev + 1);
    setLoading(false);
  };

  useEffect(() => {
    setPageNum((prev) => prev + 1);
    setData(initialData);
  }, [initialData]);

  return (
    <div className="searchResultsPage">
      {!loading && (
        <ContentWrapper>
          {data?.results?.length > 0 ? (
            <>
              <div className="pageTitle">
                {`Search ${
                  data.total_results > 1 ? "results" : "results"
                } of '${query}'`}
              </div>
              <InfiniteScroll
                className="content"
                dataLength={data?.results?.length || []}
                next={fetchNextPageData}
                hasMore={pageNum <= data?.total_pages}
                loader={<Spinner />}
              >
                {data?.results.map((item, index) => {
                  if (item.media_type === "person") return;
                  return (
                    <MovieCard key={index} data={item} fromSearch={true} />
                  );
                })}
              </InfiniteScroll>
            </>
          ) : (
            <>
              <span className="resultNotFound">Sorry, results not found!</span>
              <img src={noResults} alt="no results" className="noResultsImg" />
            </>
          )}
        </ContentWrapper>
      )}
      {loading && <Spinner initial={true} />}
    </div>
  );
};

export default SearchResult;

export const loader = async ({ params }) => {
  const { query } = params;

  const res = await fetchDataFromTMDBApi(`/search/multi?query=${query}&page=1`);
  return res;
};
