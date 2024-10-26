import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute, Link } from "@tanstack/react-router";
import ky from "ky";
import type {
  Map as LeafletMap,
  Control,
  Marker as LeafletMarker,
  FeatureGroup as LeafletFeatureGroup,
} from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  FeatureGroup,
  LayersControl,
  MapContainer,
  Marker,
  TileLayer,
} from "react-leaflet";
import { twMerge } from "tailwind-merge";
import {
  InsertPowerStatus,
  InsertWaterStatus,
  WaterStatus,
  type PowerStatus,
} from "../../server/db/schema";
import StatusHistoryItem from "../components/status-history-item";
import StatusList from "../components/status-marker-list";
import StatusSubmission from "../components/status-submission";

export const Route = createLazyFileRoute("/")({
  component: HomePage,
});
export const POWER_STATE = Object.freeze({ ON: 1, OFF: 0, UNKNOWN: 2 });
export type StatusType = (typeof POWER_STATE)[keyof typeof POWER_STATE];

export function HomePage({ isWater = false }: { isWater?: boolean }) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [error, setError] = useState<null | Error>(null);
  const [isLoading, setLoading] = useState(false);
  const controlRef = useRef<Control.Layers>(null!);
  const layersRef = useRef<(LeafletFeatureGroup | null)[]>([]);
  const markerRefMap = useRef(new Map<string, LeafletMarker | null>());

  const queryClient = useQueryClient();

  const { data: powerStatuses } = useQuery<PowerStatus[]>({
    queryKey: ["powerStatuses"],
    queryFn: async () =>
      await ky.get(import.meta.env.VITE_API_URL + "/power-statuses").json(),
  });

  const { data: waterStatuses } = useQuery<PowerStatus[]>({
    queryKey: ["waterStatuses"],
    queryFn: async () =>
      await ky.get(import.meta.env.VITE_API_URL + "/water-statuses").json(),
  });

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: async (isOn: boolean) => {
      const newStatus: InsertPowerStatus = {
        id: Date.now().toString(),
        latitude: userLocation?.[0] ?? 0,
        longitude: userLocation?.[1] ?? 0,
        isOn,
        createdAt: new Date(),
      };
      await ky.post(import.meta.env.VITE_API_URL + "/power-status", {
        json: newStatus,
      });
      return newStatus;
    },

    onSettled: async (data, error) => {
      if (error) {
        setError(error);
        return;
      }
      if (map && data)
        map.flyTo([data.latitude, data.longitude], 16, {
          animate: true,
          duration: 0.2,
        });
      return queryClient.invalidateQueries({ queryKey: ["powerStatuses"] });
    },
  });

  const {
    mutate: mutateWater,
    isPending: isPendingWater,
    isSuccess: isSuccessWater,
  } = useMutation({
    mutationFn: async (isOn: boolean) => {
      const newStatus: InsertWaterStatus = {
        id: Date.now().toString(),
        latitude: userLocation?.[0] ?? 0,
        longitude: userLocation?.[1] ?? 0,
        isOn,
        createdAt: new Date(),
      };
      await ky.post(import.meta.env.VITE_API_URL + "/water-status", {
        json: newStatus,
      });
      return newStatus;
    },

    onSettled: async (data, error) => {
      if (error) {
        setError(error);
        return;
      }
      if (map && data)
        map.flyTo([data.latitude, data.longitude], 16, {
          animate: true,
          duration: 0.2,
        });
      return queryClient.invalidateQueries({ queryKey: ["waterStatuses"] });
    },
  });
  const statuses = useMemo<
    ((PowerStatus | WaterStatus) & { type: string })[]
  >(() => {
    const result = [];
    if (powerStatuses)
      result.push(...powerStatuses.map((ps) => ({ ...ps, type: "power" })));
    if (waterStatuses)
      result.push(...waterStatuses.map((ws) => ({ ...ws, type: "water" })));
    if (result.length > 0)
      return result.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    return result;
  }, [powerStatuses, waterStatuses]);

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

  const setRef = (id: string, element: LeafletMarker | null) => {
    if (element) {
      markerRefMap.current.set(id, element);
    } else {
      markerRefMap.current.delete(id);
    }
  };
  const showPopup = (id: string) => {
    const marker = markerRefMap.current.get(id);
    if (marker) {
      marker.openPopup();
    }
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
        <LayersControl position="topleft" collapsed={false} ref={controlRef}>
          <LayersControl.Overlay name="Électricité" checked={!isWater}>
            <FeatureGroup ref={(el) => (layersRef.current[0] = el)}>
              <StatusList
                statuses={powerStatuses}
                type="power"
                setRef={setRef}
              />
            </FeatureGroup>
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Eau" checked={isWater}>
            <FeatureGroup ref={(el) => (layersRef.current[1] = el)}>
              <StatusList
                statuses={waterStatuses}
                type="water"
                setRef={setRef}
              />
            </FeatureGroup>
          </LayersControl.Overlay>
        </LayersControl>
        {userLocation && <Marker position={userLocation} />}
      </MapContainer>
    ),
    [powerStatuses, waterStatuses, userLocation],
  );
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
            {error && (
              <span className="text-red-500">
                Une erreur s'est produite, essaie de recommencer…
              </span>
            )}
            {userLocation && (
              <>
                <StatusSubmission
                  handleSubmit={mutate}
                  isPending={isPending}
                  isSuccess={isSuccess}
                />
                <StatusSubmission
                  handleSubmit={mutateWater}
                  isPending={isPendingWater}
                  isSuccess={isSuccessWater}
                  type="water"
                  className="mt-4"
                />
              </>
            )}

            <div className="relative mt-8 w-full">
              <h3 className="mb-4 text-left text-lg font-medium">Historique</h3>
              <div className="flex max-h-52 flex-col items-center gap-2 overflow-auto">
                {statuses?.length === 0 && (
                  <p className="text-center">
                    Pas de contributions dans les 6 dernières heures.{" "}
                  </p>
                )}
                {statuses
                  ?.sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map(({ id, latitude, longitude, type, ...rest }) => (
                    <StatusHistoryItem
                      key={id}
                      type={type}
                      handleClick={() => {
                        const powerLayer =
                          layersRef?.current[0]?.getLayers()[0];
                        const waterLayer =
                          layersRef?.current[1]?.getLayers()[0];
                        const controls = controlRef.current;
                        if (!powerLayer || !waterLayer || !controls) return;

                        if (type === "power") {
                          controls._layerControlInputs[0].checked = true;
                          if (!map?.hasLayer(powerLayer)) {
                            map?.addLayer(powerLayer);
                          }
                        }
                        if (type === "water") {
                          controls._layerControlInputs[1].checked = true;

                          if (!map?.hasLayer(waterLayer)) {
                            map?.addLayer(waterLayer);
                          }
                        }
                        map?.flyTo([latitude, longitude], 16, {
                          animate: true,
                          duration: 0.8,
                        });
                        setTimeout(() => showPopup(id), 1200);
                      }}
                      {...rest}
                    />
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
