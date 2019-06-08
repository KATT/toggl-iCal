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
