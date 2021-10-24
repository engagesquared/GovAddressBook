import { ISelectedRefiners } from "../components/pages/SearchPage/SearchRefiner";

export function buildFuzzQuery(query: string): string {
  let result = "";
  const fuzz = query
    .split(" ")
    .map((v) => `(${v}~)`)
    .join(" AND ");

  if (query.match(/^[0-9,+,#, ]+$/) != null) {
    result = `(${query}) AND (${fuzz})`;
  } else {
    //if(query.match(/^[a-zA-Z, ]+$/) != null)
    result = `(${query}) OR (${fuzz})`;
  }

  return result;
}

export function buildFilter(refiners: ISelectedRefiners | {}): string {
  const filtersByKey: string[] = [];
  for (var k of Object.keys(refiners)) {
    filtersByKey.push(refiners[k].map((v) => `${k} eq '${v}'`).join(" or "));
  }
  const result = filtersByKey
    .map((v) => (v ? `(${v})` : undefined))
    .filter((v) => !!v)
    .join(" and ");
  return result;
}
