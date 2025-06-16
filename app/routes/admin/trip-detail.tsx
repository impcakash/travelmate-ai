import type { LoaderFunctionArgs } from "react-router";
import { getTripById } from "~/appwrite/trips";
import type { Route } from "./+types/trip-detail";
import { parseTripData } from "~/lib/utils";
import { Header, InfoPill } from "components";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { tripId } = params;

  if (!tripId) throw new Error("Trip ID is required");

  return await getTripById(tripId);
};

const tripDetail = ({ loaderData }: Route.ComponentProps) => {
  const imageUrls = loaderData?.imageUrls || [];
  console.log("imageUrls: ", imageUrls);

  const tripData = parseTripData(loaderData?.tripDetail);
  console.log(loaderData);

  const {
    name,
    duration,
    itinerary,
    travelStyle,
    groupType,
    budget,
    interests,
    estimatedPrice,
    description,
    bestTimeToVisit,
    weatherInfo,
    country,
  } = tripData || {};

  return (
    <main className="travel-detail wrapper">
      <Header
        title="Trip Details"
        description="View and edit AI-generated travel plans"
      />

      <section className="container wrapper-md">
        <header>
          <h1 className="p-40-semibold">{name}</h1>
          <div className="flex items-center gap-5">
            <InfoPill
              text={`${duration} day plan`}
              image="/assets/icons/calendar.svg"
            />

            <InfoPill
              text={
                itinerary
                  ?.slice(0, 2)
                  .map((item) => item.location)
                  .join(", ") || ""
              }
              image="/assets/icons/location-mark.svg"
            />
          </div>
        </header>

        <section className="gallary">{imageUrls}</section>
      </section>
    </main>
  );
};

export default tripDetail;
