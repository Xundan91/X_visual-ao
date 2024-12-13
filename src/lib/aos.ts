import { GOLD_SKY_GQL } from "./constants";

export async function findMyPIDs(owner: any, length?: number, cursor?: string, pName?: string) {
    const processes = await fetch(GOLD_SKY_GQL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: findMyPIDsQuery(owner, length, cursor, pName)
        })
    });

    const data = await processes.json();
    if (data.errors) {
        throw new Error(data.errors[0].message)
    }

    return data.data?.transactions?.edges?.map((x: any) => {
        // x.node.id
        const processName = x.node.tags.find((tag: any) => tag.name === "Name")?.value;
        return {
            id: x.node.id,
            name: processName,
            cursor: x.cursor
        }
    });
}

function findMyPIDsQuery(owner: string, length?: number, cursor?: string, pName?: string) {
    return `query {
        transactions(owners: ["${owner}"], tags: [
          {name: "Type", values: ["Process"]},
          {name: "Variant", values: ["ao.TN.1"]},
          {name: "Data-Protocol", values: ["ao"]},
          ${pName ? `{name: "Name", values: ["${pName}"], match: FUZZY_OR}` : ""}
         ],
        sort: HEIGHT_DESC,
        first: ${length || 11},
        ${cursor ? `after: "${cursor}"` : ""}
        )
        {
          edges {
            cursor
            node {
              id,
              tags{
                name,
                value
              }
            }
          }
        }
      }`
}