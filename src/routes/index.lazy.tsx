import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ky from "ky";
import { type Map } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Lightbulb,
  LightbulbOff,
  Locate,
  LocateOff,
  MapPin,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { twMerge } from "tailwind-merge";
import { InsertPowerStatus, type PowerStatus } from "../../server/db/schema";
import StatusList from "../components/status-marker-list";
import TimeAgo from "../components/time-ago";
import { createLazyFileRoute, Link } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: HomePage,
});
const POWER_STATE = Object.freeze({ ON: 1, OFF: 0, UNKNOWN: 2 });
type StatusType = (typeof POWER_STATE)[keyof typeof POWER_STATE];

function HomePage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [map, setMap] = useState<Map | null>(null);
  const [selected, setSelected] = useState<StatusType>(POWER_STATE.UNKNOWN);
  const [isLoading, setLoading] = useState(false);

  const queryClient = useQueryClient();

  const { data: powerStatuses } = useQuery<PowerStatus[]>({
    queryKey: ["powerStatuses"],
    queryFn: async () =>
      await ky.get(import.meta.env.VITE_API_URL + "/power-statuses").json(),
  });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: async (hasPower: boolean) => {
      const newStatus: InsertPowerStatus = {
        id: Date.now().toString(),
        latitude: userLocation?.[0] ?? 0,
        longitude: userLocation?.[1] ?? 0,
        hasPower,
        createdAt: new Date(),
      };
      await ky.post(import.meta.env.VITE_API_URL + "/power-status", {
        json: newStatus,
      });
      return newStatus;
    },

    onSettled: (data, error) => {
      if (error) setSelected(POWER_STATE.UNKNOWN);
      if (map && data)
        map.flyTo([data.latitude, data.longitude], 16, {
          animate: true,
          duration: 0.2,
        });
      return queryClient.invalidateQueries({ queryKey: ["powerStatuses"] });
    },
  });

  const getLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setLoading(false);
        if (map)
          map.flyTo([position.coords.latitude, position.coords.longitude], 16, {
            animate: true,
            duration: 0.2,
          });
      },
      (error) => {
        console.error("Error getting user location:", error);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 4000 },
    );
  };
  const displayMap = useMemo(
    () => (
      <MapContainer
        ref={setMap}
        zoom={9}
        maxZoom={16}
        center={[16.265, -61.551]}
        style={{ height: "100%", minHeight: "400px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {userLocation && <Marker position={userLocation} />}
        <StatusList powerStatuses={powerStatuses} />
      </MapContainer>
    ),
    [powerStatuses],
  );
  const handleSubmit = (hasPower: boolean) => {
    setSelected(hasPower ? POWER_STATE.ON : POWER_STATE.OFF);
    mutate(hasPower);
  };
  return (
    <>
      <main className="flex flex-grow flex-col md:flex-row">
        <div className="order-2 flex w-full flex-grow flex-col items-center justify-center gap-2 p-4 md:order-1 md:w-1/3 md:flex-grow-0 md:gap-4">
          <h2 className="mb-2 w-full text-center text-2xl font-medium md:text-left">
            Chez toi c'est comment ?
          </h2>
          {!userLocation && (
            <div className="gap-3 flex flex-col items-center justify-center">
              <button
                className="flex flex-row md:flex-col md:items-center items-end justify-center gap-2 rounded-sm border border-gray-300 px-4 py-2 font-bold text-gray-700 transition duration-300 hover:bg-gray-100"
                onClick={getLocation}
              >
                <MapPin
                  size={24}
                  className={twMerge(
                    isLoading && "animate-pulse text-slate-800",
                  )}
                />
                {isLoading
                  ? "On récupère ta position"
                  : "Activer ma localisation"}
              </button>
              <p className="text-sm text-justify w-3/4">
                Le site est basé sur la participation de la population, plus il
                y a de partages et plus la carte sera à jour.
              </p>
            </div>
          )}
          <>
            {userLocation && (
              <div className="flex w-full flex-col gap-4 md:flex-row flex-wrap">
                {((!isSuccess && selected !== POWER_STATE.OFF) ||
                  (isSuccess && selected === POWER_STATE.OFF)) && (
                  <button
                    onClick={() => handleSubmit(true)}
                    className="flex grow flex-row items-center justify-center gap-2 rounded-md bg-amber-400 px-6 py-4 font-bold text-slate-800 transition duration-300 hover:bg-yellow-400 hover:text-white md:flex-col md:gap-4"
                  >
                    <Lightbulb
                      size={33}
                      className={twMerge(
                        isPending &&
                          selected === POWER_STATE.ON &&
                          "animate-ping",
                      )}
                    />{" "}
                    J'ai de l'électricité
                  </button>
                )}
                {isSuccess && selected === POWER_STATE.ON && (
                  <p className="text-center px-4 py-2 w-full md:w-3/5 self-center bg-amber-400/20 rounded">
                    Super ! Reviens nous dire si ça change.
                  </p>
                )}
                {((!isSuccess && selected !== POWER_STATE.ON) ||
                  (isSuccess && selected === POWER_STATE.ON)) && (
                  <button
                    onClick={() => handleSubmit(false)}
                    className="flex flex-row grow items-center justify-center gap-2 rounded-md bg-slate-800 px-6 py-4 font-bold text-white transition duration-300 md:grow hover:text-amber-400 md:flex-col md:gap-4"
                  >
                    <LightbulbOff
                      size={33}
                      className={twMerge(
                        isPending &&
                          selected === POWER_STATE.OFF &&
                          "animate-ping",
                      )}
                    />
                    J'ai pas d'électricité
                  </button>
                )}
                {isSuccess && selected === POWER_STATE.OFF && (
                  <p className="text-center px-4 py-2 w-full md:w-3/5 self-center bg-amber-400/20 rounded">
                    🕯️ Bon Courage… <br className="hidden md:inline" />
                    Reviens nous dire quand ça change.
                  </p>
                )}
              </div>
            )}
            <div className="relative mt-8 w-full">
              <h3 className="mb-4 text-left text-lg font-medium">Historique</h3>
              <div className="flex max-h-52 flex-col items-center gap-2 overflow-auto">
                {powerStatuses?.length === 0 && (
                  <p className="text-center">
                    Pas de contributions dans les 6 dernières heures.{" "}
                  </p>
                )}
                {powerStatuses
                  ?.sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map(({ id, latitude, longitude, hasPower, createdAt }) => (
                    <button
                      onClick={() =>
                        map?.flyTo([latitude, longitude], 16, {
                          animate: true,
                          duration: 0.8,
                        })
                      }
                      key={id}
                      className={twMerge(
                        "flex w-full items-center justify-between rounded border border-amber-500/30 bg-amber-400/20 p-2 font-mono text-xs",
                        !hasPower &&
                          "border-slate-800 bg-slate-800 text-yellow-400",
                      )}
                    >
                      <div
                        className={twMerge(
                          "flex w-full flex-row items-center justify-between gap-2 font-sans",
                        )}
                      >
                        {hasPower ? (
                          <span className="mr-2 rounded-full bg-white p-1 text-3xl">
                            💡
                          </span>
                        ) : (
                          <span className="mr-2 rounded-full bg-white p-1 text-3xl">
                            🕯️
                          </span>
                        )}
                        clique pour y aller
                        <TimeAgo date={createdAt} className="ml-auto" />
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </>
          <p className="mt-8 text-center">
            Codé à la bougie par{" "}
            <a
              target="_blank"
              href="https://marvinl.com"
              className="font-semibold underline hover:underline-offset-8"
            >
              MarvinL.com
            </a>
          </p>
          <nav className="">
            <Link
              to="/mentions-legales"
              className="font-medium text-xs font-mono underline underline-offset-8 md:underline-offset-2 md:hover:underline-offset-8"
            >
              Mentions légales
            </Link>
          </nav>
        </div>
        <div className="order-1 w-full md:order-2 md:w-2/3 md:flex-grow">
          {displayMap}
        </div>
      </main>
    </>
  );
}
