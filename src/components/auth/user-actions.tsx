import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOidc } from "@/oidc";
import { AlertCircle } from "lucide-react";
import { parseKeycloakIssuerUri } from "oidc-spa/tools/parseKeycloakIssuerUri";
import { Link } from "react-router";

/**
 * Keycloak Application-Initiated Actions (AIA).
 *
 * An AIA sends the logged-in user to the auth server with a `kc_action`
 * query parameter. Keycloak runs that required action and redirects
 * back to the app with `kc_action_status` set to `success`, `cancelled`
 * or `error`.
 *
 * Each action has to be enabled in the realm (Authentication > Required
 * actions). See the README for details.
 * https://www.keycloak.org/docs/latest/server_admin/index.html#con-aia_server_administration_guide
 *
 * To add another action, add an entry with its required-action alias.
 */
const APPLICATION_INITIATED_ACTIONS = [
  { label: "Change password", kcAction: "UPDATE_PASSWORD" },
  { label: "Update profile", kcAction: "UPDATE_PROFILE" },
  { label: "Set up OTP", kcAction: "CONFIGURE_TOTP" },
  { label: "Register security key", kcAction: "webauthn-register" },
  {
    label: "Register passkey (passwordless)",
    kcAction: "webauthn-register-passwordless",
  },
  { label: "Delete account", kcAction: "delete_account" },
] as const;

export function UserActions() {
  // Here we can safely assume that the user is logged in.
  const {
    goToAuthServer,
    backFromAuthServer,
    renewTokens,
    params: { issuerUri, clientId },
  } = useOidc({
    assert: "user logged in",
  });

  const parsedKeycloakIssuerUri = parseKeycloakIssuerUri(issuerUri);

  const kcActionStatus = backFromAuthServer?.result.kc_action_status;
  const kcAction = backFromAuthServer?.extraQueryParams.kc_action;
  const kcActionLabel =
    APPLICATION_INITIATED_ACTIONS.find((a) => a.kcAction === kcAction)?.label ??
    kcAction;

  return (
    <div>
      <h3 className="mb-2 font-semibold">User Actions</h3>
      {kcActionStatus !== undefined && (
        <Alert className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {kcActionLabel !== undefined
              ? `Action "${kcActionLabel}" finished`
              : "Action finished"}
          </AlertTitle>
          <AlertDescription className="flex items-center gap-2">
            {kcAction !== undefined && <code>{kcAction}</code>}
            <span>Result:</span>
            <Badge>{kcActionStatus}</Badge>
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => renewTokens()}>
          Renew tokens
        </Button>
        {parsedKeycloakIssuerUri !== undefined && (
          <>
            {APPLICATION_INITIATED_ACTIONS.map(({ label, kcAction }) => (
              <Button
                key={kcAction}
                variant="secondary"
                onClick={() =>
                  goToAuthServer({
                    extraQueryParams: { kc_action: kcAction },
                  })
                }
              >
                {label}
              </Button>
            ))}
            <Button variant="secondary" asChild>
              <Link
                to={parsedKeycloakIssuerUri.getAccountUrl({
                  clientId,
                  backToAppFromAccountUrl: import.meta.env.BASE_URL,
                })}
              >
                Go to Auth.it Account Management Console
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
