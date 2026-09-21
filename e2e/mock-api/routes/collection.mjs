import {
  authed,
  byKeyword,
  json,
  notFound,
  page,
  readJson,
  sortRows,
} from "../helpers.mjs";

/** CRUD shared by brands, categories, languages and the translation tables. */
export function collection({ key, idField = "id", create, update, readPermission, writePermission }) {
  return [
    {
      method: "GET",
      path: `/${key}`,
      handler: authed(({ state, res, query }) => {
        const rows = sortRows(
          byKeyword(state[camel(key)], query.get("keyword")),
          query.get("orderBy"),
          query.get("order"),
        );

        return page(res, rows, query);
      }, readPermission),
    },
    {
      method: "POST",
      path: `/${key}`,
      handler: authed(async ({ state, req, res }) => {
        const body = await readJson(req);
        const row = create(body, state);

        state[camel(key)].push(row);

        return json(res, 201, row);
      }, writePermission),
    },
    {
      method: "GET",
      path: `/${key}/:id`,
      handler: authed(({ state, res, params }) => {
        const row = state[camel(key)].find((item) => item[idField] === params.id);

        return row ? json(res, 200, row) : notFound(res);
      }, readPermission),
    },
    {
      method: "PUT",
      path: `/${key}/:id`,
      handler: authed(async ({ state, req, res, params }) => {
        const row = state[camel(key)].find((item) => item[idField] === params.id);

        if (!row) return notFound(res);

        Object.assign(row, update(await readJson(req), state, row));

        return json(res, 200, row);
      }, writePermission),
    },
    {
      method: "DELETE",
      path: `/${key}/:id`,
      handler: authed(({ state, res, params }) => {
        const rows = state[camel(key)];
        const index = rows.findIndex((item) => item[idField] === params.id);

        if (index < 0) return notFound(res);

        rows.splice(index, 1);

        return json(res, 200, { message: "Deleted." });
      }, writePermission),
    },
  ];
}

const camel = (key) => key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
