import {
  authed,
  byKeyword,
  json,
  notFound,
  page,
  readJson,
  sortRows,
  uid,
  validationFailed,
} from "../helpers.mjs";

const publicUser = ({ password: _password, twoFactorEnabled: _tfa, ...user }) => user;

/** Users, roles, permissions and media — the administration namespaces. */
export const adminRoutes = [
  {
    method: "GET",
    path: "/users",
    handler: authed(({ state, res, query }) => {
      const rows = sortRows(
        byKeyword(state.users, query.get("keyword"), ["name", "email"]),
        query.get("orderBy"),
        query.get("order"),
      ).map(publicUser);

      return page(res, rows, query);
    }, "user:read:any"),
  },
  {
    method: "POST",
    path: "/users",
    handler: authed(async ({ state, req, res }) => {
      const body = await readJson(req);

      if (state.users.some((item) => item.email === body.email)) {
        return validationFailed(res, [
          { field: "email", code: "isUnique", message: "Email already exists." },
        ]);
      }

      const user = {
        id: uid("user"),
        email: body.email,
        password: body.password,
        name: body.name,
        phoneNumber: body.phoneNumber,
        avatar: body.avatar ?? null,
        status: body.status ?? "ACTIVE",
        role: state.roles.find((role) => role.id === body.roleId) ?? state.roles[1],
        twoFactorEnabled: false,
      };

      state.users.push(user);

      return json(res, 201, publicUser(user));
    }, "user:create:any"),
  },
  {
    method: "GET",
    path: "/users/:id",
    handler: authed(({ state, res, params }) => {
      const user = state.users.find((item) => item.id === params.id);

      return user ? json(res, 200, publicUser(user)) : notFound(res, "User not found.");
    }, "user:read:any"),
  },
  {
    method: "PUT",
    path: "/users/:id",
    handler: authed(async ({ state, req, res, params }) => {
      const user = state.users.find((item) => item.id === params.id);

      if (!user) return notFound(res, "User not found.");

      const body = await readJson(req);

      Object.assign(user, {
        name: body.name ?? user.name,
        phoneNumber: body.phoneNumber ?? user.phoneNumber,
        avatar: body.avatar ?? user.avatar,
        status: body.status ?? user.status,
        role: state.roles.find((role) => role.id === body.roleId) ?? user.role,
        password: body.password || user.password,
      });

      return json(res, 200, publicUser(user));
    }, "user:create:any"),
  },
  {
    method: "DELETE",
    path: "/users/:id",
    handler: authed(({ state, res, params }) => {
      const index = state.users.findIndex((item) => item.id === params.id);

      if (index < 0) return notFound(res, "User not found.");

      state.users.splice(index, 1);

      return json(res, 200, { message: "Deleted." });
    }, "user:delete:any"),
  },
  {
    method: "GET",
    path: "/roles",
    handler: authed(({ state, res, query }) => {
      const rows = byKeyword(state.roles, query.get("keyword")).map(
        ({ permissions: _permissions, ...role }) => role,
      );

      return page(res, rows, query);
    }, "role:read:any"),
  },
  {
    method: "POST",
    path: "/roles",
    handler: authed(async ({ state, req, res }) => {
      const body = await readJson(req);

      if (!body.name) {
        return validationFailed(res, [
          { field: "name", code: "isNotEmpty", message: "Name is required." },
        ]);
      }

      const role = {
        id: uid("role"),
        name: body.name,
        description: body.description ?? "",
        isActive: body.isActive ?? true,
        isSystem: false,
        permissions: state.permissions.filter((item) =>
          (body.permissionIds ?? []).includes(item.id),
        ),
      };

      state.roles.push(role);

      return json(res, 201, role);
    }, "role:create:any"),
  },
  {
    method: "GET",
    path: "/roles/:id",
    handler: authed(({ state, res, params }) => {
      const role = state.roles.find((item) => item.id === params.id);

      return role ? json(res, 200, role) : notFound(res, "Role not found.");
    }, "role:read:any"),
  },
  {
    method: "PUT",
    path: "/roles/:id",
    handler: authed(async ({ state, req, res, params }) => {
      const role = state.roles.find((item) => item.id === params.id);

      if (!role) return notFound(res, "Role not found.");

      const body = await readJson(req);

      Object.assign(role, {
        name: body.name,
        description: body.description ?? role.description,
        isActive: body.isActive ?? role.isActive,
        permissions: state.permissions.filter((item) =>
          (body.permissionIds ?? []).includes(item.id),
        ),
      });

      return json(res, 200, role);
    }, "role:update:any"),
  },
  {
    method: "DELETE",
    path: "/roles/:id",
    handler: authed(({ state, res, params }) => {
      const role = state.roles.find((item) => item.id === params.id);

      if (!role) return notFound(res, "Role not found.");
      if (role.isSystem) {
        return validationFailed(res, [
          { field: "id", code: "isSystem", message: "System roles cannot be deleted." },
        ]);
      }

      state.roles.splice(state.roles.indexOf(role), 1);

      return json(res, 200, { message: "Deleted." });
    }, "role:delete:any"),
  },
  {
    method: "GET",
    path: "/permissions",
    handler: authed(({ state, res, query }) => {
      const rows = byKeyword(state.permissions, query.get("keyword"), [
        "key",
        "resource",
      ]).map((permission) => ({
        ...permission,
        roles: state.roles
          .filter((role) => role.permissions.some((item) => item.id === permission.id))
          .map(({ permissions: _permissions, ...role }) => role),
      }));

      return page(res, rows, query);
    }, "permission:read:any"),
  },
  {
    method: "GET",
    path: "/permissions/:id",
    handler: authed(({ state, res, params }) => {
      const permission = state.permissions.find((item) => item.id === params.id);

      return permission
        ? json(res, 200, { ...permission, roles: [] })
        : notFound(res, "Permission not found.");
    }, "permission:read:any"),
  },
];
