import twilio from "twilio";

const client = twilio(
   process.env.TWILIO_ACCOUNT_SID!,
   process.env.TWILIO_AUTH_TOKEN!
);

export async function POST(req: Request) {

   try {
      const formData = await req.formData();

      const digit = formData.get("Digits");

      const url = new URL(req.url);

      const items = url.searchParams.get("items");
      const address = url.searchParams.get("address");
      const deliveryPhone = url.searchParams.get("deliveryPhone");
      const customerName = url.searchParams.get("customerName");
      const customerPhone = url.searchParams.get("customerPhone");
      const price = url.searchParams.get("price");

      const VoiceResponse = twilio.twiml.VoiceResponse;
      const twiml = new VoiceResponse();

      // ACCEPTED
      if (digit === "1") {
         if (!customerPhone) {
            throw new Error("Customer phone number is missing.");
         }
         const formattedCustomerPhone =
            customerPhone.startsWith("+")
               ? customerPhone
               : `+${customerPhone}`;
         console.log("Sending SMS to customer at", formattedCustomerPhone);
         await client.messages.create({
            to: formattedCustomerPhone,
            from: process.env.TWILIO_PHONE_NUMBER!,
            body: `Hello ${customerName},
Your order is confirmed.
Items: ${items}
Address: ${address}
Pay here:
upi://pay?pa=${process.env.UPI_ID}&pn=BHARATHU AI&am=${price}&cu=INR`
         });
         const formattedDeliveryPhone =
            deliveryPhone && deliveryPhone.startsWith("+")
               ? deliveryPhone
               : deliveryPhone
                  ? `+${deliveryPhone}`
                  : undefined;

         if (!formattedDeliveryPhone) {
            throw new Error("Delivery phone number is missing or invalid.");
         }
         console.log("1Sending SMS to delivery person at", formattedDeliveryPhone);
         await client.messages.create({
            to: formattedDeliveryPhone,
            from: process.env.TWILIO_PHONE_NUMBER!,
            body:
               `New Delivery Assigned

Customer: ${customerName}
Phone: ${customerPhone}

Items:
${items}

Address:
${address}`
         });
         twiml.say("Order confirmed. Thank you for using our service.");
      }


      else if (digit === "2") {
         twiml.say("Order rejected. Thank you for using our service.");
      }
      else {
         twiml.say("Invalid input.");
      }

      twiml.hangup();

      return new Response(twiml.toString(), {
         headers: {
            "Content-Type": "text/xml",
         },
      });
   } catch (error) {
      console.error("Error processing delivery response:", error);
      return new Response("Internal Server Error", { status: 500 });
   }
}