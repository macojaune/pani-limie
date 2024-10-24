import { Droplets, Lightbulb, LightbulbOff, Milk } from "lucide-react";
import { useState } from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { WaterStatus, type PowerStatus } from "../../server/db/schema";
import TimeAgo from "./time-ago";
import { divIcon, point } from "leaflet";
import { twMerge } from "tailwind-merge";

const StatusList = ({
  statuses,
  type,
}:
  | {
      statuses: PowerStatus[] | undefined;
      type: "power";
    }
  | {
      statuses: WaterStatus[] | undefined;
      type: "water";
    }) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const map = useMapEvents({
    locationfound: (e) => {
      console.log("location found", e);
      setUserLocation([e.latlng.lat, e.latlng.lng]);
      map.fitBounds(
        statuses?.map(({ latitude, longitude }) => [latitude, longitude]) as [
          number,
          number,
        ][],
        {
          animate: true,
          duration: 0.2,
          padding: [150, 150],
        },
      );
    },
  });

  return (
    <>
      {userLocation && <Marker position={userLocation} />}
      <MarkerClusterGroup
        iconCreateFunction={(cluster) => {
          const markers = cluster.getAllChildMarkers().sort((a, b) => {
            const first = a.options.title!.split("_");
            const second = b.options.title!.split("_");
            return new Date(second[2]).getTime() - new Date(first[2]).getTime();
          });
          const [type, latestStatus, _] = markers[0].options?.title!.split("_");

          return divIcon({
            html: `<div class="aspect-square flex items-center justify-center">
              <span class="text-base font-medium text-white">${cluster.getChildCount()}</span>
            </div>`,
            className: twMerge(
              "border-4 rounded-full ",
              type === "power" &&
                (latestStatus === "on"
                  ? "border-green-500/10 bg-green-500/90"
                  : "border-red-500/10 bg-red-500/90"),
              type === "water" &&
                (latestStatus === "on"
                  ? "border-cyan-500/10 bg-cyan-500/90"
                  : "border-cyan-900/10 bg-cyan-900/90"),
            ),
            iconSize: point(60, 60),
          });
        }}
        chunkedLoading
        removeOutsideVisibleBounds
        animate
        singleMarkerMode
        spiderfyOnMaxZoom
        showCoverageOnHover
        zoomToBoundsOnClick
      >
        {statuses?.map((data) => {
          const { id, latitude, longitude, createdAt, isOn } = data;

          return (
            <Marker
              key={id}
              position={[latitude, longitude]}
              title={`${type}_${isOn ? "on" : "off"}_${createdAt}`}
            >
              <Popup>
                {type === "power" &&
                  (isOn ? (
                    <Lightbulb size={44} className="text-green-500" />
                  ) : (
                    <LightbulbOff size={44} className="text-red-500" />
                  ))}
                {type === "water" &&
                  (isOn ? (
                    <Droplets size={44} className="text-cyan-500" />
                  ) : (
                    <Milk size={44} className="text-cyan-950" />
                  ))}
                <br />
                <TimeAgo date={createdAt} />
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </>
  );
};
export default StatusList;
