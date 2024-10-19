import { twMerge } from "tailwind-merge";
import useRelativeTime from "../useRelativeTime";

const TimeAgo: React.FC<{ date: Date; className?: string }> = ({
  date,
  className,
}) => {
  const relativeTime = useRelativeTime(date);
  return (
    <span className={twMerge("font-mono text-xs", className)}>
      {relativeTime}
    </span>
  );
};

export default TimeAgo;
