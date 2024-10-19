import { Lightbulb, LightbulbOff } from "lucide-react";
import { useState } from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { type PowerStatus } from "../../server/db/schema";
import TimeAgo from "./time-ago";

const StatusList = ({
  powerStatuses,
}: {
  powerStatuses: PowerStatus[] | undefined;
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
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
