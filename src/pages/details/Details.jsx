import { useParams, defer, Await, useLoaderData } from "react-router-dom";
import DetailsBanner from "./detailsBanner/DetailsBanner";
import Cast from "./cast/Cast";
import VideosSection from "./videos/VideosSection";
import Similar from "./carousels/Similar";
import Recommendation from "./carousels/Recommendation";
import { fetchDataFromTMDBApi } from "../../utils/api";
import { Suspense } from "react";
import { FiCommand } from "react-icons/fi";
import "./style.scss";

const Details = () => {
  const { mediaType, id } = useParams();
  const { data } = useLoaderData();

  return (
    <Suspense fallback={<FiCommand className="loading-icon" />}>
      <Await
        resolve={Promise.all([data.videos, data.credits]).then(
          (value) => value
        )}
      >
        {(value) => {
          const [videos, credits] = value;
          return (
            <div>
              <DetailsBanner
                video={videos?.results?.[0]}
                crew={credits?.crew}
              />
              <Cast data={credits?.cast} />
              <VideosSection data={videos} />
              <Similar mediaType={mediaType} id={id} />
              <Recommendation mediaType={mediaType} id={id} />
            </div>
          );
        }}
      </Await>
    </Suspense>
  );
};

export default Details;

export const loader = async ({ params }) => {
  const { mediaType, id } = params;

  return defer({
    data: {
      videos: fetchDataFromTMDBApi(`/${mediaType}/${id}/videos`),
      credits: fetchDataFromTMDBApi(`/${mediaType}/${id}/credits`),
    },
  });
};
