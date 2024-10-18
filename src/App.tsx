import React, { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import { Lightbulb, LightbulbOff } from "lucide-react"
import "leaflet/dist/leaflet.css"
import { db } from "./db"
import { type PowerStatus, powerStatuses } from "./db/schema"
import { eq } from "drizzle-orm"

const App = () => {
  const [powerStatuses, setPowerStatuses] = useState<PowerStatus[]>([])
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude])
      },
      (error) => {
        console.error("Error getting user location:", error)
        setUserLocation([0, 0])
      }
    )

    fetchPowerStatuses()
  }, [])

  const fetchPowerStatuses = async () => {
    try {
      const statuses: PowerStatus[] = await db.select().from(powerStatuses)
      setPowerStatuses(statuses)
    } catch (error) {
      console.error("Error fetching power statuses:", error)
    }
  }

  const reportPowerStatus = async (hasPower: boolean) => {
    if (userLocation) {
      const newStatus: PowerStatus = {
        id: Date.now().toString(),
        latitude: userLocation[0].toString(),
        longitude: userLocation[1].toString(),
        hasPower,
        createdAt: new Date(),
      }

      try {
        await db.insert(powerStatuses).values(newStatus)
        setPowerStatuses([...powerStatuses, newStatus])
      } catch (error) {
        console.error("Error saving power status:", error)
      }
    }
  }

  if (!userLocation) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-blue-600 p-4 text-white">
        <h1 className="text-2xl font-bold">Pani limiè !</h1>
      </header>
      <main className="flex flex-grow flex-col md:flex-row">
        <div className="flex flex-col items-center justify-center p-4 md:w-1/3">
          <h2 className="mb-4 text-xl">Report Your Power Status</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => reportPowerStatus(true)}
              className="flex items-center justify-center rounded-full bg-green-500 px-6 py-4 font-bold text-white transition duration-300 hover:bg-green-600"
            >
              <Lightbulb size={24} className="mr-2" /> J'ai de l'électricité
            </button>
            <button
              onClick={() => reportPowerStatus(false)}
              className="flex items-center justify-center rounded-full bg-red-500 px-6 py-4 font-bold text-white transition duration-300 hover:bg-red-600"
            >
              <LightbulbOff size={24} className="mr-2" />
              J'ai pas d'électricité
            </button>
          </div>
        </div>
        <div className="flex-grow p-4 md:w-2/3">
          <MapContainer center={userLocation} zoom={13} style={{ height: "100%", minHeight: "300px" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {powerStatuses.map((status) => (
              <Marker key={status.id} position={[parseFloat(status.latitude), parseFloat(status.longitude)]}>
                <Popup>
                  {status.hasPower ? <Lightbulb size={24} className="" /> : <LightbulbOff size={24} className="" />}
                  <br />
                  Reported: {status.createdAt.toLocaleString()}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </main>
    </div>
  )
}

export default App
