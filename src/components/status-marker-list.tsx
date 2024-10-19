import { Lightbulb, LightbulbOff } from "lucide-react";
import { useState } from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { type PowerStatus } from "../../server/db/schema";
import TimeAgo from "./time-ago";
import { divIcon, point } from "leaflet";
import { counting } from "radash";
import { twMerge } from "tailwind-merge";

const StatusList = ({
  powerStatuses,
}: {
  powerStatuses: PowerStatus[] | undefined;
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [test, setTest] = useState(null);
  const map = useMapEvents({
    locationfound: (e) => {
      console.log("location found", e);
      setUserLocation([e.latlng.lat, e.latlng.lng]);
      map.fitBounds(
        powerStatuses?.map(({ latitude, longitude }) => [
          latitude,
          longitude,
        ]) as [number, number][],
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
          const markers = cluster.getAllChildMarkers();
          const res = counting(markers, (m) =>
            m.options.title === "💡" ? "light" : "dark",
          );

          return divIcon({
            html: `<div class="aspect-square flex items-center justify-center">
              <span class="text-base font-medium text-white">${cluster.getChildCount()}</div>
            </div>`,
            className: twMerge(
              "border-4 rounded-full ",
              (res?.light ?? 0) > (res?.dark ?? 0)
                ? "border-green-500/10 bg-green-500/90"
                : "border-red-500/10 bg-red-500/90",
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
        {powerStatuses?.map(
          ({ id, latitude, longitude, hasPower, createdAt }) => (
            <Marker
              key={id}
              position={[latitude, longitude]}
              title={hasPower ? "💡" : "🕯️"}
            >
              <Popup>
                {hasPower ? (
                  <Lightbulb size={44} className="text-green-500" />
                ) : (
                  <LightbulbOff size={44} className="text-red-500" />
                )}
                <br />
                <TimeAgo date={createdAt} />
              </Popup>
            </Marker>
          ),
        )}
      </MarkerClusterGroup>
    </>
  );
};
export default StatusList;
