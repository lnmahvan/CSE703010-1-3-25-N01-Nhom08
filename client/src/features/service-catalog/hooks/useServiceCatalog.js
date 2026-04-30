import { useCallback, useEffect, useMemo, useState } from 'react';
import { serviceCatalogApi } from '@/api/serviceCatalogApi';

const DEFAULT_FILTERS = {
  search: '',
  service_group_id: 'all',
  status: 'all',
  visibility: 'all',
  specialty_id: 'all',
};

export const useServiceCatalog = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [error, setError] = useState(null);

  const params = useMemo(
    () => ({
      ...filters,
      page,
      per_page: perPage,
    }),
    [filters, page, perPage]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await serviceCatalogApi.list(params);
      setItems(data?.data || []);
      setMeta({
        total: data?.total || 0,
        current_page: data?.current_page || 1,
        last_page: data?.last_page || 1,
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  useEffect(() => {
    let mounted = true;
    Promise.all([serviceCatalogApi.groups(), serviceCatalogApi.specialties()])
      .then(([gRes, sRes]) => {
        if (!mounted) return;
        setGroups(gRes.data || []);
        setSpecialties(sRes.data || []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const setFilter = useCallback((key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setPage(1);
    setFilters(DEFAULT_FILTERS);
  }, []);

  const changePerPage = useCallback((next) => {
    setPage(1);
    setPerPage(next);
  }, []);

  const create = useCallback(async (payload) => {
    const { data } = await serviceCatalogApi.create(payload);
    await refresh();
    return data;
  }, [refresh]);

  const update = useCallback(async (id, payload) => {
    const { data } = await serviceCatalogApi.update(id, payload);
    await refresh();
    return data;
  }, [refresh]);

  const changeStatus = useCallback(async (id, status, reason) => {
    const { data } = await serviceCatalogApi.changeStatus(id, { status, reason });
    await refresh();
    return data;
  }, [refresh]);

  const remove = useCallback(async (id) => {
    await serviceCatalogApi.remove(id);
    await refresh();
  }, [refresh]);

  return {
    filters,
    setFilter,
    resetFilters,
    page,
    setPage,
    perPage,
    setPerPage: changePerPage,
    items,
    meta,
    loading,
    groups,
    specialties,
    error,
    refresh,
    create,
    update,
    changeStatus,
    remove,
  };
};
