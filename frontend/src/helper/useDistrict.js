import { useSelector } from "react-redux";

export default function useDistrict() {
  return useSelector((state) => state.location?.district) || "";
}
