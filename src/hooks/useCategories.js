import { useEffect, useState } from "react";
import api, { getApiMessage } from "../lib/api";

export default function useCategories() {
  const [state, setState] = useState({ loading: true, error: "", tree: [], flat: [] });

  useEffect(() => {
    let active = true;
    api
      .get("/categories")
      .then(({ data }) => {
        if (active) {
          setState({ loading: false, error: "", tree: data.tree || [], flat: data.flat || [] });
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            loading: false,
            error: getApiMessage(error, "Categories could not be loaded."),
            tree: [],
            flat: [],
          });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}
