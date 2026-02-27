import { TalkToAgent } from "./_components/TalkToAgent";
import { nanoid } from "nanoid";

export default async function Call({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const { agent, companyId, userId } = await searchParams;
  let route: string;
  let headers: Record<string, string>;

  switch (agent) {
    case "user":
      if (!companyId || !userId) {
        return <>Invalid request</>
      }
      route = "/api/user-agent";
      headers = {
        "company-id": companyId!,
        "user-id": userId!
      }
      return (
        <div>
          <TalkToAgent route={route} headers={headers} />
        </div>
      )
    case "company":
      if (!companyId) {
        return <>Invalid request</>
      }
      route = "/api/company-agent";
      headers = {
        "company-id": companyId!,
      }
      return (
        <div>
          <TalkToAgent route={route} headers={headers} />
        </div>
      )
    default:
      route = "/api/bharathi-agent";
      headers = {
        "visitor-id": nanoid(),
      }
      return (
        <div>
          <TalkToAgent route={route} headers={headers} />
        </div>
      )
  }
}