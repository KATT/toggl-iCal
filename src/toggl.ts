import { env } from './env';
import Axios from 'axios';
import { stringify } from 'querystring';

const { TOGGL_API_TOKEN } = env

const togglAxios = Axios.create({
	baseURL: 'https://www.toggl.com/api/v8',
	auth: {
		username: TOGGL_API_TOKEN,
		password: 'api_token'
	},
})

async function get<T>(path: string): Promise<T> {
	const { data } = await togglAxios(path)

	return data;
}


export interface TogglEntry {
	id: number;
	guid: string;
	wid: number;
	pid: number;
	billable: boolean;
	start: Date;
	stop: Date;
	duration: number;
	description: string;
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


export async function getEntries({ start_date, end_date }: { start_date: Date, end_date: Date }) {
	const query: any = {
		start_date: start_date.toJSON(),
		end_date: end_date.toJSON()
	}

	const path = `/time_entries?${stringify(query)}`

	return get<TogglEntry[]>(path)
}

export async function getProjectById(id: number) {
	const path = `/projects/${id}`

	const data = await get<{ data: TogglProject }>(path)

	return data.data
}

export function projectByIdLoaderFactory() {
	const cache = new Map<number, Promise<TogglProject>>()

	return async function load(id: number) {
		if (!cache.has(id)) {
			const promise = getProjectById(id)
			cache.set(id, promise)
		}

		return cache.get(id)!
	}
}