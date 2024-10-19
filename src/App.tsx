import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import ky from "ky"
import { type Map } from "leaflet"
import "leaflet/dist/leaflet.css"
import { Lightbulb, LightbulbOff } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import { InsertPowerStatus, type PowerStatus } from "../server/db/schema"
import useRelativeTime from "./useRelativeTime"
import { twMerge } from "tailwind-merge"

const TimeAgo = ({ date }: { date: Date }) => {
  const relativeTime = useRelativeTime(date)
  return <span className="font-mono text-xs">{relativeTime}</span>
}

const App = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [map, setMap] = useState<Map | null>(null)
  const queryClient = useQueryClient()
  const { data: powerStatuses } = useQuery<PowerStatus[]>({
    queryKey: ["powerStatuses"],
    queryFn: async () => await ky.get(import.meta.env.VITE_API_URL + "/power-statuses").json(),
  })

  const { mutate } = useMutation({
    mutationFn: async (hasPower: boolean) => {
      const newStatus: InsertPowerStatus = {
        id: Date.now().toString(),
        latitude: userLocation?.[0] ?? 0,
        longitude: userLocation?.[1] ?? 0,
        hasPower,
        createdAt: new Date(),
      }
      await ky.post(import.meta.env.VITE_API_URL + "/power-status", { json: newStatus })
      return newStatus
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["powerStatuses"] }),
  })

  useEffect(() => {
    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      if (result.state === "granted") {
        getLocation()
      }
    })
  }, [])

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude])
        if (map) map.flyTo([position.coords.latitude, position.coords.longitude], 16, { animate: true, duration: 0.2 })
      },
      (error) => {
        console.error("Error getting user location:", error)
      }
    )
  }
  const displayMap = useMemo(
    () => (
      <MapContainer ref={setMap} zoom={10} center={[16.265, -61.551]} style={{ height: "100%", minHeight: "400px" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {userLocation && <Marker position={userLocation} />}
        <StatusList powerStatuses={powerStatuses} />
      </MapContainer>
    ),
    [powerStatuses]
  )
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center gap-4 bg-slate-900 p-4 text-white md:flex-row">
        <h1 className="text-3xl font-bold text-amber-400">Pani limiè !</h1>
        <span>On dit merci EDF PEI…</span>
      </header>
      <main className="flex flex-grow flex-col md:flex-row">
        <div className="order-2 flex w-full flex-grow flex-col items-center justify-center gap-2 p-4 md:order-1 md:w-1/3 md:flex-grow-0 md:gap-4">
          <h2 className="w-full text-left text-2xl font-medium">Chez toi c'est comment ?</h2>
          {!userLocation ? (
            <div className="flex items-center justify-center md:min-h-dvh">
              <button
                className="rounded-sm border border-gray-300 px-4 py-2 font-bold text-gray-700 transition duration-300 hover:bg-gray-100"
                onClick={getLocation}
              >
                Activer ma localisation
              </button>
            </div>
          ) : (
            <>
              <div className="flex w-full flex-col gap-4 md:flex-row">
                <button
                  onClick={() => mutate(true)}
                  className="flex w-full flex-row items-center justify-center gap-2 rounded-md bg-amber-400 px-6 py-4 font-bold text-slate-800 transition duration-300 hover:bg-yellow-400 hover:text-white md:flex-col md:gap-4"
                >
                  <Lightbulb size={33} className="mr-2" /> J'ai de l'électricité
                </button>
                <button
                  onClick={() => mutate(false)}
                  className="flex w-full flex-row items-center justify-center gap-2 rounded-md bg-slate-800 px-6 py-4 font-bold text-white transition duration-300 hover:text-amber-400 md:flex-col md:gap-4"
                >
                  <LightbulbOff size={33} className="mr-2" />
                  J'ai pas d'électricité
                </button>
              </div>
              <div className="relative mt-8 w-full">
                <h3 className="mb-4 text-left text-lg font-medium">Historique</h3>
                <div className="flex flex-col items-center justify-center gap-2 overflow-auto">
                  {powerStatuses?.map(({ id, latitude, longitude, hasPower, createdAt }) => (
                    <button
                      onClick={() => map?.flyTo([latitude, longitude], 18, { animate: true, duration: 0.8 })}
                      key={id}
                      className={twMerge(
                        "flex w-full items-center justify-between rounded border border-amber-500/30 bg-amber-400/20 px-2 py-3 font-mono text-xs",
                        !hasPower && "border-slate-800 bg-slate-800 text-yellow-400"
                      )}
                    >
                      <div className={twMerge("flex w-full flex-row items-center justify-between gap-2")} key={id}>
                        {hasPower ? (
                          <span className="rounded-full bg-white p-1 text-3xl">💡</span>
                        ) : (
                          <span className="rounded-full bg-white p-1 text-3xl">🕯️</span>
                        )}
                        clique pour y aller
                        <TimeAgo date={createdAt} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <p className="mt-8 text-center">
            Codé à la bougie par{" "}
            <a target="_blank" href="https://marvinl.com" className="font-semibold underline hover:underline-offset-8">
              MarvinL.com
            </a>
          </p>
        </div>
        <div className="order-1 w-full md:order-2 md:w-2/3 md:flex-grow">{displayMap}</div>
      </main>
    </div>
  )
}

const StatusList = ({ powerStatuses }: { powerStatuses: PowerStatus[] | undefined }) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const map = useMapEvents({
    locationfound: (e) => {
      console.log("location found", e)
      setUserLocation([e.latlng.lat, e.latlng.lng])
      map.fitBounds(powerStatuses?.map(({ latitude, longitude }) => [latitude, longitude]) as [number, number][], {
        animate: true,
        duration: 0.2,
        padding: [150, 150],
      })
    },
  })

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
        {powerStatuses?.map(({ id, latitude, longitude, hasPower, createdAt }) => (
          <Marker key={id} position={[latitude, longitude]} title={hasPower ? "💡" : "🕯️"}>
            <Popup>
              {hasPower ? <Lightbulb size={44} className="text-green-500" /> : <LightbulbOff size={44} className="text-red-500" />}
              <br />
              <TimeAgo date={createdAt} />
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </>
  )
}
export default App
