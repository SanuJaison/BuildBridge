import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api, { getApiMessage } from "../lib/api";

export default function useListing(endpoint, fallbackMessage = "We couldn't load these results.") {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const [state, setState] = useState({ loading: true, error: "", data: null });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, error: "" }));
    api
      .get(queryString ? `${endpoint}?${queryString}` : endpoint)
      .then(({ data }) => {
        if (active) setState({ loading: false, error: "", data });
      })
      .catch((error) => {
        if (active) setState({ loading: false, error: getApiMessage(error, fallbackMessage), data: null });
      });
    return () => {
      active = false;
    };
  }, [endpoint, queryString, refreshKey, fallbackMessage]);

  const update = useCallback(
    (patch, { resetPage = true } = {}) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          Object.entries(patch).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "") next.delete(key);
            else next.set(key, String(value));
          });
          if (resetPage) next.delete("page");
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const clear = useCallback(
    (keys = []) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          keys.forEach((key) => next.delete(key));
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const reload = useCallback(() => setRefreshKey((key) => key + 1), []);

  const data = state.data;
  return {
    data,
    items: data?.items || [],
    total: data?.total || 0,
    page: data?.page || 1,
    pages: data?.pages || 1,
    limit: data?.limit || 12,
    loading: state.loading,
    error: state.error,
    searchParams,
    update,
    clear,
    reload,
  };
}
