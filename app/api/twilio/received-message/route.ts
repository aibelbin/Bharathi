import twilio from "twilio";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {

 const params = req.nextUrl.searchParams;

 const items = params.get("items");
 const address = params.get("address");
 const deliveryPhone = params.get("deliveryPhone");
 const isDeliverable = params.get("isDeliverable");
 const customerName = params.get("customerName");
 const companyPhone = params.get("companyPhone");
 const customerPhone = params.get("customerPhone");
 const price = params.get("price");

 const VoiceResponse = twilio.twiml.VoiceResponse;
 const twiml = new VoiceResponse();

 // If not deliverable
 if (isDeliverable !== "true") {

  twiml.say(
   { voice: "Polly.Aditi", language: "en-IN" },
   "This order is not deliverable. Thank you."
  );

  twiml.hangup();

  return new Response(twiml.toString(), {
   headers: { "Content-Type": "text/xml" },
  });
 }

 // Gather input
 const gather = twiml.gather({
  numDigits: 1,
  action:
   `/api/twilio/delivery-forward` +
   `?items=${encodeURIComponent(items || "")}` +
   `&address=${encodeURIComponent(address || "")}` +
   `&deliveryPhone=${deliveryPhone}` +
   `&customerName=${encodeURIComponent(customerName || "")}` +
   `&customerPhone=${customerPhone}` +
   `&companyPhone=${companyPhone}` +
   `&price=${price}`,
  method: "POST",
 });

 gather.say(
  {
   voice: "Polly.Aditi",
   language: "en-IN",
  },
  `New delivery order.
   Customer ${customerName}.
   Phone number ${customerPhone}.
   Order includes ${items}.
   Deliver to ${address}.
   Press 1 to accept delivery.
   Press 2 to reject delivery.`
 );

 return new Response(twiml.toString(), {
  headers: {
   "Content-Type": "text/xml",
  },
 });
}