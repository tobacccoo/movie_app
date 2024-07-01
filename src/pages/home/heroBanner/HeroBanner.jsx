import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useFetch from "../../../hooks/useFetch";
import Img from "../../../components/lazyLoadImage/Img";
import ContentWrapper from "../../../components/contentWrapper/ContentWrapper";

import style from "./style.scss";

const HeroBanner = () => {
  const { url } = useSelector((state) => state.home);
  // to set the background image when our home page loads
  const [background, setBackground] = useState("");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const { data, isLoading } = useFetch("/movie/upcoming");

  // the reason why data state is not changing even when useFetch is executed again
  // because think of this useFetch as a part of this component (react assigns an
  // instance of useFetch with all states to this component) even if useFetch get's
  // called again since url is always "/movie/upcoming" which is a dependency to
  // useEffect inside useFetch. The function inside useEffect of useFetch doesn't get's
  // triggered due to which we don't make a new api call so data state isn't mutated
  // and our useEffect inside HeroBanner component doesn't get into an infinite loop.
  // As data hasn't changed so react won't trigger useEffect's callback function.

  useEffect(() => {
    const bg =
      url.backdrop +
      data?.results?.[Math.floor(Math.random() * 20)]?.backdrop_path;
    setBackground(bg);
  }, [data]);

  const searchQueryHandler = (e) => {
    if (e.key === "Enter" && query.length > 0) {
      navigate(`/search/${query}`);
    }
  };

  return (
    <div className="heroBanner">
      {!isLoading && (
        <div className="backdrop-img">
          <Img src={background} />
        </div>
      )}
      <div className="opacity-layer"></div>
      <ContentWrapper>
        <div className="heroBannerContent">
          <span className="title">Welcome.</span>
          <span className="subTitle">
            Millions of movies, TV shows and people to discover. Explore now.
          </span>
          <div className="searchInput">
            <input
              type="text"
              placeholder="Search for a movie or tv show..."
              onKeyUp={searchQueryHandler}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button>Search</button>
          </div>
        </div>
      </ContentWrapper>
    </div>
  );
};

export default HeroBanner;
