import OrdersManagement from "@/components/pages/restaurant/orders";

export const metadata = {
    title: "Orders | QR Menu System",
    description: "Manage restaurant orders and track their statuses.",
};

export default function OrdersPage() {
    return <OrdersManagement />;
}
