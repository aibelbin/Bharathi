"use client";

import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";

export default function CallDeliveryButton() {

    const callMutation = trpc.caller.callDelivery.useMutation();

    const handleCall = () => {

        callMutation.mutate({
            isDeliverable: true,
            deliveryPhone: "+919961441244",
            companyPhone: "+919961441244",
            customerPhone: "+919961441244",
            customerName: "Abin Thomas",
            address: "MG Road Kochi",
            price: 250,
            items: [
                {
                    name: "Chicken Biryani",
                    quantity: 2,
                },
                {
                    name: "Lime Juice",
                    quantity: 1,
                }
            ]

        });

    };

    return (

        <Button
            onClick={handleCall}
            disabled={callMutation.isPending}
        >

            {callMutation.isPending
                ? "Calling..."
                : "Call Delivery"}

        </Button>

    );
}