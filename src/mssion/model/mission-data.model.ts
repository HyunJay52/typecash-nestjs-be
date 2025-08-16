export class MissionData {
    id: number;
    used: boolean;
    content: string;
    date?: string; // Optional, if you want to track when the mission was created or last updated
    hour?: number; // Optional, if you want to track the hour of the mission

    constructor(data: {
        id: number;
        used: boolean;
        content: string;
        date?: string;
        hour?: number;
    }) {
        this.id = data.id;
        this.used = data.used;
        this.content = data.content;
        this.date = data.date;
        this.hour = data.hour;
    }

    markAsUsed(): void {
        this.used = true;
    }
}
