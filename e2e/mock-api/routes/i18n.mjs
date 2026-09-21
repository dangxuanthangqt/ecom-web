import {
  authed,
  json,
  notFound,
  page,
  readJson,
  uid,
  validationFailed,
} from "../helpers.mjs";
import { collection } from "./collection.mjs";

const translationCollection = (key, targetField, targetCollection) =>
  collection({
    key,
    readPermission: `${key.replace("-translations", "-translation")}:read:any`,
    writePermission: `${key.replace("-translations", "-translation")}:create:any`,
    create: (body, state) => ({
      id: uid("tr"),
      name: body.name,
      description: body.description,
      language: state.languages.find((item) => item.id === body.languageId) ?? null,
      [targetField]:
        state[targetCollection].find((item) => item.id === body[`${targetField}Id`]) ??
        null,
    }),
    update: (body, state) => ({
      name: body.name,
      description: body.description,
      language: state.languages.find((item) => item.id === body.languageId) ?? null,
    }),
  });

/** Languages plus the three translation tables. */
export const i18nRoutes = [
  {
    method: "GET",
    path: "/languages",
    handler: authed(
      ({ state, res, query }) => page(res, state.languages, query),
      "language:read:any",
    ),
  },
  {
    method: "POST",
    path: "/languages/create",
    handler: authed(async ({ state, req, res }) => {
      const body = await readJson(req);

      if (state.languages.some((item) => item.id === body.id)) {
        return validationFailed(res, [
          { field: "id", code: "isUnique", message: "Language code already exists." },
        ]);
      }

      const language = { id: body.id, name: body.name };

      state.languages.push(language);

      return json(res, 201, language);
    }, "language:create:any"),
  },
  {
    method: "PUT",
    path: "/languages/:id",
    handler: authed(async ({ state, req, res, params }) => {
      const language = state.languages.find((item) => item.id === params.id);

      if (!language) return notFound(res);

      language.name = (await readJson(req)).name;

      return json(res, 200, language);
    }, "language:update:any"),
  },
  {
    method: "DELETE",
    path: "/languages/:id",
    handler: authed(({ state, res, params }) => {
      const index = state.languages.findIndex((item) => item.id === params.id);

      if (index < 0) return notFound(res);

      state.languages.splice(index, 1);

      return json(res, 200, { message: "Deleted." });
    }, "language:delete:any"),
  },
  ...translationCollection("brand-translations", "brand", "brands"),
  ...translationCollection("category-translations", "category", "categories"),
  ...translationCollection("product-translations", "product", "products"),
];
