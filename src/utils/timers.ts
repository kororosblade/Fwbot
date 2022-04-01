import { CropsResponse } from "./../types/data.types";
import { assetNameMap } from "./../store/data";
import { filterMbsByType, mbsMultiMap } from "../store/data";
import { MbsResponse, ToolsResponse } from "../types/data.types";

export function msToTime(ms: number) {
  if (ms < 0) return "00:00:00";
  let seconds = ms / 1000;
  const hours = Math.floor(seconds / 3600);
  seconds = seconds % 3600;
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  return `${hours >= 10 ? hours : hours < 10 && hours > 0 ? `0${hours}` : "00"}:${
    minutes >= 10 ? minutes : minutes < 10 && minutes > 0 ? `0${minutes}` : "00"
  }:${seconds >= 10 ? seconds : seconds < 10 && seconds > 0 ? `0${seconds}` : "00"}`;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function adjustTime(item: ToolsResponse | MbsResponse | CropsResponse, mbs: MbsResponse[]) {
  const itemName = assetNameMap.get(item.template_id.toString());
  let timer = item.next_availability * 1000 - new Date().getTime();
  // if item is not Tool -> return timer
  if (!("durability" in item)) return timer;

  const mbsFiltered = filterMbsByType(mbs, item.type);
  if (mbsFiltered.length === 0) return timer;

  // If item is tool and we have members card, then add additional time, tyo store items (so less operation will occurs -> less CPU usage)
  const exception = ["Ancient Stone Axe", "Mining Excavator"];
  const hour = exception.includes(itemName!) ? 7200000 : 3600000;
  const additiveTime = mbsFiltered.reduce(
    (acc, cur) => (acc += mbsMultiMap.get(cur.template_id.toString())! * hour),
    0
  );
  timer += additiveTime;
  return timer;
}

export function findLowestCD(tools: ToolsResponse[], mbs: MbsResponse[], crops: CropsResponse[]) {
  const array = [...tools, ...mbs, ...crops];
  const adjustedTimeArray = array.map((item) => {
    return {
      ...item,
      next_availability: adjustTime(item, mbs),
    };
  });
  const foundedItem = adjustedTimeArray.reduce((prev, cur) => {
    return prev.next_availability < cur.next_availability ? prev : cur;
  });

  return { item: foundedItem, timer: foundedItem.next_availability };
}
