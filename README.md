# Auth.it + react-router-dom + oidc-spa + Vite

This is a sample application to demonstrate how to quickly and securely protect an application using [OIDC](https://openid.net/developers/how-connect-works/). It uses [react-router-dom](https://reactrouter.com/), [oidc-spa](https://www.oidc-spa.dev/) and [vite](https://vite.dev/) to show you how to secure an provide user identity to a single page application (SPA). Please use this as a basis to start your own applications or protect an existing one.

## Configure your environment

Update the `.env.local` (copy `.env.local.sample`) to connect to your authentication server. If you are coming here from [Auth.it](https://auth.it), you can easily configure by copying the values from the [Dashboard overview](https://dash.auth.it) or the [Applications page](https://dash.auth.it/developer/applications) like this:

```
# ISSUER_URI (Step 2 of the [dashboard overview page](https://dash.auth.it/))
VITE_AUTHIT_ISSUER_URI=https://somename.authit.cloud/realms/somename
# CLIENT_ID (Step 2 of the [dashboard overview page](https://dash.auth.it/))
VITE_AUTHIT_CLIENT_ID=frontend
```

## Set your redirect URI

Depending on your authentication server, you will need to make sure that it is expecting this application by setting an appropriate redirect URI. If you are using Auth.it, go to the [Applications](https://dash.auth.it/developer/applications) section of the dashboard, and add `http://localhost:5173/*` to the list of redirect URIs and save.

## Start the app

```bash
pnpm i
pnpm dev
```

## Application-Initiated Actions (AIA)

When the issuer is Keycloak (including Auth.it), the **User Actions** panel shows buttons that start [Application-Initiated Actions](https://www.keycloak.org/docs/latest/server_admin/index.html#con-aia_server_administration_guide). The app sends the user to the auth server with a `kc_action` query parameter (see `goToAuthServer` in `src/components/auth/user-actions.tsx`). Keycloak runs that required action and redirects back to the app. The app then shows the action and the `kc_action_status` it got back:

- `success`: the user completed the action.
- `cancelled`: the user cancelled the action.
- `error`: the action failed.

The sample includes these actions:

| Button                          | `kc_action`                      | Realm prerequisites                                                                                            |
| ------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Change password                 | `UPDATE_PASSWORD`                | **Update Password** required action enabled                                                                    |
| Update profile                  | `UPDATE_PROFILE`                 | **Update Profile** required action enabled                                                                     |
| Set up OTP                      | `CONFIGURE_TOTP`                 | **Configure OTP** required action enabled                                                                      |
| Register security key           | `webauthn-register`              | **Webauthn Register** required action enabled                                                                  |
| Register passkey (passwordless) | `webauthn-register-passwordless` | **Webauthn Register Passwordless** required action enabled                                                     |
| Delete account                  | `delete_account`                 | **Delete Account** required action enabled, and the user has the `delete-account` role of the `account` client |

Enable required actions in the admin console under **Authentication > Required actions**. To demonstrate another action, add its required-action alias to `APPLICATION_INITIATED_ACTIONS` in `src/components/auth/user-actions.tsx`. For example, `UPDATE_EMAIL` needs the update-email feature enabled on the server.
