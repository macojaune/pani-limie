import { FC } from "react";
import { type Map } from "leaflet";
import { twMerge } from "tailwind-merge";
import TimeAgo from "./time-ago";
import { Popup } from "react-leaflet";

const StatusHistoryItem: FC<{
  isOn: boolean;
  createdAt: Date;
  type: string | "power" | "water";
  handleClick: () => void;
}> = ({ isOn, createdAt, type, handleClick }) => {
  return (
    <button
      onClick={handleClick}
      className={twMerge(
        "flex w-full items-center justify-between rounded border border-amber-500/30 bg-amber-400/20 p-2 font-mono text-xs",
        type === "water" && "border-cyan-500/30 bg-cyan-200 text-slate-800",
        !isOn && "border-slate-800 bg-slate-800 text-yellow-400",
        !isOn && type === "water" && "text-white bg-cyan-950",
      )}
    >
      <div
        className={twMerge(
          "flex w-full flex-row items-center justify-between gap-2 font-sans",
        )}
      >
        {type === "power" &&
          (isOn ? (
            <span className="mr-2 rounded-full bg-white p-1 text-3xl">💡</span>
          ) : (
            <span className="mr-2 rounded-full bg-white p-1 text-3xl">🕯️</span>
          ))}
        {type === "water" &&
          (isOn ? (
            <span className="mr-2 rounded-full bg-white p-1 text-3xl">🚰</span>
          ) : (
            <span className="mr-2 rounded-full bg-white p-1 text-3xl">🚱</span>
          ))}
        clique pour le voir sur la carte
        <TimeAgo date={createdAt} className="ml-auto" />
      </div>
    </button>
  );
};
export default StatusHistoryItem;
