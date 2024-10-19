import { useState, useEffect, useMemo } from "react"
import { MapContainer, TileLayer, Circle, Popup, useMap, useMapEvents, Marker, CircleMarker } from "react-leaflet"
import { Lightbulb, LightbulbOff } from "lucide-react"
import "leaflet/dist/leaflet.css"
import { divIcon, Icon, LatLng, Point, point, type Map, type MarkerCluster } from "leaflet"
import { InsertPowerStatus, type PowerStatus } from "../server/db/schema"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import ky from "ky"
import useRelativeTime from "./useRelativeTime"
import MarkerClusterGroup from "react-leaflet-cluster"
import locationIcon from "./location.svg"

const TimeAgo = ({ date }: { date: Date }) => {
  const relativeTime = useRelativeTime(date)
  return <span>{relativeTime}</span>
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

  const getLocation = async () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("User location:", position.coords)
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
    []
  )
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-blue-600 p-4 text-white">
        <h1 className="text-2xl font-bold">Pani limiè !</h1>
      </header>
      <main className="flex flex-grow flex-col md:flex-row">
        <div className="order-2 flex w-full flex-grow flex-col items-center justify-center p-4 md:order-1 md:w-1/3 md:flex-grow-0">
          <h2 className="mb-4 text-xl font-medium">Chez toi c'est comment ?</h2>
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
            <div>
              <div className="flex w-full flex-col gap-4 md:flex-row">
                <button
                  onClick={() => mutate(true)}
                  className="flex w-full items-center justify-center rounded-md bg-green-500 px-6 py-4 font-bold text-white transition duration-300 hover:bg-green-600"
                >
                  <Lightbulb size={24} className="mr-2" /> J'ai de l'électricité
                </button>
                <button
                  onClick={() => mutate(false)}
                  className="flex w-full items-center justify-center rounded-md bg-red-500 px-6 py-4 font-bold text-white transition duration-300 hover:bg-red-600"
                >
                  <LightbulbOff size={24} className="mr-2" />
                  J'ai pas d'électricité
                </button>
              </div>
              <h3 className="mb-4 mt-6 text-xl font-medium">Historique</h3>
              <div className="my-6 flex flex-col items-center justify-center gap-4">
                {powerStatuses?.map(({ id, latitude, longitude, hasPower, createdAt }) => (
                  <div key={id} className="flex w-full justify-between font-mono text-xs">
                    <button onClick={() => map?.flyTo([latitude, longitude], 18, { animate: true, duration: 0.8 })}>
                      {hasPower ? "💡" : "🕯️"} à XYZ{" "}
                    </button>
                    <TimeAgo date={createdAt} />
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-center">
            Pondu à la bougie par{" "}
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
  const map = useMap()

  return (
    <MarkerClusterGroup chunkedLoading removeOutsideVisibleBounds animate singleMarkerMode spiderfyOnMaxZoom showCoverageOnHover zoomToBoundsOnClick>
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
  )
}
export default App
