import { listAdminSubscriptions } from "@/app/_lib/api/fetch-generated";
import { readAdmin } from "../_lib/server";
import { SubscriptionsList } from "../_components/subscriptions-list";
export default async function SubscriptionsPage() { return <SubscriptionsList initial={await readAdmin(listAdminSubscriptions({}, { cache: "no-store" }))}/>; }
