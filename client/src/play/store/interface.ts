export interface PlayOpts {
  orientation: Color;
}

export interface PlaySettings {
  socketReceive: (t: string, d: any) => void;
}
