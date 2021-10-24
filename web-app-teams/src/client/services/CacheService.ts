import { LOCAL_STORAGE } from "./../constants";

// TODO: clint side cache service

export function getCacheKey(scope: string, name: string): string {
    return `${LOCAL_STORAGE.PREFIX}_${scope}_${name}`;
}