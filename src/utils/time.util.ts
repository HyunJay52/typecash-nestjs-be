export class TimeUtil {
    static getUtcNow(): Date {
        return new Date();
    }

    static getKtsNow(): Date {
        const nowUtc = new Date();
        return this.utcToKts(nowUtc);
    }

    static utcToKts(dateUtc: Date): Date {
        const utc = new Date(dateUtc.getTime());
        utc.setHours(utc.getHours() + 9);
        return utc;
    }

    static ktsToUtc(dateKts: Date): Date {
        const kts = new Date(dateKts.getTime());
        kts.setHours(kts.getHours() - 9);
        return kts;
    }
}
