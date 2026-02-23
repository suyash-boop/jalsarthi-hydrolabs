const GREENAPI_URL = "https://api.green-api.com";

interface WhatsAppResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<WhatsAppResult> {
  const instanceId = process.env.GREENAPI_INSTANCE_ID;
  const apiToken = process.env.GREENAPI_API_TOKEN;

  if (!instanceId || !apiToken) {
    return { success: false, error: "Green API credentials not configured" };
  }

  // Normalize Indian phone: strip spaces/dashes/+, ensure 91 country code
  const cleaned = to.replace(/[\s\-\+]/g, "");
  const intlPhone = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;

  // Green API expects chatId in format: 91XXXXXXXXXX@c.us
  const chatId = `${intlPhone}@c.us`;

  try {
    const res = await fetch(
      `${GREENAPI_URL}/waInstance${instanceId}/sendMessage/${apiToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, message }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data?.message || "Failed to send WhatsApp message";
      console.error("Green API error:", data);
      return { success: false, error: errMsg };
    }

    return {
      success: true,
      messageId: data.idMessage,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "WhatsApp send failed";
    console.error("WhatsApp send error:", err);
    return { success: false, error: errMsg };
  }
}

export function buildDispatchMessage(params: {
  villageName: string;
  priority: string;
  tankerReg: string;
  tripsAssigned: number;
  villageLat: number;
  villageLng: number;
  sourceLat?: number | null;
  sourceLng?: number | null;
}): string {
  const mapsLink =
    params.sourceLat && params.sourceLng
      ? `https://www.google.com/maps/dir/${params.sourceLat},${params.sourceLng}/${params.villageLat},${params.villageLng}`
      : `https://www.google.com/maps/search/${params.villageLat},${params.villageLng}`;

  return [
    `*JalSarthi Dispatch Alert*`,
    ``,
    `Village: *${params.villageName}*`,
    `Priority: *${params.priority.toUpperCase()}*`,
    `Tanker: ${params.tankerReg}`,
    `Trips Assigned: ${params.tripsAssigned}`,
    ``,
    `Navigate: ${mapsLink}`,
    ``,
    `Please proceed to the village immediately. Contact control room for updates.`,
  ].join("\n");
}
