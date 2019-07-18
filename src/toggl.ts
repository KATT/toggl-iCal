import Axios from "axios";
import qs from "querystring";

export interface TogglEntry {
  id: number;
  guid: string;
  wid: number;
  pid?: number;
  billable: boolean;
  start: Date;
  stop: Date;
  duration: number;
  description?: string;
  duronly: boolean;
  at: Date;
  uid: number;
}

export interface TogglProject {
  id: number;
  wid: number;
  cid: number;
  name: string;
  billable: boolean;
  is_private: boolean;
  active: boolean;
  template: boolean;
  at: Date;
  created_at: Date;
  color: string;
  auto_estimates: boolean;
  actual_hours: number;
  hex_color: string;
  rate?: number;
}

export function createClient({ token }: { token: string }) {
  const togglAxios = Axios.create({
    baseURL: "https://www.toggl.com/api/v8",
    auth: {
      username: token,
      password: "api_token",
    },
  });

  async function get<T>(path: string): Promise<T> {
    const { data } = await togglAxios(path);

    return data;
  }

  async function getEntries({
    start_date,
    end_date,
  }: {
    start_date: Date;
    end_date: Date;
  }) {
    const query: any = {
      start_date: start_date.toJSON(),
      end_date: end_date.toJSON(),
    };

    const path = `/time_entries?${qs.stringify(query)}`;

    return get<TogglEntry[]>(path);
  }

  async function getProjectById(id: number) {
    const path = `/projects/${id}`;

    const data = await get<{ data: TogglProject }>(path);

    return data.data;
  }

  function projectByIdLoaderFactory() {
    const cache = new Map<number, Promise<TogglProject>>();

    return async function load(id: number) {
      if (!cache.has(id)) {
        const promise = getProjectById(id);
        cache.set(id, promise);
      }

      return cache.get(id)!;
    };
  }

  return {
    getProjectById,
    projectByIdLoaderFactory,
    getEntries,
  };
}
