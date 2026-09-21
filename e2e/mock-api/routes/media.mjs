import { authed, json, uid, validationFailed } from "../helpers.mjs";

/** S3-backed uploads. The mock hands back plausible URLs, nothing more. */
export const mediaRoutes = [
  {
    method: "POST",
    path: "/media/upload/image",
    handler: authed(({ res }) =>
      json(res, 201, { url: `https://cdn.test/uploads/${uid("img")}.png` }),
    "media:upload:own"),
  },
  {
    method: "POST",
    path: "/media/upload/array-of-images",
    handler: authed(({ res }) =>
      json(res, 201, {
        urls: [
          `https://cdn.test/uploads/${uid("img")}.png`,
          `https://cdn.test/uploads/${uid("img")}.png`,
        ],
      }),
    "media:upload:own"),
  },
  {
    method: "POST",
    path: "/media/upload/multiple-images",
    handler: authed(({ res }) =>
      json(res, 201, { urls: [`https://cdn.test/uploads/${uid("img")}.png`] }),
    "media:upload:own"),
  },
  {
    method: "GET",
    path: "/media/presigned-url",
    handler: authed(({ res, query }) =>
      json(res, 200, {
        url: `https://cdn.test/presigned/${encodeURIComponent(query.get("key") ?? "")}`,
      }),
    "media:upload:own"),
  },
  {
    method: "DELETE",
    path: "/media/delete",
    handler: authed(({ res, query }) => {
      if (!query.get("key")) {
        return validationFailed(res, [
          { field: "key", code: "isNotEmpty", message: "Key is required." },
        ]);
      }

      return json(res, 200, { message: "Deleted." });
    }, "media:delete:any"),
  },
];
