export class GoogleVideoStatistics {
    public viewCount: number;
    public likeCount: number;
    public dislikeCount: number;
    public commentCount: number;
}

export class GoogleChannelStatistics {
}

export class GoogleVideoSnippet {
    public publishedAt: Date;
    public title: string;
    public channelId: string;
    public tags: string[];
}

export class GoogleChannelSnippet {
    public publishedAt: Date;
    public title: string;
}

export class GoogleVideoInfo {
    public id: string;
    public snippet: GoogleVideoSnippet;
    public statistics: GoogleVideoStatistics;
}

export class GoogleChannelInfo {
    public id: string;
    public snippet: GoogleChannelSnippet;
    public statistics: GoogleChannelStatistics;
}

export class GoogleResultItemList<T> {
    public items: T[];
}
