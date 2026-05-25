import { env } from "@/shared/config/env";
import { requestJson } from "@/shared/services/api/httpClient";

export function sendVisitorWhatsappAlert(payload) {
  return requestJson(env.visitorAlertEndpoint, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
