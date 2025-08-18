export enum Status {
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

export interface postIds {
  items: number[];
  state: Status;
}
