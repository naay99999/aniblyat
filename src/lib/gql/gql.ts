/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n\tfragment MediaCard on Media {\n\t\tid\n\t\ttitle {\n\t\t\tromaji\n\t\t\tenglish\n\t\t}\n\t\tcoverImage {\n\t\t\tlarge\n\t\t\textraLarge\n\t\t\tcolor\n\t\t}\n\t\tbannerImage\n\t\tformat\n\t\tstatus\n\t\tepisodes\n\t\taverageScore\n\t\tpopularity\n\t\tgenres\n\t\tstartDate {\n\t\t\tyear\n\t\t\tmonth\n\t\t\tday\n\t\t}\n\t\tnextAiringEpisode {\n\t\t\tepisode\n\t\t\tairingAt\n\t\t}\n\t\tisAdult\n\t}\n": typeof types.MediaCardFragmentDoc,
    "\n\tquery Home($season: MediaSeason!, $year: Int!, $nextSeason: MediaSeason!, $nextYear: Int!) {\n\t\ttrending: Page(perPage: 12) {\n\t\t\tmedia(type: ANIME, status: RELEASING, isAdult: false, sort: TRENDING_DESC) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t\tscored: Page(perPage: 25) {\n\t\t\tmedia(\n\t\t\t\ttype: ANIME\n\t\t\t\tseason: $season\n\t\t\t\tseasonYear: $year\n\t\t\t\tisAdult: false\n\t\t\t\tsort: [SCORE_DESC, POPULARITY_DESC]\n\t\t\t) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t\tpopular: Page(perPage: 10) {\n\t\t\tmedia(\n\t\t\t\ttype: ANIME\n\t\t\t\tseason: $season\n\t\t\t\tseasonYear: $year\n\t\t\t\tisAdult: false\n\t\t\t\tsort: POPULARITY_DESC\n\t\t\t) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t\tnext: Page(perPage: 12) {\n\t\t\tmedia(\n\t\t\t\ttype: ANIME\n\t\t\t\tseason: $nextSeason\n\t\t\t\tseasonYear: $nextYear\n\t\t\t\tisAdult: false\n\t\t\t\tsort: POPULARITY_DESC\n\t\t\t) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t}\n": typeof types.HomeDocument,
    "\n\tquery AiringWindow($from: Int!, $to: Int!, $page: Int!) {\n\t\tPage(page: $page, perPage: 50) {\n\t\t\tpageInfo {\n\t\t\t\thasNextPage\n\t\t\t}\n\t\t\tairingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: [TIME, ID]) {\n\t\t\t\tepisode\n\t\t\t\tairingAt\n\t\t\t\tmedia {\n\t\t\t\t\t...MediaCard\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n": typeof types.AiringWindowDocument,
    "\n\tquery Season($season: MediaSeason!, $year: Int!, $page: Int!) {\n\t\tPage(page: $page, perPage: 50) {\n\t\t\tpageInfo {\n\t\t\t\thasNextPage\n\t\t\t}\n\t\t\tmedia(\n\t\t\t\ttype: ANIME\n\t\t\t\tseason: $season\n\t\t\t\tseasonYear: $year\n\t\t\t\tisAdult: false\n\t\t\t\tsort: [POPULARITY_DESC, ID]\n\t\t\t) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t}\n": typeof types.SeasonDocument,
    "\n\tquery MediaByIds($ids: [Int]!) {\n\t\tPage(perPage: 50) {\n\t\t\tpageInfo {\n\t\t\t\thasNextPage\n\t\t\t}\n\t\t\tmedia(id_in: $ids, type: ANIME) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t}\n": typeof types.MediaByIdsDocument,
    "\n\tquery MediaDetail($id: Int!) {\n\t\tMedia(id: $id, type: ANIME) {\n\t\t\t...MediaCard\n\t\t\ttitle {\n\t\t\t\tnative\n\t\t\t}\n\t\t\tdescription(asHtml: false)\n\t\t\tstudios(isMain: true) {\n\t\t\t\tnodes {\n\t\t\t\t\tid\n\t\t\t\t\tname\n\t\t\t\t}\n\t\t\t}\n\t\t\tduration\n\t\t\tsource\n\t\t\tseason\n\t\t\tseasonYear\n\t\t\tendDate {\n\t\t\t\tyear\n\t\t\t\tmonth\n\t\t\t\tday\n\t\t\t}\n\t\t\ttrailer {\n\t\t\t\tid\n\t\t\t\tsite\n\t\t\t}\n\t\t\trelations {\n\t\t\t\tedges {\n\t\t\t\t\trelationType\n\t\t\t\t\tnode {\n\t\t\t\t\t\tid\n\t\t\t\t\t\ttype\n\t\t\t\t\t\tformat\n\t\t\t\t\t\ttitle {\n\t\t\t\t\t\t\tromaji\n\t\t\t\t\t\t\tenglish\n\t\t\t\t\t\t}\n\t\t\t\t\t\tcoverImage {\n\t\t\t\t\t\t\tlarge\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n": typeof types.MediaDetailDocument,
};
const documents: Documents = {
    "\n\tfragment MediaCard on Media {\n\t\tid\n\t\ttitle {\n\t\t\tromaji\n\t\t\tenglish\n\t\t}\n\t\tcoverImage {\n\t\t\tlarge\n\t\t\textraLarge\n\t\t\tcolor\n\t\t}\n\t\tbannerImage\n\t\tformat\n\t\tstatus\n\t\tepisodes\n\t\taverageScore\n\t\tpopularity\n\t\tgenres\n\t\tstartDate {\n\t\t\tyear\n\t\t\tmonth\n\t\t\tday\n\t\t}\n\t\tnextAiringEpisode {\n\t\t\tepisode\n\t\t\tairingAt\n\t\t}\n\t\tisAdult\n\t}\n": types.MediaCardFragmentDoc,
    "\n\tquery Home($season: MediaSeason!, $year: Int!, $nextSeason: MediaSeason!, $nextYear: Int!) {\n\t\ttrending: Page(perPage: 12) {\n\t\t\tmedia(type: ANIME, status: RELEASING, isAdult: false, sort: TRENDING_DESC) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t\tscored: Page(perPage: 25) {\n\t\t\tmedia(\n\t\t\t\ttype: ANIME\n\t\t\t\tseason: $season\n\t\t\t\tseasonYear: $year\n\t\t\t\tisAdult: false\n\t\t\t\tsort: [SCORE_DESC, POPULARITY_DESC]\n\t\t\t) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t\tpopular: Page(perPage: 10) {\n\t\t\tmedia(\n\t\t\t\ttype: ANIME\n\t\t\t\tseason: $season\n\t\t\t\tseasonYear: $year\n\t\t\t\tisAdult: false\n\t\t\t\tsort: POPULARITY_DESC\n\t\t\t) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t\tnext: Page(perPage: 12) {\n\t\t\tmedia(\n\t\t\t\ttype: ANIME\n\t\t\t\tseason: $nextSeason\n\t\t\t\tseasonYear: $nextYear\n\t\t\t\tisAdult: false\n\t\t\t\tsort: POPULARITY_DESC\n\t\t\t) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t}\n": types.HomeDocument,
    "\n\tquery AiringWindow($from: Int!, $to: Int!, $page: Int!) {\n\t\tPage(page: $page, perPage: 50) {\n\t\t\tpageInfo {\n\t\t\t\thasNextPage\n\t\t\t}\n\t\t\tairingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: [TIME, ID]) {\n\t\t\t\tepisode\n\t\t\t\tairingAt\n\t\t\t\tmedia {\n\t\t\t\t\t...MediaCard\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n": types.AiringWindowDocument,
    "\n\tquery Season($season: MediaSeason!, $year: Int!, $page: Int!) {\n\t\tPage(page: $page, perPage: 50) {\n\t\t\tpageInfo {\n\t\t\t\thasNextPage\n\t\t\t}\n\t\t\tmedia(\n\t\t\t\ttype: ANIME\n\t\t\t\tseason: $season\n\t\t\t\tseasonYear: $year\n\t\t\t\tisAdult: false\n\t\t\t\tsort: [POPULARITY_DESC, ID]\n\t\t\t) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t}\n": types.SeasonDocument,
    "\n\tquery MediaByIds($ids: [Int]!) {\n\t\tPage(perPage: 50) {\n\t\t\tpageInfo {\n\t\t\t\thasNextPage\n\t\t\t}\n\t\t\tmedia(id_in: $ids, type: ANIME) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t}\n": types.MediaByIdsDocument,
    "\n\tquery MediaDetail($id: Int!) {\n\t\tMedia(id: $id, type: ANIME) {\n\t\t\t...MediaCard\n\t\t\ttitle {\n\t\t\t\tnative\n\t\t\t}\n\t\t\tdescription(asHtml: false)\n\t\t\tstudios(isMain: true) {\n\t\t\t\tnodes {\n\t\t\t\t\tid\n\t\t\t\t\tname\n\t\t\t\t}\n\t\t\t}\n\t\t\tduration\n\t\t\tsource\n\t\t\tseason\n\t\t\tseasonYear\n\t\t\tendDate {\n\t\t\t\tyear\n\t\t\t\tmonth\n\t\t\t\tday\n\t\t\t}\n\t\t\ttrailer {\n\t\t\t\tid\n\t\t\t\tsite\n\t\t\t}\n\t\t\trelations {\n\t\t\t\tedges {\n\t\t\t\t\trelationType\n\t\t\t\t\tnode {\n\t\t\t\t\t\tid\n\t\t\t\t\t\ttype\n\t\t\t\t\t\tformat\n\t\t\t\t\t\ttitle {\n\t\t\t\t\t\t\tromaji\n\t\t\t\t\t\t\tenglish\n\t\t\t\t\t\t}\n\t\t\t\t\t\tcoverImage {\n\t\t\t\t\t\t\tlarge\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n": types.MediaDetailDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tfragment MediaCard on Media {\n\t\tid\n\t\ttitle {\n\t\t\tromaji\n\t\t\tenglish\n\t\t}\n\t\tcoverImage {\n\t\t\tlarge\n\t\t\textraLarge\n\t\t\tcolor\n\t\t}\n\t\tbannerImage\n\t\tformat\n\t\tstatus\n\t\tepisodes\n\t\taverageScore\n\t\tpopularity\n\t\tgenres\n\t\tstartDate {\n\t\t\tyear\n\t\t\tmonth\n\t\t\tday\n\t\t}\n\t\tnextAiringEpisode {\n\t\t\tepisode\n\t\t\tairingAt\n\t\t}\n\t\tisAdult\n\t}\n"): (typeof documents)["\n\tfragment MediaCard on Media {\n\t\tid\n\t\ttitle {\n\t\t\tromaji\n\t\t\tenglish\n\t\t}\n\t\tcoverImage {\n\t\t\tlarge\n\t\t\textraLarge\n\t\t\tcolor\n\t\t}\n\t\tbannerImage\n\t\tformat\n\t\tstatus\n\t\tepisodes\n\t\taverageScore\n\t\tpopularity\n\t\tgenres\n\t\tstartDate {\n\t\t\tyear\n\t\t\tmonth\n\t\t\tday\n\t\t}\n\t\tnextAiringEpisode {\n\t\t\tepisode\n\t\t\tairingAt\n\t\t}\n\t\tisAdult\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery Home($season: MediaSeason!, $year: Int!, $nextSeason: MediaSeason!, $nextYear: Int!) {\n\t\ttrending: Page(perPage: 12) {\n\t\t\tmedia(type: ANIME, status: RELEASING, isAdult: false, sort: TRENDING_DESC) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t\tscored: Page(perPage: 25) {\n\t\t\tmedia(\n\t\t\t\ttype: ANIME\n\t\t\t\tseason: $season\n\t\t\t\tseasonYear: $year\n\t\t\t\tisAdult: false\n\t\t\t\tsort: [SCORE_DESC, POPULARITY_DESC]\n\t\t\t) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t\tpopular: Page(perPage: 10) {\n\t\t\tmedia(\n\t\t\t\ttype: ANIME\n\t\t\t\tseason: $season\n\t\t\t\tseasonYear: $year\n\t\t\t\tisAdult: false\n\t\t\t\tsort: POPULARITY_DESC\n\t\t\t) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t\tnext: Page(perPage: 12) {\n\t\t\tmedia(\n\t\t\t\ttype: ANIME\n\t\t\t\tseason: $nextSeason\n\t\t\t\tseasonYear: $nextYear\n\t\t\t\tisAdult: false\n\t\t\t\tsort: POPULARITY_DESC\n\t\t\t) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery Home($season: MediaSeason!, $year: Int!, $nextSeason: MediaSeason!, $nextYear: Int!) {\n\t\ttrending: Page(perPage: 12) {\n\t\t\tmedia(type: ANIME, status: RELEASING, isAdult: false, sort: TRENDING_DESC) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t\tscored: Page(perPage: 25) {\n\t\t\tmedia(\n\t\t\t\ttype: ANIME\n\t\t\t\tseason: $season\n\t\t\t\tseasonYear: $year\n\t\t\t\tisAdult: false\n\t\t\t\tsort: [SCORE_DESC, POPULARITY_DESC]\n\t\t\t) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t\tpopular: Page(perPage: 10) {\n\t\t\tmedia(\n\t\t\t\ttype: ANIME\n\t\t\t\tseason: $season\n\t\t\t\tseasonYear: $year\n\t\t\t\tisAdult: false\n\t\t\t\tsort: POPULARITY_DESC\n\t\t\t) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t\tnext: Page(perPage: 12) {\n\t\t\tmedia(\n\t\t\t\ttype: ANIME\n\t\t\t\tseason: $nextSeason\n\t\t\t\tseasonYear: $nextYear\n\t\t\t\tisAdult: false\n\t\t\t\tsort: POPULARITY_DESC\n\t\t\t) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery AiringWindow($from: Int!, $to: Int!, $page: Int!) {\n\t\tPage(page: $page, perPage: 50) {\n\t\t\tpageInfo {\n\t\t\t\thasNextPage\n\t\t\t}\n\t\t\tairingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: [TIME, ID]) {\n\t\t\t\tepisode\n\t\t\t\tairingAt\n\t\t\t\tmedia {\n\t\t\t\t\t...MediaCard\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery AiringWindow($from: Int!, $to: Int!, $page: Int!) {\n\t\tPage(page: $page, perPage: 50) {\n\t\t\tpageInfo {\n\t\t\t\thasNextPage\n\t\t\t}\n\t\t\tairingSchedules(airingAt_greater: $from, airingAt_lesser: $to, sort: [TIME, ID]) {\n\t\t\t\tepisode\n\t\t\t\tairingAt\n\t\t\t\tmedia {\n\t\t\t\t\t...MediaCard\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery Season($season: MediaSeason!, $year: Int!, $page: Int!) {\n\t\tPage(page: $page, perPage: 50) {\n\t\t\tpageInfo {\n\t\t\t\thasNextPage\n\t\t\t}\n\t\t\tmedia(\n\t\t\t\ttype: ANIME\n\t\t\t\tseason: $season\n\t\t\t\tseasonYear: $year\n\t\t\t\tisAdult: false\n\t\t\t\tsort: [POPULARITY_DESC, ID]\n\t\t\t) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery Season($season: MediaSeason!, $year: Int!, $page: Int!) {\n\t\tPage(page: $page, perPage: 50) {\n\t\t\tpageInfo {\n\t\t\t\thasNextPage\n\t\t\t}\n\t\t\tmedia(\n\t\t\t\ttype: ANIME\n\t\t\t\tseason: $season\n\t\t\t\tseasonYear: $year\n\t\t\t\tisAdult: false\n\t\t\t\tsort: [POPULARITY_DESC, ID]\n\t\t\t) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery MediaByIds($ids: [Int]!) {\n\t\tPage(perPage: 50) {\n\t\t\tpageInfo {\n\t\t\t\thasNextPage\n\t\t\t}\n\t\t\tmedia(id_in: $ids, type: ANIME) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery MediaByIds($ids: [Int]!) {\n\t\tPage(perPage: 50) {\n\t\t\tpageInfo {\n\t\t\t\thasNextPage\n\t\t\t}\n\t\t\tmedia(id_in: $ids, type: ANIME) {\n\t\t\t\t...MediaCard\n\t\t\t}\n\t\t}\n\t}\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n\tquery MediaDetail($id: Int!) {\n\t\tMedia(id: $id, type: ANIME) {\n\t\t\t...MediaCard\n\t\t\ttitle {\n\t\t\t\tnative\n\t\t\t}\n\t\t\tdescription(asHtml: false)\n\t\t\tstudios(isMain: true) {\n\t\t\t\tnodes {\n\t\t\t\t\tid\n\t\t\t\t\tname\n\t\t\t\t}\n\t\t\t}\n\t\t\tduration\n\t\t\tsource\n\t\t\tseason\n\t\t\tseasonYear\n\t\t\tendDate {\n\t\t\t\tyear\n\t\t\t\tmonth\n\t\t\t\tday\n\t\t\t}\n\t\t\ttrailer {\n\t\t\t\tid\n\t\t\t\tsite\n\t\t\t}\n\t\t\trelations {\n\t\t\t\tedges {\n\t\t\t\t\trelationType\n\t\t\t\t\tnode {\n\t\t\t\t\t\tid\n\t\t\t\t\t\ttype\n\t\t\t\t\t\tformat\n\t\t\t\t\t\ttitle {\n\t\t\t\t\t\t\tromaji\n\t\t\t\t\t\t\tenglish\n\t\t\t\t\t\t}\n\t\t\t\t\t\tcoverImage {\n\t\t\t\t\t\t\tlarge\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n"): (typeof documents)["\n\tquery MediaDetail($id: Int!) {\n\t\tMedia(id: $id, type: ANIME) {\n\t\t\t...MediaCard\n\t\t\ttitle {\n\t\t\t\tnative\n\t\t\t}\n\t\t\tdescription(asHtml: false)\n\t\t\tstudios(isMain: true) {\n\t\t\t\tnodes {\n\t\t\t\t\tid\n\t\t\t\t\tname\n\t\t\t\t}\n\t\t\t}\n\t\t\tduration\n\t\t\tsource\n\t\t\tseason\n\t\t\tseasonYear\n\t\t\tendDate {\n\t\t\t\tyear\n\t\t\t\tmonth\n\t\t\t\tday\n\t\t\t}\n\t\t\ttrailer {\n\t\t\t\tid\n\t\t\t\tsite\n\t\t\t}\n\t\t\trelations {\n\t\t\t\tedges {\n\t\t\t\t\trelationType\n\t\t\t\t\tnode {\n\t\t\t\t\t\tid\n\t\t\t\t\t\ttype\n\t\t\t\t\t\tformat\n\t\t\t\t\t\ttitle {\n\t\t\t\t\t\t\tromaji\n\t\t\t\t\t\t\tenglish\n\t\t\t\t\t\t}\n\t\t\t\t\t\tcoverImage {\n\t\t\t\t\t\t\tlarge\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;