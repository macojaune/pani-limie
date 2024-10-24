import { Droplet, Droplets, Lightbulb, LightbulbOff, Milk } from "lucide-react";
import { POWER_STATE, StatusType } from "../routes/index.lazy";
import { FC, useState } from "react";
import { twMerge } from "tailwind-merge";

const StatusSubmission: FC<{
  handleSubmit: (hasPower: boolean) => void;
  isPending: boolean;
  isSuccess: boolean;
  type?: "power" | "water";
  className?: string;
}> = ({ handleSubmit, isPending, isSuccess, type = "power", className }) => {
  const [selected, setSelected] = useState<StatusType>(POWER_STATE.UNKNOWN);

  const doSubmit = (hasPower: boolean) => {
    setSelected(hasPower ? POWER_STATE.ON : POWER_STATE.OFF);
    handleSubmit(hasPower);
  };

  return (
    <div
      className={twMerge(
        "flex w-full flex-col gap-4 sm:flex-row flex-wrap",
        className,
      )}
    >
      {((!isSuccess && selected !== POWER_STATE.OFF) ||
        (isSuccess && selected === POWER_STATE.OFF)) && (
        <button
          onClick={() => doSubmit(true)}
          className={twMerge(
            "flex grow flex-row items-center justify-center gap-2 rounded-md bg-amber-400 px-6 py-4 font-bold text-slate-800 transition duration-300 hover:bg-yellow-400 hover:text-white sm:flex-col sm:gap-4",
            type == "water" && "bg-cyan-400 hover:bg-cyan-700",
          )}
        >
          {type === "power" ? (
            <>
              <Lightbulb
                size={33}
                className={twMerge(
                  isPending && selected === POWER_STATE.ON && "animate-ping",
                )}
              />{" "}
              J'ai de l'électricité
            </>
          ) : (
            <>
              <Droplets
                size={33}
                className={twMerge(
                  isPending && selected === POWER_STATE.ON && "animate-ping",
                )}
              />{" "}
              J'ai de l'eau
            </>
          )}
        </button>
      )}
      {isSuccess && selected === POWER_STATE.ON && (
        <p
          className={twMerge(
            "text-center px-4 py-2 w-full md:w-fit self-center rounded",
            type === "power" ? "bg-amber-400/20" : "bg-cyan-400/20",
          )}
        >
          Super ! Reviens nous dire si ça change.
        </p>
      )}
      {((!isSuccess && selected !== POWER_STATE.ON) ||
        (isSuccess && selected === POWER_STATE.ON)) && (
        <button
          onClick={() => doSubmit(false)}
          className={twMerge(
            "flex flex-row grow items-center justify-center gap-2 rounded-md bg-transparent border border-slate-800 hover:bg-slate-800 px-6 py-4 font-bold text-bg-slate-800 transition duration-300 sm:grow hover:text-amber-400 sm:flex-col sm:gap-4",
            type === "water" && "hover:text-cyan-400",
          )}
        >
          {type === "power" ? (
            <>
              <LightbulbOff
                size={33}
                className={twMerge(
                  isPending && selected === POWER_STATE.OFF && "animate-ping",
                )}
              />
              J'ai pas d'électricité
            </>
          ) : (
            <>
              <Milk
                size={33}
                className={twMerge(
                  isPending && selected === POWER_STATE.OFF && "animate-ping",
                )}
              />
              J'ai pas d'eau
            </>
          )}
        </button>
      )}
      {isSuccess && selected === POWER_STATE.OFF && (
        <p
          className={twMerge(
            "text-center px-4 py-2 w-full sm:w-3/5 self-center  rounded",
            type === "power" ? "bg-amber-400/20" : "bg-cyan-400/20",
          )}
        >
          😵‍💫 Bon Courage… <br />
          Reviens nous dire quand ça change.
        </p>
      )}
    </div>
  );
};
export default StatusSubmission;
