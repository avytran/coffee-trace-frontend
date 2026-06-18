import { STATUS_STYLE } from "../constants/statusStyle";

export const getStatusNameArray = () => {
  return Object.keys(STATUS_STYLE).map((key) => ({
    id: key,
    label: STATUS_STYLE[key].label,
  }));
};